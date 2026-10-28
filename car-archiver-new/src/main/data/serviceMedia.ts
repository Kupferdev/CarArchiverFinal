/** Local file attachments. Never put image bytes in SQLite. */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { getDb, getActiveDbPath } from './db';
import { ensureNoBackupInProgress } from './dataBackup';
import type { ServiceMediaItem } from '../../shared/ipcApi';
import { resolveManagedMediaFile } from './managedMediaPath';

const MAX_IMAGE_BYTES = 16 * 1024 * 1024;
const MAX_IMAGES_PER_SERVICE = 500;
const FORMATS = new Map([
  ['image/jpeg', { ext: '.jpg', prefix: Buffer.from([0xff, 0xd8, 0xff]) }],
  ['image/png', { ext: '.png', prefix: Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]) }],
  ['image/webp', { ext: '.webp', prefix: Buffer.from('RIFF') }],
]);

function mediaRoot(): string {
  const dbPath = getActiveDbPath();
  if (!dbPath) throw new Error('Database not opened.');
  return path.join(path.dirname(dbPath), 'media');
}
function serviceDir(serviceId: number): string {
  return path.join(mediaRoot(), 'services', String(serviceId));
}
function safeFile(relativePath: string): string {
  return resolveManagedMediaFile(mediaRoot(), relativePath);
}
function checkService(serviceId: number): void {
  if (!Number.isSafeInteger(serviceId) || serviceId <= 0) throw new Error('Invalid service ID.');
  const row = getDb().prepare('SELECT serviceId FROM Services WHERE serviceId = ?').get(serviceId);
  if (!row) throw new Error('Service not found.');
}
function inspectImage(filepath: string): { ext: string; mime: string; bytes: number } {
  const stat = fs.statSync(filepath);
  if (!stat.isFile() || stat.size < 12 || stat.size > MAX_IMAGE_BYTES) throw new Error('Image exceeds the 16 MB limit or is invalid.');
  const fd = fs.openSync(filepath, 'r');
  const signature = Buffer.alloc(16);
  try { fs.readSync(fd, signature, 0, signature.length, 0); } finally { fs.closeSync(fd); }
  for (const [mime, format] of FORMATS) {
    if (!signature.subarray(0, format.prefix.length).equals(format.prefix)) continue;
    if (mime === 'image/webp' && signature.toString('ascii',8,12) !== 'WEBP') continue;
    return { ext: format.ext, mime, bytes: stat.size };
  }
  throw new Error('Only JPEG, PNG, and WebP images are supported.');
}
export function listServiceMedia(serviceId: number): ServiceMediaItem[] {
  checkService(serviceId);
  return getDb().prepare(`SELECT mediaId, serviceId, originalName, mimeType, bytes, caption, addedAt
     FROM ServiceMedia WHERE serviceId = ? ORDER BY addedAt, mediaId`).all(serviceId) as ServiceMediaItem[];
}
export function addServiceMedia(serviceId: number, filePaths: string[]): ServiceMediaItem[] {
  ensureNoBackupInProgress();
  checkService(serviceId);
  const db = getDb();
  if (filePaths.length > 100) throw new Error('Too many images selected.');
  const count = (db.prepare('SELECT COUNT(*) AS n FROM ServiceMedia WHERE serviceId = ?').get(serviceId) as {n:number}).n;
  if (count + filePaths.length > MAX_IMAGES_PER_SERVICE) throw new Error('Maximum 500 images per service.');
  const dir = serviceDir(serviceId);
  // Verify existing ancestor directories BEFORE mkdirSync could traverse a junction.
  safeFile(`services/${serviceId}/${randomUUID()}.jpg`);
  fs.mkdirSync(dir, { recursive: true });
  // Check the resolved directory too: an existing symlink must not escape media/.
  const rootReal = fs.realpathSync(mediaRoot());
  const dirReal = fs.realpathSync(dir);
  if (!dirReal.startsWith(rootReal + path.sep)) throw new Error('Invalid media directory.');
  const copied: string[] = [];
  try {
    db.transaction(() => {
      for (const source of filePaths) {
        const info = inspectImage(source);
        const key = `${randomUUID()}${info.ext}`;
        const relativePath = `services/${serviceId}/${key}`;
        const finalPath = safeFile(relativePath);
        fs.copyFileSync(source, finalPath, fs.constants.COPYFILE_EXCL);
        copied.push(finalPath);
        db.prepare(`INSERT INTO ServiceMedia (serviceId, relativePath, originalName, mimeType, bytes)
          VALUES (?, ?, ?, ?, ?)`).run(serviceId, relativePath, path.basename(source).slice(0, 220), info.mime, info.bytes);
      }
    })();
  } catch (error) {
    // Roll back files alongside the rolled-back SQLite rows.
    for (const filepath of copied) fs.rmSync(filepath, {force:true});
    throw error;
  }
  return listServiceMedia(serviceId);
}
function fetchMetadata(mediaId: number): { relativePath: string; mimeType: string } {
  if (!Number.isSafeInteger(mediaId) || mediaId <= 0) throw new Error('Invalid media ID.');
  const row = getDb().prepare('SELECT relativePath, mimeType FROM ServiceMedia WHERE mediaId = ?').get(mediaId) as {relativePath:string; mimeType:string}|undefined;
  if (!row) throw new Error('Media not found.');
  return row;
}
export function readServiceMedia(mediaId: number): string {
  const row = fetchMetadata(mediaId);
  const file = safeFile(row.relativePath);
  if (fs.statSync(file).size > MAX_IMAGE_BYTES) throw new Error('Image exceeds allowed size.');
  return `data:${row.mimeType};base64,${fs.readFileSync(file).toString('base64')}`;
}
export function removeServiceMedia(mediaId: number): boolean {
  ensureNoBackupInProgress();
  const row = fetchMetadata(mediaId);
  // Remove only this media row. File delete is last so a failed query does not lose it.
  const changed = getDb().prepare('DELETE FROM ServiceMedia WHERE mediaId = ?').run(mediaId).changes > 0;
  if (changed) {
    try { fs.rmSync(safeFile(row.relativePath), { force: true }); }
    catch (error) { console.error('Unlinked media file needs cleanup:', row.relativePath, error); }
  }
  return changed;
}
