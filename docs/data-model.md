# Firestore Data Model

Top-level collections used by SquadUp. All writes go through services in [src/api](../src/api).

## `players/{playerId}`
- `firstName: string`
- `lastName: string`
- `userId: string | null` — Firebase Auth UID once claimed
- `rank: number` — reserved; **live competitive rank is kept per-group in `groups.players[]`**, not here
- `stats: { ... }` — reserved; the app tracks seasonal W/D/L per-group in `groups.players[]`

> Note: in practice the app's rank/stats live inside each group's denormalized `players[]`
> (a 0–4 tier, not Elo — see [game completion helpers](../src/utils/gameCompletion.js)).

## `groups/{groupId}`
- `name: string`
- `adminId: string` — primary admin UID (delete permission)
- `adminIds: string[]` — co-admins
- `players: Player[]` — denormalized player snapshots; each carries `rank` (0–4) and `stats: { wins, draws, losses }` for the **current season**
- `createdAt: Timestamp`

### Seasons (see [seasons-proposal.md](seasons-proposal.md))
- `seasonNumber: number` — existing groups start at `0` (launch season), new groups at `1`
- `gamesPerSeason: number` — completed-game target before auto-reset (default 48)
- `seasonGamesPlayed: number` — completed games so far this season
- `seasonStartedAt: number` — ms timestamp the current season started
- `activeGameId: string | null` — serializes creation of a group's next fixture
- `liveGameId: string | null` — set when an admin opens the match screen; blocks manual season ending until completion/cancellation

#### `groups/{groupId}/seasons/{seasonId}`
Read-only archive of a finished season (`seasonId = season-{number}`):
- `number: number`
- `gamesPlayed: number`, `gamesPerSeason: number`
- `endReason: 'target' | 'manual'`, `endedBy: string | null`, `endedAt: number`
- `standings: { id, userId, firstName, lastName, rank, wins, draws, losses, position }[]` — final table, sorted; ties share competition positions

#### `groups/{groupId}/completedGames/{gameId}`
Immutable completion receipt containing the scores, completing admin, timestamp, resulting season number, and next fixture ID.
The game result, season counter/archive/reset, unpaid-debt record, fixture deletion, receipt, and recurring fixture creation are committed in one Firestore transaction.
Retrying a completed game returns its receipt without applying another result.

Season recap acknowledgements are device-local and keyed by auth UID and group. All signed-in routes subscribe to the user's groups.
The latest ended season is queued for each group, including on the first visit from a new device; older archives remain available in season history.
Planned fixtures keep their attendance and teams unchanged across manual season endings; screens and team balancing resolve member ranks from the current group roster instead of stale fixture snapshots.

## `games/{gameId}`
- `groupId: string`
- `date: string` (ISO) | `time: string`
- `location: string`
- `status: 'open' | 'confirmed'` — live participation is tracked by the group's `liveGameId`; completed games are deleted atomically with their receipt
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
