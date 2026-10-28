# v35 startup-security hotfix (2026-10-21)

- Fixed Electron startup crash `Cannot access 'currentWindow' before initialization` by declaring the window reference before registering its navigation and window-open guards.
- Removed unsupported `will-frame-navigate` listener for Electron 30; preserved the supported `will-navigate` guard, denied popup windows, and retained IPC main-frame verification and sandbox.
- Extended `scripts/security-boundary-check.mjs` to catch the initialization-order regression and unsupported event in source.
- Local verification: `node scripts/security-boundary-check.mjs`, `node scripts/smoke-check.mjs`, and `node scripts/v35-source-check.mjs` all passed. Full TypeScript, npm verify and Electron UI testing must be run on Windows with dependencies installed.
- Real customer databases were not opened or modified.
