// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({

});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  // Customize notification here
  // keep in sync with buildChatUrl in js/lib/notifications.js
  const paramName = payload.data.action == 'sending' ? 'from' : 'action';
  const destinationUrl = self.location.origin + '/chat.html?' + paramName + '=' + encodeURIComponent(payload.data.fromId);
  const notificationTitle = 'You got a new message';
  const notificationOptions = {
    body: payload.data.body,
    data: { url: destinationUrl }, //the url which we gonna use later
    actions: [{action: "open_url", title: "Read now"}]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


// Open the chat both when the notification itself and when the "Read now" action is clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data && event.notification.data.url;
  if ( !url ) {
    return;
  }
  event.waitUntil(clients.openWindow(url));
});
