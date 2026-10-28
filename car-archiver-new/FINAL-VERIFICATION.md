# v35.0 – Startup language and EULA legibility fix

## Fixed
- Startup splash language now matches user's last selected Settings > Language choice on the **next full application launch**. Previously splash used the original onboarding `config.json` language while the UI used renderer localStorage.
- New allowlisted `set-startup-language` IPC writes only one of 14 language codes to `startup-language.json` in Electron userData, rather than reopening/updating the database config. First launch defaults to OS locale (or English if unsupported), then config language if present.
- Migrates existing installs when React loads, persisting effective language without data schema edits. Changes also persisted during onboarding language selection.
- EULA in About now explicitly styles heading, list, list markers, paragraphs, and emphasized text using the active theme's primary readable text color; onboarding retains high contrast on its light background.

## Verified in this environment
- `node scripts/v35-source-check.mjs`: PASS
- `npm run test:i18n`: PASS, all 14 locales 326/326
- `npm run test:smoke`: PASS
- Dependency install `npm ci --offline --ignore-scripts`: NOT POSSIBLE: registry tarball not in local cache (zustand). Consequently typecheck, full verify, Electron GUI runtime and Windows build cannot honestly be marked PASS here.

## Required Windows release gate
1. Run `npm ci` in car-archiver-new with internet, then `npm run verify`.
2. Test the About > EULA viewer with all 4 themes and French, Turkish, Japanese. Confirm headings and bullets legible.
3. Select French under Settings > Language, close entire app, relaunch; first splash should be French. Repeat Turkish and Japanese. Verify **restarting**, not browser refresh.
4. Test initial onboarding language selection and subsequent launch.
5. Test backup/restore on disposable data and inspect packaged app network behavior; inspect third-party license reporting.
6. Privacy policy / KVKK are still DRAFT and require legal review; publish public privacy policy URL before Microsoft Store submission.

This archive is updated source, **not** a certified Microsoft Store production MSIX or an app binary.
