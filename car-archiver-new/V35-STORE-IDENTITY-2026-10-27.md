# Car Service Archiver — Store package identity, 27 October 2026

The developer reserved the public Store name **Car Service Archiver** and supplied a
Partner Center **Product identity** screenshot with the following exact values:

- Name: `26613KupferSoft.CarServiceArchiver`
- Publisher: `CN=9D509D51-623A-4DF5-A8E4-A5CD3FF2BF25`
- Publisher display name: `KupferSoft`

These are now set in electron-builder `appx` packaging configuration. The separate
NSIS engineering `appId` is unchanged. No runtime or database changes were made.

**Store readiness, not certification:** identity gate verified, but public reviewed
privacy URL, final legal name/contact treatment and real Windows package install,
upgrade and uninstall tests remain open. The Electron 30.5.1 security advisory
remains active, and development version `0.35.0` has not been represented as a
valid Store package version. No package was built or uploaded as part of this step.
