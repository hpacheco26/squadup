# Repository Conventions for AI Agents

This file gives AI coding assistants (Copilot, Claude, etc.) the conventions they should follow when modifying this repository.

## Stack

React 19 (JSX, no TypeScript) · Vite · Zustand · React Router 7 · Firebase v12 · Capacitor 8.

## Architectural rules

- **Layering:** components → stores → services → Firebase. Components never call Firebase directly.
- **One subscription per store slot** (`_unsub*`). Always tear down the previous subscription before starting a new one.
- **Routes encode IDs.** Pages read `useParams()` and call `subscribeToX(id)`; stores cache.
- **No new TypeScript** — keep JS for now. JSDoc is welcome on exported functions.

## Style rules

- Prefer extracted styles (component-scoped objects or CSS modules) over new inline styles. Existing inline styles are tolerated; do not add more without reason.
- Use Lucide icons (`lucide-react`).
- Bulma classes are allowed but the trend is custom React components.

## Strings

- Every user-visible string must go through `t(...)` from [src/store/languageStore.js](src/store/languageStore.js).
- Add the key to BOTH [src/i18n/en.js](src/i18n/en.js) AND [src/i18n/pt.js](src/i18n/pt.js).

## Testing

- Add a unit test under `*.test.js` next to the source for any pure function or store action.
- Update [tests/rules](tests/rules) when changing [firestore.rules](firestore.rules).
- Run `npm run lint` and `npm run test:run` before committing.

## Commits

Conventional Commits. Example: `feat(teams): hurricane swirl squad-up animation`.

## Do NOT

- Do not add new dependencies without a strong reason.
- Do not introduce TypeScript / ts-jest / Babel macros.
- Do not deploy from a developer machine without explicit ask (`firebase deploy` is reserved).
- Do not commit `google-services.json`, `GoogleService-Info.plist`, or any APNs key.
