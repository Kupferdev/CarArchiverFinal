import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  'src/main/data/db.ts',
  'src/main/data/drizzle/drizzleDb.ts',
  'src/main/data/migrations/migrationRunner.ts',
  'src/shared/ipcApi.ts',
  'electron/preload.ts',
  'electron/ipcHandlers.ts',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing required source file: ${file}`);
  }
}

const source = fs.readFileSync(path.join(root, 'electron/preload.ts'), 'utf8');
if (!source.includes('assertAllowedChannel')) throw new Error('IPC channel guard is missing.');

const migration = fs.readFileSync(path.join(root, 'src/main/data/migrations/migrationRunner.ts'), 'utf8');
if (!migration.includes('schema_migrations')) throw new Error('Migration history table is missing.');
if (!migration.includes('ON DELETE CASCADE')) throw new Error('Expected cascade relationship is missing.');

const config = fs.readFileSync(path.join(root, 'src/main/helpers/config/configManager.ts'), 'utf8');
if (!config.includes('data_carArchiver.sqlite')) throw new Error('Canonical database filename is missing.');

console.log('Smoke checks passed.');
