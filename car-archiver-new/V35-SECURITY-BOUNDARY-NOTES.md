# v35 Electron security boundary patch — 2026-10-21

- Main window denies unrequested navigations and all new windows; only the application renderer URL is approved.
- IPC checks the sender frame and renderer URL in main process on all registered channels.
- Print/PDF HTML runs with JavaScript disabled and sandbox enabled.
- Renderer CSP restricts scripts, objects and remote connections. Vite websocket localhost is permitted for development.
- New `npm run test:security` static invariant suite.

**Review caveats:** Dynamic Electron runtime and print/PDF/first-run tests must be completed on Windows; audit of remote URL/IPC path handling and dependency upgrades remains ongoing. Do not imply traffic or telemetry absence without a separate runtime network inspection. A window navigating from startup splash cannot invoke IPC until the verified application page loads.
