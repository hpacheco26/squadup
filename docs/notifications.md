# Push Notifications (FCM)

End-to-end flow for browser + native push.

## 1. Token registration
- [notificationStore.js](../src/store/notificationStore.js) requests permission, then `getToken()` from Firebase Messaging.
- Token is upserted to `fcmTokens/{uid}.tokens[]` (deduplicated).

## 2. Trigger
- App writes a doc to `notifications/{id}` with `recipientIds[]`.
- Cloud Function `sendPushNotification` (see [cloud-functions.md](cloud-functions.md)) fans out FCM messages to every recipient's tokens.

## 3. Foreground handling
- Browsers receive payload via `onMessage()`; the store shows a `new Notification(...)` if permission allows.

## 4. Background / closed tab
- [public/firebase-messaging-sw.js](../public/firebase-messaging-sw.js) handles `setBackgroundMessageHandler` and shows a system notification.
- Service worker scope is set explicitly to avoid PWA conflicts.

## 5. Native (Capacitor)
- Android receives FCM via `google-services.json` (configured at app level).
- iOS requires APNs cert + `GoogleService-Info.plist` (see [mobile-build.md](mobile-build.md)).

## Permissions UX

The app surfaces a permission prompt opportunistically — never on first paint. See `notificationStore.requestPermission`.
