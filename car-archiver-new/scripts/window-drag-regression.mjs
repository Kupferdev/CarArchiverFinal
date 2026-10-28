/** Windows-native window movement checks. These guard DOM/CSS and Electron
 * configuration; actual click-drag must still be checked in Windows. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = (p) => fs.readFileSync(p, 'utf8');
const main = read('electron/main.ts');
const appCss = read('src/App.css');
const app = read('src/App.tsx');
const header = read('src/components/dashboard/Topbar.module.css');
const tabCss = read('src/components/dashboard/Tabbar.module.css');
const topbar = read('src/components/dashboard/Topbar.tsx');
assert.match(main, /titleBarStyle:\s*'hidden'/);
assert.match(main, /titleBarOverlay:/);
assert.match(main, /movable:\s*true/);
assert.match(main, /\.startupDrag\{[^}]*-webkit-app-region:drag/);
assert.match(main, /<div class="startupDrag" aria-hidden="true"><\/div>/);
assert.match(app, /className="windowChrome"/);
assert.match(appCss, /html\.windows-overlay \.windowChrome\s*\{[^}]*display:\s*block;[^}]*-webkit-app-region:\s*drag/s, 'Windows title strip must override base display:none');
// The header must provide multiple independent drag surfaces, even when the
// search consumes most of the flex row.  No-drag applies ONLY to controls.
assert.match(header, /\.topbar\s*\{[^}]*-webkit-app-region:\s*drag/s);
assert.match(header, /\.headerDragArea\s*\{[^}]*min-width:[^}]*-webkit-app-region:\s*drag/s);
assert.match(header, /\.appTitle\s*\{[^}]*-webkit-app-region:\s*drag/s);
assert.match(header, /\.brandHome\s*\{[^}]*-webkit-app-region:\s*no-drag/s);
assert.match(header, /\.searchWrap\s*\{[^}]*-webkit-app-region:\s*no-drag/s);
assert.match(header, /\.clock, \.clock \*\s*\{[^}]*-webkit-app-region:\s*drag/s);
assert.match(topbar, /className=\{styles\.headerDragArea\}/);
assert.match(topbar, /<div className=\{styles\.brandWrap\}>/);
assert.match(topbar, /<button type="button" className=\{styles\.brandHome\}/);
assert.match(tabCss, /\.tabbar, \.tabScroll\s*\{[^}]*-webkit-app-region:\s*drag/s);
assert.match(tabCss, /\.tabHome, \.tab, \.tab \*, \.settingsGear, \.contextMenu, \.contextMenu \*\s*\{[^}]*-webkit-app-region:\s*no-drag/s);
console.log('PASS independent native top strip, app title, blank header/clock, blank tab strip; controls remain clickable.');
