# Microsoft Store preparation – package identity recorded, Windows validation pending

Distribution intent: Windows Store **one-time paid purchase**, with electron-builder `appx` as the *draft* Store packaging target. Output may be `.appx`; Microsoft accepts AppX and MSIX uploads. This does **not** mean the package is finished, signed or certified.

**Pinned tested baseline:** Electron 30.5.1 + better-sqlite3 12.6.2. Keep the working app unchanged; the failed Electron 44 upgrade is excluded. Unsupported Electron is a **security advisory**, not an invented minimum Store framework requirement. The Store may still reject security problems it detects.

Before submitting:
1. Review and publish a real privacy policy HTTPS URL, and align the application's legal disclosures. Templates under `store/` are drafts, not publishable without review. Distinguish local workshop customer records from support-email processing.
2. **DONE (identity only):** `Car Service Archiver` is reserved; the real Partner Center `26613KupferSoft.CarServiceArchiver`, publisher DN and `KupferSoft` display name are recorded in the `appx` config. The engineering `appId` is separate. This does NOT prove the Individual account is eligible for intended paid commercial distribution.
3. Run Windows AppX/MSIX build using `npm run build:msix-draft`, inspect manifest and verify packaged SQLite native module. After Store-compatible version selection; identity is now known. For Store AppX/MSIX uploads Microsoft supplies code-signing after certification; sideloaded test packages must still be signed/trusted.
4. With *disposable* user-selected test data, test initial setup, all CRUD operations, gallery, PDF, printing, CSV, restore/relaunch and updating/uninstalling without deleting test data.
5. Run security and dependency reviews (including the unsupported Electron risk), actual packaged network behavior, Windows App Certification Kit and privacy/legal review. `npm audit --omit=dev` alone is not enough.
6. Submit pricing as one-time purchase in Partner Center; prepare authentic screenshots and multilingual Store listing.

For exact developer sign-off format, see `store/RELEASE-EVIDENCE-TEMPLATES.md`. Placeholder files do not satisfy this release check.

Useful documents: `store/PRIVACY-POLICY-DRAFT-TR.md`, `store/PRIVACY-POLICY-DRAFT-EN.md`, `store/PARTNER-CENTER-IDENTITY-CHECKLIST.md`, `store/WINDOWS-APPX-ACCEPTANCE.md`, `store/STORE-LISTING-DRAFT-TR-EN.md`.

Official references:
- https://learn.microsoft.com/en-us/windows/apps/publish/store-policies
- https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/upload-app-packages
- https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/package-version-numbering
