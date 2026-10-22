# Contributing

## Branching

- `main` is always deployable.
- Feature branches: `feat/<short-name>`; fixes: `fix/<short-name>`.

## Commits

Conventional Commits style:
- `feat(scope): ...`
- `fix(scope): ...`
- `docs(scope): ...`
- `refactor(scope): ...`
- `test(scope): ...`
- `chore(scope): ...`

Example: `feat(teams): hurricane swirl squad-up animation`

## Rank visuals

- Rank images are `src/assets/rank-0.png` through `rank-4.png`.
- Keep animation and label colors in `src/theme.js` (`rank`, `rankDefault`, `rankAccent`), matching the badge highlights: slate blue, teal, blue-teal, indigo, and mauve.
- Render the images and rank particles without added glows, blurred halos, or drop shadows. Rank-change effects keep movement without recoloring the artwork.
- Run `npx vitest run src/components/RankIcon.test.jsx` when changing these visuals.

## Before pushing

```pwsh
npm run lint
npm run test:run
```

## PR checklist

- [ ] Lint passes
- [ ] Unit + rules tests pass
- [ ] No new inline-style blocks added (prefer extracted styles or existing patterns)
- [ ] Strings go through `t(...)` and exist in both `en.js` and `pt.js`
- [ ] Firestore subscriptions have a matching unsubscribe
- [ ] Docs updated when behavior changes
