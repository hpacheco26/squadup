# SquadUp

Sports squad organizer for casual leagues. Create a group, invite players, plan games, swipe IN/OUT, auto-balance teams, track goals, and settle debts — on web, iOS, and Android.

Live: <https://squadupv2.web.app>

## Stack

React 19 · Vite · Zustand · React Router · Swiper · framer-motion · Capacitor (iOS / Android) · Firebase (Firestore, Auth, Cloud Functions, FCM, Hosting).

## Quick start

```pwsh
npm install
npm run dev
```

The dev server runs at <http://localhost:5173>.

### Other scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint over the workspace |
| `npm test` | Vitest in watch mode |
| `npm run test:run` | Single Vitest pass |
| `npm run test:coverage` | Vitest with coverage |
| `npm run test:rules` | Firestore security rules tests (needs Firebase emulators + Java 17) |
| `npm run test:e2e` | Playwright end-to-end tests (public surface, no backend) |
| `npm run test:e2e:lifecycle` | Game lifecycle e2e against the Firebase emulators (needs Java 17 + `firebase-tools`) |
| `npm run cap:sync` | Build web + sync iOS & Android |
| `npm run cap:android` | Build, sync, open Android Studio |
| `npm run cap:ios` | Build, sync, open Xcode (macOS only) |

## Documentation

See [`docs/`](docs/README.md) for the full index — architecture, data model, security rules, services, mobile builds, deployment, testing, contributing.

Key entry points:
- [docs/architecture.md](docs/architecture.md)
- [docs/data-model.md](docs/data-model.md)
- [docs/testing.md](docs/testing.md)
- [docs/contributing.md](docs/contributing.md)
- [GAME_INVITE_FLOW.md](GAME_INVITE_FLOW.md) — original invite-flow spec

## License

Proprietary — all rights reserved.
