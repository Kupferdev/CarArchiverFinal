# Car Service Archiver — v34 source update

**Baseline:** v33 Language Pack. This ZIP is source code, not a built executable or an installer. No database data is included or intentionally modified.

## User-requested 12 corrections

1. Context-filtered vehicle lists: tab labels now use live i18n and the complete customer name via context label.
2. Fuel and body labels: actual seeded `FuelTypeTranslations` and `BodyTypeTranslations` SQLite tables are queried by locale, with English/base fallback. Car model input has no example placeholder.
3. Toasts: localized success counts; raw server errors are displayed as generic localized errors instead of mixed-language internal messages.
4. Vehicle-specific service list: locale-sensitive tab titles and Delivered column label.
5. Navigation: centralized calculated tab labels by route type and entity context, including customer↔vehicle↔service links.
6. New customer: neutral example email; no preselected +90 dial code; validate country dial code when a number is entered.
7. Service profile: hover preview colors replaced with theme tokens for navy, dark, light and dim.
8. Print: improved printer icon, advisor-note toggle in modal, A4 iframe preview, and native Electron print/PDF commands with `<plate> <localized service record>.pdf` save-dialog default name.
9. Title frame/header: duplicate icon and text removed from custom Windows drag band; drag, window controls and theme overlay retained. Home navigation on brand click; FAB fixed position; lower Electron minimum window size.
10. Settings gear to far-right header; saved font-size, icon-size and font-family controls with live sample and reset.
11. All existing tab headings including Settings recalculate in the chosen language immediately, without closing tabs.
12. Pin/unpin via tab edge and context menu; pinned tabs protected from regular, middle-click and bulk closes and persist across app restarts. Context menu uses theme tokens.

## Important behavior / limitations

- **Pinned tabs restore their route/context, not unsaved form field contents.** Unsaved fields are never silently persisted, including in pinned forms.
- Theme customization is based on browser-level CSS variables / UI zoom; Windows scaling and small-window behavior should be verified on the target OS.
- The custom A4 preview is in-app. Native printer-dialog preview support still depends on Windows/Electron; the separate **Save PDF** action provides an explicit default filename via `dialog.showSaveDialog`.
- Windows-managed borders/separators and rounded corners may depend on operating-system behavior.
- User-authored service text and stored records are not automatically translated or rewritten.
- Translation key coverage does not constitute human-reviewed language quality or runtime QA.
- Native Electron / SQLite end-to-end verification needs the project dependencies and Windows target environment.

## Verification

- `npm run test:smoke`
- `npm run test:i18n`
- `node scripts/v34-regression.mjs`
- Parse TS/TSX syntax using TypeScript compiler APIs.
- `npm run verify` (including full TS typecheck/database integration) **NOT successfully run** because `npm ci` fails in this container; do not treat this as a verified production build.

Do not overwrite your last working program or its SQLite database when testing this code. Install dependencies in a separate folder, run `npm run verify`, and check Windows print, themes, resizing and pinned-tab restart behavior.
