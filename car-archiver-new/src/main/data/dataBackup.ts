/** One-click portable snapshot of SQLite + local media. No file-based SQLite copy while open. */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { getDb, getActiveDbPath } from './db';

let backupRunning = false;
export function ensureNoBackupInProgress(): void {
  if (backupRunning) throw new Error('A backup is running. Try again after it completes.');
}
export async function backupData(destinationParent: string): Promise<string> {
  ensureNoBackupInProgress();
  backupRunning = true;
  try {
  const liveDbPath = getActiveDbPath();
  if (!liveDbPath) throw new Error('Database is not open.');
  const safeParent = path.resolve(destinationParent);
  const sourceRoot = path.dirname(liveDbPath);
  const media = path.join(sourceRoot, 'media');
  if (safeParent === sourceRoot || safeParent.startsWith(sourceRoot + path.sep)) {
    throw new Error('Choose a folder outside the active CarArchiver data directory.');
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const name = `CarArchiver-backup-${stamp}-${randomUUID().slice(0, 8)}`;
  const temporary = path.join(safeParent, `${name}.partial`);
  const final = path.join(safeParent, name);
  fs.mkdirSync(temporary, { recursive: false });
  try {
    // better-sqlite3 backup handles SQLite WAL/journaling correctly.
    await getDb().backup(path.join(temporary, 'data_carArchiver.sqlite'));
    const snapshot = path.join(temporary, 'data_carArchiver.sqlite');
    const size = fs.statSync(snapshot).size;
    if (!size) throw new Error('Database backup is empty.');
    // Copy the whole managed media folder, including files from old installations.
    if (fs.existsSync(media)) fs.cpSync(media, path.join(temporary, 'media'), {recursive:true, errorOnExist:true, force:false});
    else fs.mkdirSync(path.join(temporary, 'media'));
    fs.writeFileSync(path.join(temporary, 'backup-manifest.json'), JSON.stringify({
      kind: 'CarArchiverBackup', formatVersion: 1, timestamp: new Date().toISOString(),
      databaseFile: 'data_carArchiver.sqlite', mediaFolder: 'media'
    }, null, 2), 'utf8');
    fs.renameSync(temporary, final);
    return final;
  } catch (error) {
    fs.rmSync(temporary, { recursive:true, force:true });
    throw error;
  }
  } finally { backupRunning = false; }
}
