# Architecture

SquadUp is a React 19 + Vite PWA wrapped with Capacitor for iOS/Android, backed by Firebase (Firestore, Auth, Cloud Functions, Cloud Messaging, Hosting).

## High-level data flow

```
┌────────────────────────────┐
│ React UI (pages/components)│
└────────────┬───────────────┘
             │ hooks
┌────────────▼───────────────┐
│ Zustand stores (src/store) │  ← UI state + subscription lifecycle
└────────────┬───────────────┘
             │ calls
┌────────────▼───────────────┐
│ Service layer (src/api)    │  ← Firestore reads/writes, onSnapshot
└────────────┬───────────────┘
             │
┌────────────▼───────────────┐
│ Firebase                   │
│  • Firestore               │
│  • Auth                    │
│  • Cloud Functions         │  → FCM push, scheduled cleanup
│  • Cloud Messaging         │
│  • Hosting (squadupv2)     │
└────────────────────────────┘
```

## Layers

- **Pages** ([src/pages](../src/pages)) own the route, read URL params, mount subscriptions through stores.
- **Components** ([src/components](../src/components)) are mostly presentational; a few (swipe, carousels, modals) own gesture/local state.
- **Stores** ([src/store](../src/store)) wrap one Firestore subscription each, expose actions, and persist a small slice to `localStorage` when offline-friendly.
- **Services** ([src/api](../src/api)) are thin wrappers over Firestore SDK calls. They never read from stores.
- **Utils** ([src/utils](../src/utils)) are pure functions: balancing, ranking, status derivation.
- **Cloud Functions** ([functions/index.js](../functions/index.js)) run on Firestore triggers and schedules.

## Conventions

- Real-time first: prefer `onSnapshot` with cleanup via the store's `_unsub*` slot.
- Routes encode IDs (`groupId`, `gameId`) and stores derive context from them.
- Anonymous auth is used for public game-invite links, then cleaned up.
- All copy goes through `t(lang, key, params)` from [src/i18n](../src/i18n).
