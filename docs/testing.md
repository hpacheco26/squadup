# Testing

Three layers, all runnable locally and in CI.

## 1. Unit / component — Vitest + React Testing Library

```pwsh
npm test               # watch mode
npm run test:run       # single pass
npm run test:coverage  # with c8 coverage
```

Layout: tests live next to source as `*.test.js` / `*.test.jsx`, plus shared specs in [tests/unit](../tests/unit).

Targets in priority order:
1. Pure utils — [src/utils/teamBalancer.js](../src/utils/teamBalancer.js), [src/utils/myInviteStatus.js](../src/utils/myInviteStatus.js), [src/i18n/index.js](../src/i18n/index.js).
2. Zustand stores with services mocked.
3. Components with logic (swipe, modals).

## 2. Integration — Firebase emulators

```pwsh
npm run test:rules         # Firestore security rules
npm run test:functions     # Cloud Functions
```

Rules tests ([tests/rules](../tests/rules)) use `@firebase/rules-unit-testing`. Requires the Firebase CLI and Java (for the emulator).

## 3. End-to-end — Playwright

```pwsh
npx playwright install     # one-time
npm run test:e2e
```

Specs in [tests/e2e](../tests/e2e). They run against `vite preview` (config in [playwright.config.js](../playwright.config.js)).

## CI

GitHub Actions workflow at [.github/workflows/ci.yml](../.github/workflows/ci.yml) runs lint + unit + rules + e2e on every push & PR.
