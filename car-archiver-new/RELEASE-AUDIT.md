# Car Service Archiver v35 completion candidate — audit notes

## Implemented in this source update
- Developer feedback uses `carservicearchiver.support@gmail.com` through the OS email handler only; no embedded Gmail password/token.
- 14-locale feedback controls, photo success/failure toasts, startup splash copy, clock-style settings and legal-section navigation.
- Five clock variants; expanded system font-stack selectors; scoped CSS fixes for EULA contrast.
- Development restore queues data replacement for the next startup without exiting or calling `app.relaunch()`. Users must close the dev app and rerun `npm run dev`; packaged app still calls `app.relaunch()`.
- About section displays prior translated EULA; privacy/KVKK are explicitly nonfinal drafts.

## Privacy review — preliminary, NOT a network-verified assurance
- Static inspection of project-owned TypeScript/TSX did not find direct `fetch`, Axios, WebSocket or analytics calls. The main process opens only a bounded `mailto:` URL when the user submits feedback.
- SQLite, media, backup and CSV modules should be reviewed with filesystem tests, including symbolic-link/path safety and orphan cleanup.
- Third-party dependencies, Electron internals, Windows Store services and runtime traffic were NOT audited. Do NOT assert that absolutely no network traffic exists.
- Runtime capture to do on Windows packaged build: Process Monitor/TCPView and OS firewall/packet trace across CRUD, media, backups, restores, prints, idle and offline workflows.
- Publish legal texts only after contact details, actual flows, recipients, retention, rights, overseas email-provider transfers and controller roles are validated with legal review. The drafts shown in app are NOT the public Microsoft Store privacy policy.
- Public privacy policy URL, publication/versioning and review of 14 full legal translations are still pending.

## Testing limits
- Native `better-sqlite3` on Windows and Electron GUI/restart cannot be validated in this Linux workspace. Test the project on Windows using `npm ci`, `npm run verify`, `npm run dev` and a fully packaged build before release.
