const PREVIEW_LENGTH = 20;
const NOTIFICATION_TITLE = 'You got a new message';

// Page opened when the notification is clicked, e.g. '/messages.html?from=' + senderId.
// Return null for no link. Relative links are resolved against the website.
function getMessageUrl(senderId) {
	return null;
}

function truncate(text, maxLength = PREVIEW_LENGTH) {
	text = text == null ? '' : String(text);
	if ( text.length > maxLength ) {
		return text.substring(0, maxLength) + '...';
	}
	return text;
}

// Data message in the format handled by js/main.js and firebase-messaging-sw.js
function buildPayload(fcmToken, message, senderId) {
	const data = {
		title: NOTIFICATION_TITLE,
		body: truncate(message.message),
		fromId: senderId
	};
	const url = getMessageUrl(senderId);
	if ( url ) {
		data.url = url;
	}
	return { token: fcmToken, data };
}

// Sends a push notification to the recipient of a user message.
// `db` is a Firestore instance and `messaging` a Messaging instance from firebase-admin.
async function sendMessageNotification({ db, messaging }, { userId, recipientId }, message) {
	if ( !message ) {
		return { skipped: 'no-message' };
	}

	const userSnap = await db.collection("users").doc(recipientId).get();
	if ( !userSnap.exists ) {
		throw new Error(`onUserMessage error: user ${recipientId} does not exist`);
	}

	const fcmToken = userSnap.data().fcmToken;
	if ( !fcmToken ) {
		console.log(`onUserMessage info: No FCM token for user ${recipientId}`);
		return { skipped: 'no-token' };
	}

	try {
		// Response is a message ID string.
		const response = await messaging.send(buildPayload(fcmToken, message, userId));
		console.log('Successfully sent message:', response);
		return { success: true, messageId: response };
	} catch (error) {
		console.log('onUserMessage error', error);
		return { error: error.code };
	}
}

module.exports = { PREVIEW_LENGTH, NOTIFICATION_TITLE, truncate, buildPayload, sendMessageNotification };
