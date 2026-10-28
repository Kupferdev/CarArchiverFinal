import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(path.join(root, name), 'utf8');
const service = read('src/services/serviceService.ts');
const form = read('src/components/dashboard/ServiceForm.tsx');
const ipc = read('electron/ipcHandlers.ts');
const dto = read('src/shared/dtos/serviceDtos.ts');

for (const method of ['createService', 'updateService', 'deleteService']) {
  const section = service.match(new RegExp(`async ${method}\\([\\s\\S]*?(?=\\n  async |\\n})`))?.[0];
  assert.ok(section, `Missing ${method}`);
  assert.match(section, /useDb\(\)\.transaction\(\(tx\) =>/, `Missing synchronous transaction in ${method}`);
  assert.doesNotMatch(section, /\.transaction\(async\b/, `Async SQLite transaction in ${method}`);
  assert.doesNotMatch(section, /\bawait\b/, `Await inside ${method} write path`);
}
assert.match(service, /incomingIds\.has\(old\.partId\)/);
assert.match(service, /tx\.update\(Parts\)/);
assert.match(dto, /partId\?: number/);
assert.match(form, /partId: part\.partId/);
assert.match(ipc, /partId = item\.partId/);
assert.doesNotMatch(service, /deleteByServiceId\(serviceId\)/);
console.log('Service atomicity source invariants passed. (Static check, not database integration test.)');
