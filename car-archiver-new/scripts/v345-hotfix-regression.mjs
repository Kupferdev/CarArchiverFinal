import fs from 'node:fs';
const read = (p) => fs.readFileSync(p, 'utf8');
const checks = [
  ['form tabs cannot pin', /export const isPinnableTab/.test(read('src/store/tabStore.ts')) && /isPinnableTab\(tab\)/.test(read('src/components/dashboard/Tabbar.tsx')) && /isPinnableTab\(currentTab\)/.test(read('src/components/dashboard/Tabbar.tsx'))],
  ['old form pins not restored', /raw\.filter\(tab => tab\.pinned && tab\.id && isPinnableTab\(tab\)\)/.test(read('src/store/tabStore.ts'))],
  ['pin handler guarded', /tab\.id === id && isPinnableTab\(tab\)/.test(read('src/store/tabStore.ts'))],
  ['scale 50-150', /min="50" max="150"/.test(read('src/components/dashboard/SettingsPage.tsx')) && /Math\.max\(50, Math\.min\(150/.test(read('src/App.tsx'))],
  ['borderless settings', /\.settingsGear \{ border: 0;/.test(read('src/components/dashboard/Tabbar.module.css'))],
  ['selection disabled outside edit fields', /\.appContainer, \.appContainer \*/.test(read('src/App.css')) && /contenteditable/.test(read('src/App.css'))],
  ['unused imports eliminated', !/import \{ (FuelTypesRepository|BodyTypesRepository) \}/.test(read('electron/ipcHandlers.ts')) && !/i18n, t \} = useTranslation/.test(read('src/App.tsx'))],
  ['safe PDF names', /character\.charCodeAt\(0\) < 32/.test(read('electron/ipcHandlers.ts')) && !/\\x00-\\x1f/.test(read('electron/ipcHandlers.ts'))],
  ['hook deps aligned', /\[fuelTypes, i18n\.language\]/.test(read('src/components/dashboard/CarForm.tsx')) && /\[carId, addToast, i18n\]/.test(read('src/components/dashboard/CarForm.tsx'))],
];
let failed = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed++; }
if (failed) process.exitCode = 1;
else console.log(`${checks.length} hotfix static checks passed`);
