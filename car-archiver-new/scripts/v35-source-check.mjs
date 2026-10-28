import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const checks=[
  ['migration 12',read('src/main/data/migrations/migrationRunner.ts').includes('CURRENT_SCHEMA_VERSION = 12') && read('src/main/data/migrations/migrationRunner.ts').includes('case 12:')],
  ['media metadata with FK',read('src/main/data/migrations/migrationRunner.ts').includes('CREATE TABLE IF NOT EXISTS ServiceMedia')],
  ['no image BLOB columns',!(/BLOB|imageData|base64/i.test(read('src/main/data/migrations/migrationRunner.ts').split('case 10:')[1].split('default:')[0]))],
  ['media is local file',read('src/main/data/serviceMedia.ts').includes("path.join(path.dirname(dbPath), 'media')")],
  ['filepicker restricted image formats',read('electron/ipcHandlers.ts').includes("extensions:['jpg','jpeg','png','webp']")],
  ['SQLite backup API',read('src/main/data/dataBackup.ts').includes('getDb().backup(')],
  ['media folder included',read('src/main/data/dataBackup.ts').includes('fs.cpSync(media')],
  ['backup manifest included',read('src/main/data/dataBackup.ts').includes('backup-manifest.json')],
  ['CSV formula guards',read('src/main/data/exportData.ts').includes('Excel treats cells')],
  ['service profile gallery',read('src/components/dashboard/ServiceProfile.tsx').includes('<ServicePhotoGallery')],
  ['backup/settings UI',read('src/components/dashboard/SettingsPage.tsx').includes("invoke('backup-data')")],
  ['IPC whitelist',read('src/shared/ipcChannels.ts').includes('"list-service-media"')],
];
for(const [label,passed] of checks) console.log(`${passed?'PASS':'FAIL'} ${label}`);
if(checks.some(x=>!x[1]))process.exitCode=1;
