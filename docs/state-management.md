# Zustand Stores

Each store in [src/store](../src/store) owns one slice of UI state plus one Firestore subscription lifecycle.

## Pattern

```js
const useFooStore = create((set) => ({
  foo: null,
  _unsubFoo: null,
  subscribeToFoo: (id) => {
    useFooStore.getState()._unsubFoo?.();
    const unsub = FooService.subscribeToFoo(id, (data) => set({ foo: data }));
    set({ _unsubFoo: unsub });
    return unsub;
  },
  unsubscribeFoo: () => {
    useFooStore.getState()._unsubFoo?.();
    set({ _unsubFoo: null });
  },
}));
```

## Stores

### [authStore.js](../src/store/authStore.js)
- `user`, `playerData`, `selectedGroupId`
- Actions: `login`, `signup`, `loginWithGoogle`, `logout`, `setSelectedGroupId`, `deleteAccount`
- Persists to `localStorage` (legacy — Firebase Auth has native persistence; consider trimming).

### [groupStore.js](../src/store/groupStore.js)
- `groups`, `group`, `myPlayer`, `ranks`, `loading`, `ranksLoading`
- Subscriptions: `subscribeToGroup(id)`, `subscribeToGroupsByPlayer(playerId)`
- `ranks` is computed per snapshot from `groups[*].players[playerId]`.

### [gameStore.js](../src/store/gameStore.js)
- `game`, `games`, live counters (`team1Goals`, `team2Goals`, `timer`, `running`)
- Deduplicates Firestore callbacks (skips re-render when payload is unchanged).

### [playerStore.js](../src/store/playerStore.js)
- Cached player list per group, persisted.

### [notificationStore.js](../src/store/notificationStore.js)
- FCM token registration, browser notification permission, foreground display via the Web Notification API.

### [inviteStore.js](../src/store/inviteStore.js)
- Lookup, create, deactivate invite codes.

### [languageStore.js](../src/store/languageStore.js)
- `lang` (`'en' | 'pt'`), `t(key, params)`. Persisted under key `squadup-lang`.
