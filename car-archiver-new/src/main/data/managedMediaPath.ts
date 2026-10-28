/** Resolve generated media keys without ever following symlinks/junctions in media/. */
import fs from 'node:fs';
import path from 'node:path';

const MEDIA_KEY = /^services\/[1-9]\d*\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|webp)$/;

export function resolveManagedMediaFile(mediaRoot: string, relative: string): string {
  if (typeof relative !== 'string' || !MEDIA_KEY.test(relative)) throw new Error('Unsafe media file path.');
  const root = path.resolve(mediaRoot);
  const file = path.resolve(root, ...relative.split('/'));
  if (!file.startsWith(root + path.sep)) throw new Error('Unsafe media file path.');
  // lstat() checks each directory component rather than the resolved destination.
  // realpath() alone would accept junctions and symbolic links if both roots move.
  const keys = [root, path.join(root, 'services'), path.join(root, 'services', relative.split('/')[1]), file];
  for (let index = 0; index < keys.length; index++) {
    try {
      const item = fs.lstatSync(keys[index]);
      if (item.isSymbolicLink()) throw new Error('Symbolic links are not allowed in managed media.');
      if (index < keys.length - 1 && !item.isDirectory()) throw new Error('Invalid managed media directory.');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') break;
      throw error;
    }
  }
  return file;
}
