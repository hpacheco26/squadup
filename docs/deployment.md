# Deployment

## Hosting (web)

```pwsh
npm run build
firebase deploy --only hosting
```

Hosting site: `squadupv2` (see [firebase.json](../firebase.json)).

## Cloud Functions

```pwsh
cd functions
npm install
firebase deploy --only functions
```

## Firestore rules + indexes

```pwsh
firebase deploy --only firestore:rules,firestore:indexes
```

## Storage rules

```pwsh
firebase deploy --only storage
```

## All-in-one (use sparingly)

```pwsh
firebase deploy
```

## First-time setup

1. Create Firebase project; set `.firebaserc` default.
2. Seed `config/allowedCreators` document with `{ uids: ['<your-uid>'] }` so you can create the first group.
3. Enable Auth providers (Email/Password, Google, Anonymous).
4. Upload APNs key (iOS) and `google-services.json` / `GoogleService-Info.plist` (mobile builds).
5. Deploy rules + indexes before the first hosting deploy.
