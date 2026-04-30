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
