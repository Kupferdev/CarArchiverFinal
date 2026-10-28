# CarArchiver v35 — Security dependency update stage

## Verified source findings
- `drizzle-orm` is directly used in SQLite repositories and schemas. Current lockfile still contains the old version; the upgrade has NOT been completed yet.
- `react-router-dom` is declared but has no matching router imports in application source. A guard in `security-upgrade.mjs` checks again before removal.
- Do not run `npm audit fix --force`. Do not upgrade Electron/ABI tooling as part of this change.

## Windows (with network access)
1. Back up source folder, use a separate development copy; do not test against real customer data.
2. Run `npm run security:upgrade`. It installs pinned `drizzle-orm@0.45.4` and uninstalls unused `react-router-dom`, regenerating `package-lock.json`.
3. Run `npm run native:check` (or `npm run native:rebuild` if required).
4. Run `npm run verify` and `npm run test:v35`.
5. Run `npm audit --omit=dev` and `npm audit`.
6. Run `npm run dev` and validate customer/car/service/trash flows.
7. After these pass, run `npm ci` in a fresh copy to verify reproducibility.

`npm ci` must NOT be used before `security:upgrade`: the bundled lockfile still reflects the prior dependency graph.

## Environment limitation
The package registry was unreachable in the build environment (EAI_AGAIN), so no dependency archive could be fetched and the lockfile could not be safely regenerated here. This package is a controlled upgrade *staging* package, not a security-cleared release. The user's Windows test determines outcome.
