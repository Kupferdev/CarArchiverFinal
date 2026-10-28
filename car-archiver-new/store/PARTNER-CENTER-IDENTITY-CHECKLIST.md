# Partner Center package identity — verified 2026-10-27

## Store product identity (copied from developer screenshot)

| Field | Value |
|---|---|
| Store product name | `Car Service Archiver` |
| `Package/Identity/Name` | `26613KupferSoft.CarServiceArchiver` |
| `Package/Identity/Publisher` | `CN=9D509D51-623A-4DF5-A8E4-A5CD3FF2BF25` |
| `Package/Properties/PublisherDisplayName` | `KupferSoft` |

These values are now mirrored in the `appx` section of `electron-builder.json5`.
The engineering `appId` (`com.kupferdev.carservicearchiver`) is a separate identifier;
**do not** assume it is the Microsoft Store package identity.

## Still required before publishing

1. Confirm the Individual Partner Center account is eligible for the intended one-time paid commercial listing; **do not** infer this from the product reservation alone.
2. Review and publish the final privacy policy and KVKK/EULA. A publisher display name is not proof of the legal identity of an individual licensor/data controller.
3. Choose a Store-compliant four-part package version: the app currently has development version `0.35.0`, and the generated manifest must be checked. Microsoft requires nonzero major and zero revision for Store packages per package versioning guidance.
4. Use `npm run build:msix-draft` on Windows **after** preparing an appropriate package version. This project targets `appx`, and the output may be `.appx`. Do not rename the extension to pretend it is `.msix`.
5. Inspect the generated `AppxManifest.xml`: `Identity.Name`, `Identity.Publisher`, `Identity.Version`, PublisherDisplayName, supported architecture, capabilities, and package assets. When needed, align it with the exact Partner Center identity.
6. With **disposable** user-chosen data, test fresh install, records, photos, printing, backup/restore, update, and uninstall without deleting the data directory. Do not access customer production data during testing.
7. For Store AppX/MSIX distribution Microsoft re-signs after certification; for independent sideloading, a correctly trusted matching certificate is required.

Partner Center screenshot verification is **not** app certification, a completed MSIX build, or the legal approval of any document.

Official documentation:
- https://www.electron.build/docs/appx/
- https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/package-version-numbering
- https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/upload-app-packages
