# v14 – service write verification and consistency

## Changes

- Service and parts remain on a single synchronous SQLite transaction for create/update/delete; existing part IDs are preserved on edit.
- Added defense-in-depth validation at the ServiceService write boundary for positive integer quantity, nonnegative integer unit price in kuruş, safe multiplication, and nonempty part names of at most 200 characters. Invalid direct callers are rejected even without IPC validation.
- New service creation rejects incoming existing `partId` values, avoiding ambiguous semantics.
- IPC no longer silently truncates arrays of faults or damage records beyond 30 items. Oversized lists are rejected explicitly so user data is not quietly lost.
- Added **actual SQLite integration tests** (`npm run test:service-integration`) covering new service/parts, nullable complaint, update preserving part ID, removal/replacement of parts, forced late insert failure with parent-and-child rollback, failed create rollback, and delete cascade.
- `npm run verify` now includes the SQLite integration test.

## What ran here

- `node scripts/smoke-check.mjs`: PASS.
- `node scripts/service-atomicity-check.mjs`: PASS (source assertions only).
- `node --check scripts/service-integration-test.mjs`: PASS (JS syntax only).
- TypeScript parser of modified TS files: PASS (syntax only).
- `npm ci --offline`: FAILED (dependency archives not cached).
- `npm ci` with network: TIMED OUT during dependency installation.
- Actual SQLite integration test: **NOT EXECUTED**, because `better-sqlite3` is not installed in this environment.
- Full typecheck and lint: **NOT EXECUTED**, because dependencies are unavailable.

## Validation on your Windows development machine

Back up the real SQLite database. In the project root, run:

```bash
npm ci
npm run verify
```

These tests use **temporary disposable SQLite databases** and must not target your production database. If `better-sqlite3` needs a rebuild for the Node ABI, run `npm rebuild better-sqlite3`; for Electron specifically rebuild with the existing Electron rebuild workflow.

Manually confirm service edit (existing part IDs preserved), adding/removing parts, blank complaint, and delete cascade. No currency changes or ownership-history migration were introduced.
