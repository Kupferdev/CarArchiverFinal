# Car Service Archiver — v33 Language Pack

**Base:** CarArchiverFinal-batch-preview-v32.zip. This archive is source code, not an installer.

## Applied

- Filled the 1,704 previously missing vehicle/service translation entries for the 12 non-Turkish/non-English locales. Original Turkish and English values were preserved.
- Added translated customer list/form/profile labels, customer deletion confirmations and related notifications, tab/context actions, unsaved-change dialog, common bulk actions, settings descriptions, service detail messages, and setup error strings.
- Translated service print/PDF document headings, car/customer/service fields, parts table, amounts, delivery status, and signature captions; dates/numbers use the selected language.
- Translated selected labels in dashboard and global actions, and used selected language for customer-profile date and number formatting.
- Applied the language selected in first-run setup to i18next before continuing.
- Fixed existing French and Portuguese mistakes in setup text.
- Added `npm run test:i18n` and upgraded legacy `scripts/i18n-coverage.mjs` to run the new audit.

## Automated checks

- **14 locales × 298 shared keys**: no missing keys (full parity), no mismatched `{{interpolation}}` variables.
- No unbound literal `t('key')` references among the scanned TS/TSX files.
- No raw Turkish JSX text/attribute strings were detected in the TS/TSX AST scan.
- Source TS/TSX syntax parsing, smoke checks and ZIP integrity were run separately.

## Important limitations

- A zero-key/parity result does **not** prove an exhaustive, human-reviewed localization of every application screen. Text constructed dynamically, user-facing backend/Electron IPC error messages, data type labels, initial setup/EULA text, and third-party/native UI still merit manual audit. The scanner chiefly checks known key packs and Turkish JSX text/attributes, not arbitrary English literals.
- The translation drafts have not been professionally reviewed by native speakers. Some phrasing can be improved, particularly technical terms and inflections. Vehicle and user-entered data are not translated.
- `npm ci` failed because npm itself reported `Exit handler never called!`; therefore `npm run verify`/full TypeScript lint, Electron packaging, and end-to-end UI testing were not completed in this environment. Test in a separate directory before replacing v31/v32.

## Verify locally

```bash
npm ci
npm run test:i18n
npm run verify
```

The existing SQLite database and user data are not included in this package and should be backed up before testing.
