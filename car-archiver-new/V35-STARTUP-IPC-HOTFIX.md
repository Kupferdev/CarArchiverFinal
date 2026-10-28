# v35 startup and restore IPC hotfix (test build)

- Added `confirm-restore-data` and `cancel-restore-data` to the preload IPC whitelist and the request/response type maps. Added optional `folder` and `restarting` to the restore result type.
- Removed the second dedicated startup BrowserWindow: the application's single visible window displays a loading page before switching to the main interface. This avoids simultaneous small and large Electron windows and taskbar entries.
- Kept verified backup selection, pending restore staging, rescue-folder handling, and SQLite close-before-relaunch logic unchanged.

## Verification

Source/parser, smoke, localization and static restore checks passed in the authoring environment. **Full TypeScript typecheck, npm lint, Electron restart and Windows runtime were NOT exercised here**; please run `npm run verify` from `car-archiver-new` and test a restart using only disposable test data and backup.

Automatic restart may still have platform-specific issues; do not test with the only copy of real data. MSIX packaging, trash/deletion recovery remain deferred.
