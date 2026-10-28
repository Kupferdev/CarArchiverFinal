# Car Service Archiver v35 — 9 UI/regression fixes (2026-10-27)

Based on the last **Electron 30** stable Store-preparation source archive. This package does not include the failed Electron 44 upgrade. Dependencies and lockfile are unchanged; there is no DB migration.

1. Removed LPG from the new-vehicle notes placeholder examples in all 14 translations (fuel-type choices remain intact).
2. Turned off Electron session spellchecking and made the root form container `spellcheck=false` so Chromium does not underline field values in red.
3. Removed the example date/time placeholder from the service date-time entry controls, preserving labels and native picker buttons.
4. Service creation and edits now advance **the car's latest known odometer** when a higher mileage is recorded. Old service history retains its own kilometer values; lower historical entries never roll back the car's odometer. Both updates take place inside the same SQLite transaction with parts. Added regression assertions for create, edit, older reading and failed edit/create rollback.
5. Switched all DeleteConfirmDialog backgrounds to theme tokens rather than a hard-coded dark background.
6. The upcoming appointments sidebar excludes services marked delivered and services having an actual delivery date.
7. Fixed the initial forced-maximize behavior; the initial 1440x920 window opens in normal movable mode, while previous window state is respected. Kept an explicit draggable Windows custom titlebar strip leaving native window buttons unobstructed.
8. Switched the UnsavedChangesDialog background/border to theme tokens.
9. Vite dev/preview config now explicitly uses `open: false`: `npm run dev` **still starts** the local Vite server (expected), but Vite must not launch a separate browser tab. Production Electron loads packaged HTML, no localhost server.

## Source checks run here

- `node scripts/v35-ux-nine-check.mjs`: PASS
- `node scripts/v35-source-check.mjs`: 12/12 PASS
- `node scripts/security-boundary-check.mjs`: PASS
- `node scripts/v35-restore-ui-check.mjs`: PASS
- `node scripts/v35-restore-relaunch-check.mjs`: PASS
- `node scripts/v35-media-ux-check.mjs`: PASS
- `node scripts/i18n-audit.mjs --strict --strict-literals`: 14 x 326/326 PASS
- `node scripts/release-preflight-test.mjs`: PASS
- `node scripts/smoke-check.mjs`: PASS

## Windows verification still required

In an **extracted copy of this ZIP**:

```cmd
npm ci
npm run verify
npm run dev
```

Check the 4 themes, the Windows titlebar drag with a restored (not maximized) window, a new and edited service with increasing mileage, future delivered appointments, date fields, and both deletion/unsaved-change dialogs. `npm run verify` now contains `test:ux-fixes` in addition to the previous suite. Source checks alone **do not** prove TypeScript/SQLite integration on Windows because no installed node_modules were available in the build environment.

Do not delete or reset your existing SQLite customer database. Tests use disposable `.tmp-*` fixture folders only.
