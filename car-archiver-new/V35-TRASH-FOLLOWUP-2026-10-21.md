# v35 Trash follow-up — 21 October 2026

Source: CarArchiverFinal-v35-trash-review-source(1).zip (provided by the user).

## Changes
- Updated `scripts/v35-source-check.mjs` to validate migration 11 (`TrashItems`) rather than migration 10.
- `restoreTrash` now aborts and rolls back if a car or service previously linked to a deleted customer is no longer present; it no longer silently skips such a relationship.
- Added a missing-linked-car rollback and recovery scenario to `scripts/trash-integration-test.mjs`.

## Verification in this environment
- `node scripts/v35-source-check.mjs`: 12/12 PASS.
- `node scripts/smoke-check.mjs`: PASS.
- `node scripts/i18n-audit.mjs --strict --strict-literals`: PASS for 14 locales, 326 common keys.
- `node scripts/trash-integration-test.mjs`: NOT RUN successfully (missing `better-sqlite3` / no installed node_modules).
- TypeScript typecheck, ESLint and Windows Electron ABI tests: NOT RUN (dependencies missing).

## Open issues before production
- Test actual SQLite/Electron compatibility and the full `npm run verify` suite on a development copy.
- Purge commits SQLite before physical media removal; failed filesystem deletion leaves orphan files and needs robust durable cleanup/retry.
- Trash listing hard-limits to 1000 entries, without pagination.
- Trash UI strings reside in a component-local dictionary rather than the main i18next catalogue; automated global key audit does not validate them.
- Trash UI has no bulk restore/purge and uses native `window.confirm`.
- Validate customer/car/service cascades, prior ownership references, simultaneous trash entries, restart persistence, and backup/restore against disposable data.

Never execute destructive tests on a real user database. This is a source review candidate, not a store-ready release.
