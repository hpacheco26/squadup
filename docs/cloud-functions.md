# Cloud Functions

Source: [functions/index.js](../functions/index.js). Runtime: Node 20.

## `sendPushNotification` — Firestore trigger
- **Trigger:** `onDocumentCreated('notifications/{notifId}')`
- **Reads:** the new notification, then `fcmTokens/{uid}` for each `recipientIds[]` entry.
- **Sends:** multicast FCM via `admin.messaging().sendEachForMulticast()` with title/body derived from `type`.
- **Cleanup:** removes invalid/expired tokens from `fcmTokens/{uid}.tokens[]`.

## `cleanupAnonymousUsers` — Scheduled
- **Schedule:** every 24 hours.
- **Behavior:** lists Auth users, deletes anonymous accounts older than 24h.
- **Why:** the public game-invite link signs in users anonymously; this prunes the long tail.

## Local development

```pwsh
cd functions
npm install
firebase emulators:start --only functions,firestore,auth
```

## Deployment

```pwsh
firebase deploy --only functions
```
