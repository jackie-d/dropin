import { getMessaging, getToken, deleteToken, onMessage, isSupported } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteField, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Saves the FCM token of this browser in users/{uid}.fcmToken, where the onUserMessage
// Cloud Function reads it. One token per user: the last browser that enabled notifications wins.

const module = {

	firebase: null,
	user: null,
	messaging: null,
	vapidKey: '',

	// Returns false when push messaging is unavailable (http, some browsers, private windows)
	init: async function(firebase, user, { vapidKey = '', onForegroundMessage } = {}) {
		this.firebase = firebase;
		this.user = user;
		this.vapidKey = vapidKey;
		this.messaging = null;

		if ( !(await isSupported()) ) {
			return false;
		}

		this.messaging = getMessaging(firebase);
		if ( onForegroundMessage ) {
			onMessage(this.messaging, onForegroundMessage);
		}

		// tokens can change: refresh it on each visit once the user has allowed notifications
		if ( user && Notification.permission == 'granted' ) {
			await this.saveToken().catch((error) => console.log('push token error', error));
		}
		return true;
	},

	isSupported: function() {
		return this.messaging != null;
	},

	// True when the user can be asked to enable notifications
	canAskPermission: function() {
		return this.isSupported() && this.user != null && Notification.permission == 'default';
	},

	// Asks the permission and saves the token. Call it from a user action (e.g. a button click).
	enable: async function() {
		if ( !this.isSupported() || !this.user ) {
			return null;
		}
		const permission = await Notification.requestPermission();
		if ( permission != 'granted' ) {
			return null;
		}
		return this.saveToken();
	},

	saveToken: async function() {
		const token = await getToken(this.messaging, this.getTokenOptions());
		if ( !token ) {
			return null;
		}

		const db = getFirestore(this.firebase);
		await setDoc(doc(db, 'users', this.user.uid), {
			fcmToken: token,
			fcmTokenUpdatedAt: serverTimestamp()
		}, { merge: true });
		return token;
	},

	getTokenOptions: function() {
		return this.vapidKey ? { vapidKey: this.vapidKey } : {};
	},

	// Stops notifications for this browser. Call it before signing out, while Firestore still accepts writes.
	disable: async function() {
		if ( !this.isSupported() || !this.user || Notification.permission != 'granted' ) {
			return;
		}
		try {
			const token = await getToken(this.messaging, this.getTokenOptions());
			const userRef = doc(getFirestore(this.firebase), 'users', this.user.uid);
			const userSnap = await getDoc(userRef);

			// leave the token alone if another browser saved it since
			if ( userSnap.exists() && userSnap.data().fcmToken == token ) {
				await updateDoc(userRef, {
					fcmToken: deleteField(),
					fcmTokenUpdatedAt: deleteField()
				});
			}
			await deleteToken(this.messaging);
		} catch (error) {
			// signing out must not be blocked by this
			console.log('push disable error', error);
		}
	}

};

export default module;
