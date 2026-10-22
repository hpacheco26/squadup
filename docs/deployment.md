# Deployment

## Hosting (web)

```pwsh
npm run build
firebase deploy --only hosting
```

Hosting site: `squadupv2` (see [firebase.json](../firebase.json)).

## First seasons release

1. Verify unit coverage and Firestore lifecycle checks against a local emulator, then build.
2. Run [migrate-seasons.cjs](../scripts/migrate-seasons.cjs) in dry-run mode first. Apply only its additive Season 0 initialization; existing ranks, stats and planned fixtures must remain unchanged.
3. Deploy Firestore rules before hosting: `firebase deploy --only firestore:rules --project squadup-a3a55`.
4. Deploy hosting only: `firebase deploy --only hosting --project squadup-a3a55`.
5. Check the live page and build assets at `https://squadupv2.web.app`.

No scheduled job or Cloud Function is added for seasons. Existing groups retain their current ranks as Season 0;
new groups start at Season 1. Recap acknowledgements are local to each device.
Completion requires an online transaction; on failure the fixture stays available for retry.

Do not roll back hosting alone to an old client that completes games without receipts: old clients do not implement
the new atomic completion protocol. Have active admins reload the app after release before finishing a game.

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
