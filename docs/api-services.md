# API / Service Layer

Each service in [src/api](../src/api) is a thin wrapper around the Firebase SDK. Services never depend on stores.

## [gameService.js](../src/api/gameService.js)
- `subscribeToGame(id, cb)` / `subscribeToGamesByGroup(groupId, cb)`
- `createGame(data)`, `updateGame(id, patch)`, `deleteGame(id)`

## [groupService.js](../src/api/groupService.js)
- `subscribeToGroup(id, cb)` / `subscribeToGroupsByPlayer(playerId, cb)`
- `canCreateGroup(uid)` — checks `config/allowedCreators.uids`
- `createGroup`, `updateGroup`, `deleteGroup`

## [playerService.js](../src/api/playerService.js)
- `getPlayerByUserId(uid)` — finds claimed player profile
- `checkPlayerExists(uid)`
- `createPlayer`, `updatePlayer`

## [inviteService.js](../src/api/inviteService.js)
- 8-char code generator, alphabet excludes ambiguous chars (`0 1 I O l`)
- `createInvite(group, uid)`, `getInvite(code)`, `deactivateInvite(code)`

## [notificationService.js](../src/api/notificationService.js)
- `subscribeToNotifications(uid, cb)` — last-24h, indexed query
- `markRead`, `archive`

## [gameDebtService.js](../src/api/gameDebtService.js)
- Tracks per-player debt for a finished game.
- `markPlayerPaid(debtId, playerId)` uses `FieldPath` to safely handle keys with dots/spaces.
