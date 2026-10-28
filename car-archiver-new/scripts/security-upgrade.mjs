import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const excluded = new Set(['node_modules', 'dist', 'dist-electron', '.git', '.tmp-trash-integration', '.tmp-service-integration']);
const sourceExtensions = /\.(tsx?|jsx?|mjs|cjs)$/i;
const imports = [];
function scan(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (excluded.has(entry.name) || entry.name.startsWith('.tmp-')) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) scan(path);
    else if (sourceExtensions.test(entry.name)) {
      const content = readFileSync(path, 'utf8');
      if (/\b(?:from\s*['"]react-router(?:-dom)?['"]|import\s*\(\s*['"]react-router(?:-dom)?['"]|require\s*\(\s*['"]react-router(?:-dom)?['"])/.test(content)) imports.push(path);
    }
  }
}
scan(join(root, 'src'));
if (existsSync(join(root, 'electron'))) scan(join(root, 'electron'));
if (imports.length) {
  console.error('Router imports found; refusing to remove dependency:', imports.join('\n'));
  process.exit(1);
}
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
function run(args) {
  console.log(`\n> npm ${args.join(' ')}`);
  const result = spawnSync(npm, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error || result.status !== 0) {
    console.error('Upgrade interrupted; inspect package.json and package-lock.json before running npm ci.');
    process.exit(result.status || 1);
  }
}
console.log('Security dependency update: keep existing Electron/ABI toolchain unchanged.');
run(['install', '--save-exact', '--ignore-scripts', 'drizzle-orm@0.45.4']);
run(['uninstall', '--save', '--ignore-scripts', 'react-router-dom']);
console.log('\nDependency upgrade and lockfile update completed. Next run: npm run native:check && npm run verify && npm audit --omit=dev');
