# Windows titlebar drag fix — 27 October 2026

- **Cause:** Only the separate 30-pixel upper band was marked draggable. The
  actual, visible application toolbar below it was not draggable, so dragging
  the logo/search/clock header did not move the window.
- **Fix:** The visible `Topbar` container is a native Electron drag region.
  Search and button elements remain native `no-drag` interactive controls.
  The read-only clock is explicitly draggable, including on narrow screens.
- The initial splash also has a small drag region, and `BrowserWindow`
  explicitly sets `movable: true`.
- Electron **30.5.1**, better-sqlite3 **12.6.2**, package-lock.json, database,
  migrations and the preceding nine UI bug fixes are unchanged.
- `npm run test:window-drag` validates source invariants. Actual native movement
  (including dragging from maximized/restoring) needs a Windows check.

## Windows verification

Run `npm ci`, `npm run verify`, `npm run dev` in a new unpacked folder.
Make sure the window is restored/not fullscreen, then click and drag a blank
part of the visible top toolbar **or the clock**. The window must move. Check
search focus/results and logo Home click still work. Also try dragging from
maximized to verify Windows restores the window as expected.
