/** Keep better-sqlite3 compiled for the Electron ABI used by this project.
 * Usage: node scripts/native-abi.mjs [ensure|check|rebuild]
 * - ensure: validate actual Electron runtime loading; rebuild only if needed
 * - check: non-mutating runtime check
 * - rebuild: force Electron-native compilation
 * Node-based SQLite tests intentionally use their existing Electron fallback.
 */
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const mode = process.argv[2] || 'ensure';
if (!['ensure', 'check', 'rebuild'].includes(mode)) {
  console.error('Usage: node scripts/native-abi.mjs [ensure|check|rebuild]');
  process.exit(2);
}

function validateElectron() {
  const electronBinary = require('electron');
  const script = `const Database = require('better-sqlite3'); const db = new Database(':memory:'); try { db.prepare('SELECT 1 AS ok').get(); console.log('better-sqlite3 OK: Electron ' + process.versions.electron + ', ABI ' + process.versions.modules); } finally { db.close(); }`;
  const result = spawnSync(electronBinary, ['-e', script], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status === 0) {
    process.stdout.write(result.stdout || 'Electron native module check passed.\n');
    return true;
  }
  if (result.stderr) process.stderr.write(result.stderr);
  return false;
}

try {
  if (mode !== 'rebuild' && validateElectron()) process.exit(0);
  if (mode === 'check') {
    console.error('Electron cannot load better-sqlite3. Run npm run native:rebuild.');
    process.exit(1);
  }
  const { rebuild } = await import('@electron/rebuild');
  const version = require('electron/package.json').version;
  console.log(`Rebuilding better-sqlite3 for Electron ${version}...`);
  await rebuild({
    buildPath: root,
    electronVersion: version,
    arch: process.arch,
    force: true,
    onlyModules: ['better-sqlite3'],
  });
  if (!validateElectron()) throw new Error('Electron ABI validation failed even after rebuild.');
  console.log('Electron ABI ready.');
} catch (error) {
  console.error('Native SQLite setup failed:', error);
  console.error('On Windows, make sure the Electron binary and native build tools are available.');
  process.exit(1);
}
