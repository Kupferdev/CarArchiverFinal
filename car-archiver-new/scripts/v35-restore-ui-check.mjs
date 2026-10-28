import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=(file)=>fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const backups=read('src/main/data/dataBackup.ts');
const restore=read('src/main/data/dataRestore.ts');
const main=read('electron/main.ts');
const handler=read('electron/ipcHandlers.ts');
const gallery=read('src/components/dashboard/ServicePhotoGallery.tsx');
const styles=read('src/components/dashboard/SettingsPage.module.css');
const ipc=read('src/shared/ipcChannels.ts');
const tests=[
 ['SQLite backup API',backups.includes('getDb().backup(')],
 ['Restore validates integrity',restore.includes("pragma('quick_check')")],
 ['Restore refuses symlinks',restore.includes('entry.isSymbolicLink()')],
 ['Restore stages instead of replacing live open DB',restore.includes('stagedDb') && main.includes('applyPendingRestore(')],
 ['Restore saves old files to rescue',restore.includes('CarArchiver-before-restore-')],
 ['Rollback of moved files',restore.includes('movedSidecars') && restore.includes('fs.renameSync(original, liveDb+suffix)')],
 ['IPC whitelist includes restore',ipc.includes('"restore-data"') && (handler.includes("secureHandle('restore-data'") || handler.includes("ipcMain.handle('restore-data'"))],
 ['Shared selection toolbar reused',gallery.includes('<BulkSelectionActions')],
 ['Viewer only one zoom indicator',!gallery.includes('>100%</button>') && gallery.includes('styles.zoomGroup')],
 ['Storage sections separated',styles.includes('.storageSection')],
];
for(const [name,passed] of tests){assert.ok(passed,name);console.log('✓',name)}
console.log(`${tests.length} restore/media UI source checks passed.`)
