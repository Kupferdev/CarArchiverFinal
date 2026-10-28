import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

async function loadPureTs(file) {
  const source = await readFile(file, 'utf8');
  let code;
  try {
    const { transform } = await import('esbuild');
    ({ code } = await transform(source, { loader: 'ts', format: 'esm', target: 'es2020' }));
  } catch (error) {
    // Local audit environments can lack node_modules. Windows npm ci provides esbuild.
    const { stripTypeScriptTypes } = await import('node:module');
    if (typeof stripTypeScriptTypes !== 'function') throw error;
    code = stripTypeScriptTypes(source);
  }
  return import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
}

const { isPermittedRendererRequest } = await loadPureTs('electron/networkPolicy.ts');
const dev = 'http://localhost:5173/';
const checks = [
  ['file:///C:/app/index.html', undefined, true],
  ['data:text/html,test', undefined, true],
  ['https://example.com/upload', undefined, false],
  ['http://127.0.0.1:5173/', undefined, false],
  ['ws://localhost:5173/', undefined, false],
  ['http://localhost:5173/@vite/client', dev, true],
  ['ws://localhost:5173/?token=abc', dev, true],
  ['https://localhost:5173/', dev, false],
  ['http://localhost:5174/', dev, false],
  ['http://127.0.0.1:5173/', dev, false],
  ['https://evil.example/api', dev, false],
  ['http://localhost:5173/', 'http://0.0.0.0:5173/', false],
  ['https://evil.example', 'https://evil.example/', false],
];
for (const [url, origin, expected] of checks) {
  assert.equal(isPermittedRendererRequest(url, origin), expected, `Network policy: ${url}`);
}

const { resolveManagedMediaFile } = await loadPureTs('src/main/data/managedMediaPath.ts');
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'cararchiver-media-boundary-'));
const media = path.join(workspace, 'media');
const outside = path.join(workspace, 'outside');
const key = '5d79ba18-e4c7-443d-ae31-31ad9d719f53.jpg';
try {
  fs.mkdirSync(path.join(media, 'services', '1001'), { recursive: true });
  fs.mkdirSync(outside);
  const destination = path.join(media, 'services', '1001', key);
  assert.equal(resolveManagedMediaFile(media, `services/1001/${key}`), destination);
  assert.throws(() => resolveManagedMediaFile(media, '../outside/' + key), /Unsafe/);
  assert.throws(() => resolveManagedMediaFile(media, `services/1001/../../${key}`), /Unsafe/);
  assert.throws(() => resolveManagedMediaFile(media, `services/1001/aaaaaaaa-bbbb.jpg`), /Unsafe/);
  assert.throws(() => resolveManagedMediaFile(media, `services/1001/${key}.exe`), /Unsafe/);
  const outsideFile = path.join(outside, key);
  fs.writeFileSync(outsideFile, 'outside-content');
  try {
    fs.symlinkSync(outsideFile, destination, 'file');
    assert.throws(() => resolveManagedMediaFile(media, `services/1001/${key}`), /Symbolic links/);
    fs.unlinkSync(destination);
    fs.rmSync(path.join(media, 'services', '1001'), { recursive: true });
    fs.symlinkSync(outside, path.join(media, 'services', '1001'), 'dir');
    assert.throws(() => resolveManagedMediaFile(media, `services/1001/${key}`), /Symbolic links/);
  } catch (error) {
    if (process.platform !== 'win32' || !['EPERM', 'EACCES'].includes(error?.code)) throw error;
    console.log('Windows symlink checks skipped (requires developer-mode permission).');
  }
  assert.equal(fs.readFileSync(outsideFile, 'utf8'), 'outside-content');
} finally {
  fs.rmSync(workspace, { recursive: true, force: true });
}
console.log('Offline renderer policy and managed-media path tests passed.');
