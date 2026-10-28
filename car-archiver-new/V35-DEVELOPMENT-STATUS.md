# Car Service Archiver — v35 development preview (phase 1)

This is **not** a release candidate or a Microsoft Store package.

## Implemented in this preview

- New **ServiceMedia** SQLite migration (schema version 10). The database holds metadata and **never holds images**. Files live below the existing user-selected `media/services/<serviceId>/` directory.
- Service Profile photo gallery: native file picker, JPEG/PNG/WebP signature checks, 16 MiB limit per image, maximum 80 per service, preview and remove. File-copy + SQLite insert is rolled back together on failure. Only the main Electron process has file-system privileges. A generated UUID prevents overwriting existing pictures.
- **Backup** in Settings > Data and Storage: SQLite's online snapshot API plus a copy of all media, saved to a chosen external folder with a manifest. Writes from the application's normal IPC handlers are blocked while backup is underway.
- **CSV export** of Customers, Cars, Services, UTF-8 BOM for Excel, formula injection protection, no photo bytes. CSV is **not** a full backup.
- Right sidebar marks overdue delivery dates on still-undelivered service records. Existing historic test data is unchanged.
- Initial MSIX packaging script and meaningful app product metadata. A Microsoft Store publisher/package identity still needs to be reserved and configured before submitting anything; **no** certificate, paid-product pricing or Store submission has been set up.
- Added SQL migration test for media metadata foreign key/cascade and 14-language translations for new storage/dashboard strings.

## NOT YET implemented / important cautions

1. **Safe restore and trash/recycle bin** are not complete. Do not manually overwrite a running SQLite database. Phase 2 must build a validated, rollback-safe restore and reversible deletes. Please do not use this development build with the only copy of production data.
2. If a service/car/customer is deleted, SQLite cascades its `ServiceMedia` metadata but its physical media files are **not** automatically purged yet. This avoids premature permanent loss but creates orphans until the planned trash/cleanup implementation exists.
3. Photo thumbnails currently lazy-load the original file, so image-heavy service histories may use additional memory. Separate thumbnail creation/compression is planned.
4. Image support is limited to **JPEG, PNG, WebP**, with signature checks but not a full image-decoder verification.
5. The backup blocks normal app writes, but consistency of changes made by another external program directly to the media folder is not guaranteed.
6. Excel-compatible CSV export does not produce actual `.xlsx` files. It includes sensitive personal data and should be kept securely.
7. Full UI, MSIX/Store certification and Windows integration tests have **not** been executed in this environment. Run `npm run verify` on Windows. The added migration must be tested on both a fresh and an existing database **after making a backup**.
8. Microsoft Store one-time purchase pricing is configured in Partner Center later, not via a line in source code.

## Upgrade note

Schema version 10 adds a ServiceMedia table. This is designed to leave old rows untouched, but **make a complete copy of the data directory including its hidden media folder before starting this preview**.
