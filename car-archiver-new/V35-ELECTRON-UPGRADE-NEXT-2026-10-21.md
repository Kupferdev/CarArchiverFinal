# CarArchiver v35: controlled Electron upgrade (pending Windows verification)

This source package removes only the unused deprecated `electron-rebuild` dependency; the actual app runtime stays on its proven Electron 30.5.1 until the separate upgrade is tested.

As of 2026-10-21 the Electron releases schedule lists **44.9.3** as a supported stable build. The source environment cannot reach npm registry, so a valid updated Electron package-lock.json could not be produced here. Do not hand-edit or fabricate lockfile integrity hashes.

## On Windows, in a new copy of this source tree (leave the working installation and real DB untouched)

1. Run `npm ci`, `npm run verify`, and `npm run native:check` on this cleanup release.
2. Make a separate **source-folder backup**. Do not include real customer data in tests.
3. Run `npm install --save-dev --save-exact electron@44.9.3` in the disposable upgrade copy. npm will correctly update both the manifest and lockfile. Do not use `npm audit fix --force`.
4. Run `npm run native:rebuild` followed by `npm run native:check` (Electron's SQLite ABI must change).
5. Run `npm run verify`, `npm run dev`, and test setup, customers, vehicles, services, photos, restore/backup, print/PDF, external feedback and shutdown.
6. Test packaging with the updated builder chain separately before an MSIX signoff; this package does not claim Store readiness.
7. Send the output and the updated full source ZIP, including **both** package.json and package-lock.json, for further review.

If any step fails, stop and return to the backed-up Electron 30 project. Your actual customer database should never be copied into development ZIPs or reset.

Do not create `WINDOWS-ELECTRON-UPGRADE-SIGNOFF.md` before the Windows runtime tests genuinely pass. The release gate intentionally fails closed.
