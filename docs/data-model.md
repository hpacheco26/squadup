# Firestore Data Model

Top-level collections used by SquadUp. All writes go through services in [src/api](../src/api).

## `players/{playerId}`
- `firstName: string`
- `lastName: string`
- `userId: string | null` — Firebase Auth UID once claimed
- `rank: number` — Elo-style score (see [team-balancer.md](team-balancer.md))
- `stats: { gamesPlayed, wins, losses, goals, ... }`

## `groups/{groupId}`
- `name: string`
- `adminId: string` — primary admin UID (delete permission)
- `adminIds: string[]` — co-admins
- `players: Player[]` — denormalized player snapshots
- `createdAt: Timestamp`

## `games/{gameId}`
- `groupId: string`
- `date: string` (ISO) | `time: string`
- `location: string`
- `status: 'open' | 'confirmed' | 'live' | 'ended'`
- `playersInvited: Player[]`
- `playersIn: Player[]`
- `playersOut: Player[]`
- `team1: Player[] | null`
- `team2: Player[] | null`
- `injured: Player[]`
- `playersPerTeam: number` (default 5)
- `team1Goals, team2Goals: number`
- `subTime: number` (seconds)

## `invites/{code}`
8-char code, alphabet excludes `0 1 I O l`.
- `code: string` (also doc id)
- `groupId: string`
- `groupName: string`
- `createdBy: string`
- `createdAt: Timestamp`
- `active: boolean`

## `notifications/{notifId}`
- `type: 'gameInvite' | 'gameUpdate' | ...`
- `groupId, gameId: string`
- `senderId, senderName: string`
- `recipientIds: string[]`
- `data: object`
- `createdAt: Timestamp`

Triggers [`sendPushNotification`](../functions/index.js) on create.

## `gameDebts/{debtId}`
- `groupId, gameId: string`
- `debts: { [playerId]: { owed: number, paid: boolean } }`

## `fcmTokens/{userId}`
- `tokens: string[]`
- Read/write scoped to owner.

## `config/allowedCreators`
- `uids: string[]` — UIDs allowed to create new groups.

## Indexes

See [firestore.indexes.json](../firestore.indexes.json). Notably:
- `notifications`: `(recipientIds array-contains, createdAt desc)` for the last-24h feed.
