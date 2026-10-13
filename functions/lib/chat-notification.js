const PREVIEW_LENGTH = 20;

function truncate(text, maxLength = PREVIEW_LENGTH) {
	text = text == null ? '' : String(text);
	if ( text.length > maxLength ) {
		return text.substring(0, maxLength) + '...';
	}
	return text;
}

function buildPayload(fcmToken, message, senderId) {
	return {
		token: fcmToken,
		data: {
			body: truncate(message.message),
			fromId: senderId
		}
	};
}

// Sends a push notification to the recipient of a chat message.
// `db` is a Firestore instance and `messaging` a Messaging instance from firebase-admin.
async function sendChatNotification({ db, messaging }, { userId, recipientId }, message) {
	if ( !message ) {
		return { skipped: 'no-message' };
	}

	const userSnap = await db.collection("users").doc(recipientId).get();
	if ( !userSnap.exists ) {
		throw new Error(`onChatMessage error: user ${recipientId} does not exist`);
	}

	const fcmToken = userSnap.data().fcmToken;
	if ( !fcmToken ) {
		console.log(`onChatMessage info: No FCM token for user ${recipientId}`);
		return { skipped: 'no-token' };
	}

	try {
		// Response is a message ID string.
		const response = await messaging.send(buildPayload(fcmToken, message, userId));
		console.log('Successfully sent message:', response);
		return { success: true, messageId: response };
	} catch (error) {
		console.log('onChatMessage error', error);
		return { error: error.code };
	}
}

module.exports = { PREVIEW_LENGTH, truncate, buildPayload, sendChatNotification };
