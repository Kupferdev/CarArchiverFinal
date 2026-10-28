# v35 release gate — 2026-10-21

The last user-verified source baseline is the offline/IPC/media hardening build.
Windows `npm ci`, `npm run verify`, and app launch passed on that baseline. No MSIX has been certified.

## What this change adds

- Read-only release readiness tool: `npm run release:check` (informational) and
  `npm run release:gate` (non-zero status while any required gate remains open).
- Checks manifest/lock agreement, absence of obsolete router dependency, pinned
  Drizzle patch, Electron window process settings, packaging source inclusion,
  uninstall AppData option, and remaining release signoffs.
- The tool does not install dependencies, rebuild binaries, open databases,
  touch user media, or change existing application behavior.

## Current blockers

1. Electron 30 is obsolete with published security advisories. An Electron major
   upgrade requires separate native SQLite ABI, start-up, gallery, printing and MSIX testing.
2. Deprecated `electron-rebuild` coexists with `@electron/rebuild`; remove with a real
   npm lock regeneration and verify Node engine compatibility before releasing.
3. Public privacy policy URL, finalized content and third-party licence notices.
4. Partner Center publisher/package identity must match the produced MSIX exactly.
5. Windows signed MSIX install, update and uninstall with a user-selected data
   directory tested for non-deletion, including rollback and recovery.

The release checks are readiness indicators, not a replacement for runtime
security analysis, signed package verification, actual network monitoring,
Windows App Certification Kit, or legal review. Do not ship merely because
source tests pass. `npm audit --omit=dev` passing doesn't assess packaged Electron.

To run on Windows: `npm ci`, `npm run verify`, `npm run release:check`.
`release:gate` is EXPECTED to fail until the blockers are resolved.
