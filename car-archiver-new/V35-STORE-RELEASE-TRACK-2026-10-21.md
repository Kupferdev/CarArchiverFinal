# v35 Microsoft Store preparation – 2026-10-21

**Decision:** Keep the last user-verified Electron 30.5.1 + better-sqlite3 12.6.2 baseline. The Electron 44 experiment failed V8 native compilation and is not part of this package.

### What changed in this batch
- `release:check` distinguishes Store **requirements** from an **advisory** concerning Electron support status. It no longer misrepresents `Electron >=43` as a universal Store admission rule.
- Release-gate tests enforce that the advisory remains visible but does not independently cause `--strict` failure.
- Improved sign-off evidence checks: actual published HTTPS URL, matching Partner Center/AppX identity and package hash/test statuses are required.
- Added Turkish and English **draft** privacy policies (not approved/not published), Partner Center identity checklist, Windows AppX/MSIX acceptance plan and localized Store description drafts.
- Did not change Electron, native dependencies, lockfile, IPC runtime or end-user functionality.

### Release readiness
**Required checks:** 8/11 pass, 3 remain blocked (final privacy policy/public URL; Store package identity; actual Windows packaged-install/update/uninstall test).
**Risk advisories:** Electron 30 is not supported and carries additional Chromium/Electron security risk; check AppX four-part package version before submission (the 0.35.0 app version is a development version). Passing Store certification cannot be guaranteed; findings must be evaluated separately.

See `store/RELEASE-EVIDENCE-TEMPLATES.md` for evidence format; manually created evidence is not a substitute for real-world verification.

The local user database was never opened for this work. This source ZIP does not contain a built MSIX/AppX installer.

Microsoft Store policies: https://learn.microsoft.com/en-us/windows/apps/publish/store-policies
Store AppX/MSIX package acceptance: https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/upload-app-packages
