const admin = require('firebase-admin');
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { sendChatNotification } = require('./lib/chat-notification');

if ( admin.apps.length === 0 ) {
	admin.initializeApp();
}

// Notifies the recipient when userId sends them a new chat message
exports.onChatMessage = onDocumentCreated({
		document: "chat/{userId}/chat/{recipientId}/messages/{message}",
		maxInstances: 2
	}, (event) => {

	return sendChatNotification(
		{ db: admin.firestore(), messaging: admin.messaging() },
		event.params,
		event.data && event.data.data()
	);
});
