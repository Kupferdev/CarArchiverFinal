import fs from 'node:fs';
import assert from 'node:assert/strict';
const get = p => fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ipc=get('electron/ipcHandlers.ts');
const main=get('electron/main.ts');
const settings=get('src/components/dashboard/SettingsPage.tsx');
const restore=get('src/main/data/dataRestore.ts');
const hasHandler = name => ipc.includes(`secureHandle('${name}'`) || ipc.includes(`ipcMain.handle('${name}'`);
const confirmHandlerAt = Math.max(ipc.indexOf("secureHandle('confirm-restore-data'"), ipc.indexOf("ipcMain.handle('confirm-restore-data'"));
const checks=[
['selection and confirmation separated',hasHandler('restore-data')&&hasHandler('confirm-restore-data')],
['native restore confirmation removed',!ipc.includes('Restore and restart\'')&&!ipc.includes('dialog.showMessageBox(owner,options)')],
['renderer restore modal',settings.includes('role="dialog"')&&settings.includes('confirm-restore-data')],
['replacement explicitly not merger',settings.includes('two databases')||settings.includes('does not merge databases')],
['SQLite explicitly closed before relaunch',/closeDrizzle\(\);[\s\S]{0,80}closeDb\(\);[\s\S]{0,350}app.relaunch\(\);[\s\S]{0,300}app.exit\(0\)/.test(ipc)],
['startup splash before migration',main.indexOf('createStartupSplash();')<main.indexOf('applyPendingRestore(app.getPath')],
['restore marker written only on confirmation',ipc.indexOf('prepareRestore(selected')>confirmHandlerAt],
['recovery rollback exists',restore.includes('movedSidecars')&&restore.includes('fs.renameSync(original, liveDb+suffix)')],
];
for (const [name,ok] of checks){assert.ok(ok,name);console.log('PASS',name)}
