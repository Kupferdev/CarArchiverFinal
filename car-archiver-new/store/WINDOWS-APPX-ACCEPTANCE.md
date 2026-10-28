# Windows AppX/MSIX acceptance plan – not executed

**Baseline:** last Windows-verified Electron **30.5.1**, better-sqlite3 **12.6.2**. Do not use the experimental Electron 44 folder for this checklist.

## Before building
- Take a separate copy of the last verified source; do not modify the real workshop database.
- Complete Partner Center package identity; fill the appx fields from actual Store identity.
- Create a test-only customer-selected data directory with disposable SQLite/media records.
- Use `npm ci`, `npm run verify`, `npm run native:check`, `npm run release:check`.
- Check production `npm audit --omit=dev` separately; npm audit success does not cover packaged Electron/Chromium itself.

## Build (Windows only)
- Run `npm run build:msix-draft` only in the separate test copy after identity is ready.
- Check the produced `.appx` / `.msix` file *as produced* (no extension renaming), package architecture, identity, publisher, version (nonzero major and Store-compatible revision), and native better-sqlite3 module inside the package.
- Run Windows App Certification Kit where applicable, and record the output.
- Store distribution signing differs from local side-loading. Install only signed/trusted local test packages; do not bypass OS security.

## Real acceptance tests
- Fresh install/first-run setup, customer, car and service create/edit/delete, trash restore/purge.
- Add/view/delete multiple service photos, backup, restore with re-launch, CSV export and PDF print.
- Close and re-launch; test normal non-admin account and permissions on user-selected data path.
- Upgrade from one package version to a later version **with the same package identity and different version**. Ensure the test-only customer data, settings and media persist.
- Uninstall and verify that customer-selected data directory is still present. Verify that removing any installation-scoped app data is not confused with deleting the user's external data directory.
- Check network behavior of the actual packaged build, not just source-level policy.
- Record findings, test platform, sample data path (never real personal data), package name/version/hash, and reviewer/date before marking signed off.

### Current status
Not tested. Do not create `WINDOWS-MSIX-SIGNOFF.md` before the above test evidence exists.
