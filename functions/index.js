const admin = require('firebase-admin');
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { sendMessageNotification } = require('./lib/message-notification');

if ( admin.apps.length === 0 ) {
	admin.initializeApp();
}

// Notifies the recipient when userId sends them a new message
exports.onUserMessage = onDocumentCreated({
		document: "messages/{userId}/recipients/{recipientId}/messages/{messageId}",
		maxInstances: 2
	}, (event) => {

	return sendMessageNotification(
		{ db: admin.firestore(), messaging: admin.messaging() },
		event.params,
		event.data && event.data.data()
	);
});
