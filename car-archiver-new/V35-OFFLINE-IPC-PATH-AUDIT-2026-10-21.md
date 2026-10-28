# v35 — Offline renderer and managed-media path hardening (2026-10-21)

Scope: Electron main window/network request boundary, main-process media paths and static callsite review.

- Renderer web requests for http(s)/ws(s) are denied in production by `session.defaultSession.webRequest.onBeforeRequest`. Local-only Vite server and corresponding HMR websocket remain allowed during development. This does not claim that Electron internals or external applications never connect to the Internet.
- Trusted development renderer navigation is restricted to its configured Vite pathname, not any arbitrary page on the dev server.
- Local media reads, copies and Trash cleanup validate the UUID key and reject symbolic-link or junction components in the managed media tree before touching a file.
- Customer, service and photo databases are not modified by this source update. No automatic migrations.
- `mailto:` support is intentionally delegated to the user's own mail client via `shell.openExternal` and may trigger networking in that external application.
- No direct `fetch()`, `XMLHttpRequest`, `WebSocket`, Node HTTP requests or update clients were found in the app source inspected. A runtime Windows network observation remains required for an offline-data-transfer claim.
- The source code tests do not substitute for `npm run verify`, photo restore/purge, PDF/print, backup/restore, MSIX certification or Electron upgrade validation on Windows.

Test integration: `npm run verify` now also runs v35 regression checks and security boundary tests. Previously stale restore/gallery source assertions were aligned with secureHandle and the current bulk-selection implementation. The checks validate code invariants only; they are not an end-to-end MSIX run.
