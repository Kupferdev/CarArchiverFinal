import fs from 'node:fs';
import assert from 'node:assert/strict';
const file = fs.readFileSync(new URL('../src/components/dashboard/SettingsExtras.tsx', import.meta.url), 'utf8');
const ipc = fs.readFileSync(new URL('../electron/ipcHandlers.ts', import.meta.url), 'utf8');
for (const [key, label] of Object.entries({ bug: 'Bug Report', feature: 'Feature Request', help: 'Support' })) {
  assert.ok(file.includes(`${key}:'${label}'`), `Missing stable Gmail subject category: ${key}`);
}
assert.ok(file.includes('${mailCategory[kind]}'), 'Email subject must use language-independent category');
assert.ok(!file.includes('${typeLabel}'), 'Email subject must not use localized category');
assert.ok(ipc.includes('mailto:carservicearchiver.support@gmail.com'), 'Support inbox target changed');
assert.ok(ipc.includes('encodeURIComponent(subject)'), 'Email subject must be URI-encoded');
console.log('PASS: Gmail-compatible categories are fixed across all locales.');
