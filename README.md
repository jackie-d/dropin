# Frontend Dropin with Firebase SaaS

### Website for quick bootstrap with framework made in Vanilla JS and Firebase

This website is a web-app ready with advanced functionalities:

- Four pages ready to use (home, profile, signup, login)
- Authentication with signup/login
- Push notification

Design made in Bootstrap v. 5.

# Usage

- Clone the repo locally
- Sign up on [Firebase](https://www.firebase.com/) for a new project and obtain the web configuration
- Copy that into `/js/firebase-loader.js` on its place
- Copy the same configuration into `firebase-messaging-sw.js` for push notifications
- Set your data on the pages home, profile (`index.html`), login, signup
- Serve the folder with any static server, e.g. `npm run serve`

### Push notifications

Setup:

- In the Firebase console, open Project settings > Cloud Messaging > Web Push certificates, generate a key pair and copy the key into `vapidKey` in `/js/firebase-loader.js`
- Publish the rules in `firestore.rules` (Firestore > Rules), so users can save their token in their own `users/{uid}` document

Signed-in users enable notifications with the "Enable notifications" button on the profile page: browsers only allow asking the permission after a user action. The token is then saved in `users/{uid}.fcmToken`, refreshed on each visit and removed on sign out. One token is kept per user: the last browser that enabled notifications receives them.

Send FCM data messages shaped like `{ data: { title, body, url } }`: a toast is shown while the site is open, a system notification otherwise (by `firebase-messaging-sw.js`). `url` is optional and opened when the notification is clicked; only http(s) links are accepted.

### Cloud Functions

`functions/` contains `onUserMessage`: when a user writes a new message to another user under `messages/{userId}/recipients/{recipientId}/messages/{messageId}` (with the text in the `message` field), it sends a push notification to the recipient. The recipient's FCM token is read from `users/{recipientId}.fcmToken`. Set the page to open on click in `getMessageUrl` in `functions/lib/message-notification.js`.

- `cd functions && npm install`
- `npm run deploy` (requires the [Firebase CLI](https://firebase.google.com/docs/cli))

# Tests

Tests use [Vitest](https://vitest.dev/) with jsdom. Firebase SDK imports from the CDN are replaced by stubs in `tests/stubs/`, so no Firebase project is needed.

- `npm install`
- `npm test` to run them once, `npm run test:watch` while developing

### To add pages

- Create a new page on root folder by copying an existing one in case
- Set the id attribute on the body tag to a new identifier
- Create a new Javascript file in `/js/pages/` by copying an existing one in case
- On `js/main.js` create a new case in the routing switch and connect it to a new function copying it from an existing one
- Add tests for it in `tests/unit/`

# GitHub Repository

This dropin is made with the purpose of a quick start for creating new projects

# Creator and contributors

Author Suns Degl'Innocenti a.k.a. Jackie

Software under the MIT license