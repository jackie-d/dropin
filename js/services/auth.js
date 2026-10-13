import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import push from "./push.js";

const module = {

	firebase: null,

	user: null,

	// Resolves with the signed-in user, or null, once Firebase has restored the session
	init: function(firebase) {
		this.firebase = firebase;

		const auth = getAuth(firebase);

		const promise = new Promise((resolve) => {
			const unsubscribe = onAuthStateChanged(auth, (user) => {
				// only the initial state is needed: pages reload on login/logout
				unsubscribe();
				this.user = user || null;
				resolve(this.user);
			});
		});

		// handle signout button
		$('.signout-button').on('click', async (event) => {
			event.preventDefault();
			// stop push notifications for this browser while still signed in
			await push.disable();
			return signOut(auth).then(() => {
				this.redirect('./');
			}).catch((error) => {
				console.log(error);
			});
		});

		return promise;
	},

	redirect: function(url) {
		location.href = url;
	}

};

export default module;
