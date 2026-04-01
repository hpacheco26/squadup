# Game Invite Functionality

## Overview

SquadUp has **two invite systems** that work together:

| System | Purpose | Route | Data |
|--------|---------|-------|------|
| **Group Invite** | Invite players to join a squad | `/join/:code` | `invites` collection |
| **Game Invite** | Let players respond IN/OUT to a game | `/game-invite/:gameId` | `games` collection |

---

## System 1: Group Invites (Squad Membership)

### How It Works

1. **Admin generates invite** — In the group page, the admin opens the Player Modal and clicks "Generate Invite Link"
2. **Code is created** — An 8-character alphanumeric code is generated (excludes `0, 1, I, O, l` to avoid confusion) and stored in the `invites` Firestore collection
3. **Link is shared** — The link format is `https://squadupv2.web.app/join/{CODE}`
4. **Player visits link** — The JoinPage loads, verifies the code, and shows the group info
5. **Player joins** — They either claim an existing unlinked player profile or join as a new player

### JoinPage States

| State | Condition | What the user sees |
|-------|-----------|-------------------|
| **loading** | Fetching invite and group | Loading spinner |
| **error** | Invalid/expired code or group not found | Error message + Home button |
| **already** | User is already a member | "You're already a member" + link to group |
| **pick** | Valid invite, user not yet a member | List of unclaimed players to pick from, OR join as new player |
| **joined** | Successfully linked | "You're In!" + link to group |

### Invite Data Model (`invites` collection)

```
{
  code: "ABC1234D",
  groupId: "squad-name-userId",
  groupName: "My Squad",
  createdBy: "firebase-uid",
  createdAt: "2026-04-01T12:00:00.000Z",
  active: true
}
```

---

## System 2: Game Invites (Game Response)

### How It Works

1. **Admin creates a game** — Via GameModal, all group players are auto-added to `playersInvited`
2. **Notifications sent** — All invited players with linked accounts receive a `game_created` notification
3. **Admin shares link** — Via WhatsApp message (with game summary) or copy link button
4. **Players respond** — Either through the app (PreGamePage swipe UI) or via the public invite link (GameInvitePage swipe UI)
5. **Game status updates** — When enough players confirm IN, game status changes from `open` → `confirmed`

### Sharing Options (PreGamePage)

| Method | How It Works |
|--------|-------------|
| **WhatsApp** | Opens WhatsApp with a formatted message containing game details (date, time, location, map link, player counts) and the invite link |
| **Copy Link** | Copies `https://squadupv2.web.app/game-invite/{gameId}` to clipboard |

### WhatsApp Message Format

```
⚽ My Squad — Game Day!
📅 2026-04-15 at 19:30
📍 Urban Soccer, Field 3
🗺️ https://maps.google.com/...

✅ IN (3): John, Jane, Bob
❌ OUT (1): Tom
❓ PENDING (6): Alice, Charlie, ...

Respond here: https://squadupv2.web.app/game-invite/{gameId}
```

### GameInvitePage (Public Access)

This is a **public-facing page** for players who may not have accounts:

- Uses **anonymous Firebase auth** so unauthenticated visitors can read game data
- Shows a **swipe card UI** for each pending player
- **Right swipe** → Mark as IN
- **Left swipe** → Mark as OUT
- Responses are saved to **localStorage** to prevent duplicate responses
- Shows a live summary of IN / OUT / PENDING counts

### Game Data Model (`games` collection)

```
{
  id: "auto-generated",
  groupId: "squad-name-userId",
  date: "2026-04-15",
  time: "19:30",
  location: "Urban Soccer, Field 3",
  locationUrl: "https://maps.google.com/...",
  status: "open" | "confirmed" | "ended" | "cancelled",
  minPlayers: 5,
  maxPlayers: 12,
  adminId: "firebase-uid",

  playersInvited: [ { id, firstName, lastName, userId, rank, stats } ],
  playersIn:      [ { id, firstName, lastName, userId, rank, stats } ],
  playersOut:     [ { id, firstName, lastName, userId, rank, stats } ]
}
```

### Player Response Flow

```
playersInvited ──swipe right──▶ playersIn
       │                              │
       └──swipe left──▶ playersOut ◀──┘ (can change mind)
```

When a player responds:
1. Player object is removed from their current list
2. Player object is added to the new list (`playersIn` or `playersOut`)
3. Game document is updated in Firestore
4. If IN count crosses `minPlayers` threshold → status changes to `confirmed` and notification sent
5. If IN count drops below `minPlayers` → status changes back to `open` and notification sent

---

## Notification Triggers

| Event | Notification Type | Recipients |
|-------|------------------|------------|
| Game created | `game_created` | All invited players (except creator) |
| Game cancelled | `game_cancelled` | All players in game |
| Player confirms IN | `player_in` | All players in game |
| Player confirms OUT | `player_out` | All players in game |
| Min players reached | `game_confirmed` | All players in game |
| Drops below minimum | `game_needs_players` | All players in game |

---

## Auto-Sync: New Group Members

When a new player joins the group, the PreGamePage automatically detects them and adds them to the `playersInvited` list of any open game. This ensures new members are always included.

---

## Key Files

| File | Role |
|------|------|
| `src/pages/GameInvitePage.jsx` | Public game invite response page (swipe UI) |
| `src/pages/JoinPage.jsx` | Group invite join page |
| `src/pages/PreGamePage.jsx` | In-app game management (swipe, share, settings) |
| `src/components/modals/GameModal.jsx` | Create/edit game form |
| `src/components/modals/PlayerModal.jsx` | Generate group invite link |
| `src/api/inviteService.js` | Firestore CRUD for group invites |
| `src/api/gameService.js` | Firestore CRUD for games |
| `src/store/inviteStore.js` | Zustand state for group invites |
| `src/store/gameStore.js` | Zustand state for games + notification triggers |
| `src/api/notificationService.js` | Firestore CRUD for notifications |

---

## Requirements

- **Anonymous Auth** must be enabled in Firebase Console for the public GameInvitePage to work (allows unauthenticated users to read game data via the invite link)
- Firestore composite index on `notifications` collection: `recipientIds` (array-contains) + `createdAt` (descending)
