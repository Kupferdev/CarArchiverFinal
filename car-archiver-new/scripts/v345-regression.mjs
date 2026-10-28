import fs from 'node:fs';
import assert from 'node:assert/strict';
const read = file => fs.readFileSync(file,'utf8');
const topbar=read('src/components/dashboard/Topbar.tsx');
const tabs=read('src/components/dashboard/Tabbar.tsx');
const settings=read('src/components/dashboard/SettingsPage.tsx');
const checks=[
 ['theme complaint tooltip',read('src/components/dashboard/ServiceList.module.css').includes('background:var(--bg-panel)')],
 ['settings on tab row',tabs.includes('styles.settingsGear') && !topbar.includes('styles.settingsButton')],
 ['tab scrolling',tabs.includes('styles.tabScroll')],
 ['search blur keeps query',topbar.includes('setFocused(false)') && topbar.includes('searchRef.current?.contains')],
 ['three result icons',['car','customer','service'].every(k=>topbar.includes(`kind="${k}"`))],
 ['independent UI scaling',settings.includes('cararchiver-ui-scale') && read('src/components/dashboard/HomePage.module.css').includes('zoom: var(--user-ui-scale')],
 ['font scaling',read('src/components/dashboard/ServiceList.module.css').includes('var(--user-font-factor')],
 ['theme titlebar sync',read('electron/ipcHandlers.ts').includes('window.setBackgroundColor(colors[theme].color)')],
];
for(const [name,passed] of checks){console.log(`${passed?'PASS':'FAIL'} ${name}`); assert(passed,name)}
console.log(`v34.5 regression: ${checks.length} passed`);
