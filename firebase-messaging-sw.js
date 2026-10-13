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

// keep in sync with getSafeUrl in js/lib/notifications.js
function getSafeUrl(url) {
  if ( !url ) {
    return null;
  }
  try {
    const parsed = new URL(url, self.location.origin);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
  } catch (error) {
    return null;
  }
}

// Expects data messages: { data: { title, body, url } }
messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  const data = payload.data || {};
  const url = getSafeUrl(data.url);

  const notificationOptions = {
    body: data.body || '',
    data: { url: url },
    actions: url ? [{action: "open_url", title: "Open"}] : []
  };

  self.registration.showNotification(data.title || 'New notification', notificationOptions);
});


// Open the link both when the notification itself and when the "Open" action is clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data && event.notification.data.url;
  if ( !url ) {
    return;
  }
  event.waitUntil(clients.openWindow(url));
});
