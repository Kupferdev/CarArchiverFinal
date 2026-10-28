# v35 – Persistent deferred photo cleanup

- Migration 12 adds `PendingMediaDeletes` with a unique relative path, attempt count, error and timestamps.
- `purgeTrash` and `purgeTrashBatch` now enqueue unreferenced media paths in the **same SQLite transaction** that removes TrashItems. This removes the crash window between DB commit and recording required cleanup work.
- `retryPendingMediaDeletes()` checks both live `ServiceMedia` and surviving Trash snapshots before unlink; failure remains in queue and is logged rather than silently lost.
- Startup after migrations retries pending cleanup. Paths use the existing strict media path validator.
- New integration scenario forces an unlink failure, confirms the queue persists, then retries successfully.
- Updated DB migration test expectations and v35 source check to version 12.

## Remaining validations
- On Windows run `npm run verify` and `npm run test:v35` and test with a *disposable* database, not real shop data.
- The test uses a directory in place of a photo to force unlink failure. No application data path is used.
- Native Electron/better-sqlite3 rebuild workflow is still a separate pending task.
- Media deletion through `serviceMedia.ts` outside Trash remains an independent path to review.
