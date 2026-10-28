# v35 — Restore/relaunch and startup UX candidate

## Changes
- Restore picker first validates the selected backup; a themed 14-locale confirmation follows, making explicit that backup restoration REPLACES rather than MERGES the active SQLite and media.
- A restore marker is created only after confirmation. Cancellation leaves no pending marker.
- On confirmed restore, Electron acknowledges the IPC call, closes Drizzle/SQLite references, requests a relaunch, and exits the old process explicitly rather than waiting on asynchronous app.quit.
- An initial splash window appears before restore/database migration, with startup phase text and renderer-load failure notice. It closes when the app window is ready.
- Current backup validation, restoration, rollback/rescue-directory behavior is preserved.

## Limitations / safety
- The **actual Windows automatic relaunch must still be tested** on a separate test data directory. No runtime Electron Windows test was possible here.
- This does not introduce merging of databases or a complete trash/recycle-bin recovery feature.
- Startup splash stage text is English for now, not translated into all 14 locales.
- If an earlier interrupted restore leaves a pending marker, do NOT clear it or overwrite the SQLite database until data and recovery folders are backed up.
- If a restore did succeed but relaunch fails, manually closing and reopening should display the restored data; this is a workaround, not a verified fix.

## Run on Windows
1. Keep an external copy of the whole data folder including SQLite and media.
2. Unzip to a separate project folder; run `npm run verify` within `car-archiver-new`.
3. Use **test records** and a test backup to check automated relaunch, themed confirmation and startup splash.
