/** Restore at startup ONLY, before opening the live SQLite connection.
 * A verified snapshot is staged on the active data volume and the previous
 * database/media are moved into a timestamped rescue directory.
 */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import Database from 'better-sqlite3';

const MANIFEST = 'backup-manifest.json';
const DATABASE_FILE = 'data_carArchiver.sqlite';
const RESTORE_MARKER = 'pending-restore.json';

function verifyDirectory(folder: string): { database: string; media: string } {
  const backup = path.resolve(folder);
  const metadata = JSON.parse(fs.readFileSync(path.join(backup, MANIFEST), 'utf8')) as Record<string, unknown>;
  if (metadata.kind !== 'CarArchiverBackup' || metadata.formatVersion !== 1 || metadata.databaseFile !== DATABASE_FILE || metadata.mediaFolder !== 'media') {
    throw new Error('Unsupported backup format.');
  }
  const database = path.join(backup, DATABASE_FILE);
  const media = path.join(backup, 'media');
  if (!fs.statSync(database).isFile() || !fs.statSync(media).isDirectory() || fs.lstatSync(database).isSymbolicLink() || fs.lstatSync(media).isSymbolicLink()) throw new Error('Incomplete or unsafe backup.');
  // Never follow symbolic links inside a backup, including nested folders.
  const walk = (dir: string): void => {
    for (const name of fs.readdirSync(dir)) {
      const item = path.join(dir, name);
      const entry = fs.lstatSync(item);
      if (entry.isSymbolicLink() || (!entry.isDirectory() && !entry.isFile())) throw new Error('Backup has unsupported links or files.');
      if (entry.isDirectory()) walk(item);
    }
  };
  walk(media);
  const test = new Database(database, { readonly: true, fileMustExist: true });
  try {
    const result = test.pragma('quick_check') as { quick_check: string }[];
    if (result.length !== 1 || result[0]?.quick_check !== 'ok') throw new Error('Backup database integrity check failed.');
    for (const table of ['Customers','Cars','Services','Parts','ServiceMedia']) {
      if (!test.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table)) throw new Error(`Missing backup table: ${table}`);
    }
  } finally { test.close(); }
  return { database, media };
}

/** Validate before showing the in-app confirmation; leaves live files untouched. */
export function validateRestoreBackup(backupFolder: string): void { verifyDirectory(backupFolder); }

/** Called from IPC: validate before creating any pending restore request. */
export function prepareRestore(backupFolder: string, userData: string, liveDbPath: string): void {
  const source = path.resolve(backupFolder);
  const liveRoot = path.dirname(path.resolve(liveDbPath));
  if (source === liveRoot || source.startsWith(liveRoot + path.sep)) throw new Error('Backup must be outside the live data folder.');
  verifyDirectory(source);
  const marker = path.join(userData, RESTORE_MARKER);
  fs.writeFileSync(marker, JSON.stringify({ backupFolder: source, liveDbPath: path.resolve(liveDbPath) }), { flag: 'wx' });
}

/** Called from main.ts before CreateDefaultDb; never while SQLite is open. */
export function applyPendingRestore(userData: string, configuredDbPath: string): string | null {
  const marker = path.join(userData, RESTORE_MARKER);
  if (!fs.existsSync(marker)) return null;
  const intent = JSON.parse(fs.readFileSync(marker, 'utf8')) as { backupFolder?: string; liveDbPath?: string };
  const liveDb = path.resolve(configuredDbPath);
  if (intent.liveDbPath !== liveDb || typeof intent.backupFolder !== 'string') throw new Error('Pending restore path does not match configured database.');
  const validated = verifyDirectory(intent.backupFolder);
  const root = path.dirname(liveDb);
  const token = `${new Date().toISOString().replace(/[:.]/g,'-')}-${randomUUID().slice(0,8)}`;
  const rescue = path.join(root, `CarArchiver-before-restore-${token}`);
  const stage = path.join(root, `.restore-staging-${token}`);
  fs.mkdirSync(rescue);
  fs.mkdirSync(stage);
  const liveMedia = path.join(root, 'media');
  const stagedDb = path.join(stage, path.basename(liveDb));
  const stagedMedia = path.join(stage, 'media');
  const movedSidecars: string[] = []; let movedMedia = false; let installedDb = false; let installedMedia = false;
  try {
    fs.copyFileSync(validated.database, stagedDb, fs.constants.COPYFILE_EXCL);
    fs.cpSync(validated.media, stagedMedia, { recursive: true, errorOnExist: true, force: false });
    // Preserve database sidecars from an interrupted/unclean previous process.
    for (const suffix of ['', '-wal', '-shm', '-journal']) {
      const old = liveDb + suffix;
      if (fs.existsSync(old)) { fs.renameSync(old, path.join(rescue, path.basename(old))); movedSidecars.push(suffix); }
    }
    if (fs.existsSync(liveMedia)) {fs.renameSync(liveMedia,path.join(rescue,'media'));movedMedia=true;}
    fs.renameSync(stagedDb, liveDb); installedDb = true;
    fs.renameSync(stagedMedia, liveMedia); installedMedia = true;
    fs.rmSync(marker);
    return rescue;
  } catch(error) {
    if (installedDb) fs.rmSync(liveDb, {force:true});
    if (installedMedia) fs.rmSync(liveMedia,{recursive:true,force:true});
    for (const suffix of movedSidecars) {
      const original = path.join(rescue, path.basename(liveDb+suffix));
      if (fs.existsSync(original)) fs.renameSync(original, liveDb+suffix);
    }
    if (movedMedia && fs.existsSync(path.join(rescue,'media'))) fs.renameSync(path.join(rescue,'media'),liveMedia);
    throw error;
  } finally {fs.rmSync(stage,{recursive:true,force:true});}
}
