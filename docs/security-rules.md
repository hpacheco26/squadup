# Security Rules

Source: [firestore.rules](../firestore.rules), [storage.rules](../storage.rules).

## Principles

1. **Auth required** for every collection — no anonymous reads of game data (the public game-invite link uses `signInAnonymously` first).
2. **Allowlist for group creation** — only UIDs in `config/allowedCreators.uids` can create a `groups/*` doc.
3. **Owner-scoped FCM tokens** — `fcmTokens/{userId}` is keyed on the owner's UID.
4. **Notification recipient scoping** — read/update only if `request.auth.uid in resource.data.recipientIds`. Deletion is disabled (archive pattern).
5. **Player claim safety** — `players/{id}` create requires `request.auth.uid == request.resource.data.userId`, preventing UID spoofing on first claim.

## Permissive collections (intentional)

`games`, `invites`, `gameDebts` allow any authenticated user to CRUD. This is acceptable for the squads-only model where every authed user is in your network. Tighten later by joining against `groups.players[]` if SquadUp opens to public.

## Storage rules

Currently permissive (any auth user, any path). Tighten before allowing untrusted users — see [storage.rules](../storage.rules).

## Testing

Rules are exercised by [tests/rules](../tests/rules) using `@firebase/rules-unit-testing` against the Firestore emulator. See [testing.md](testing.md).
