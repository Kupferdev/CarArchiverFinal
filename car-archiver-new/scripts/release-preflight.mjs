/** Read-only Store release gate: no npm install, no data access, no DB migrations. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const builder = read('electron-builder.json5');
const evidence = (name) => {
  try { return read(name); } catch { return ''; }
};
const policyEvidence = evidence('PRIVACY-POLICY-PUBLIC.md');
const identityEvidence = evidence('STORE-IDENTITY-APPROVED.md');
const msixEvidence = evidence('WINDOWS-MSIX-SIGNOFF.md');
const publishedPrivacyUrl = policyEvidence.match(/^Public URL:\s*(https:\/\/\S+)/mi)?.[1] || '';
const verifiedPrivacyUrl = (() => {
  try {
    const u = new URL(publishedPrivacyUrl);
    return u.protocol === 'https:' && !/(?:^|\.)(?:example\.(?:com|org|net)|localhost|invalid)$/i.test(u.hostname)
      && !/[\[\]<>]/.test(publishedPrivacyUrl);
  } catch { return false; }
})();
const checks = [];
const advisories = [];
const add = (id, ok, message) => checks.push({ id, ok, message });
const warn = (id, message) => advisories.push({ id, message });

add('lockfile', lock.lockfileVersion === 3 &&
  JSON.stringify(lock.packages?.['']?.dependencies) === JSON.stringify(pkg.dependencies) &&
  JSON.stringify(lock.packages?.['']?.devDependencies) === JSON.stringify(pkg.devDependencies),
  'Manifest and lockfile root dependencies match');
add('drizzle', pkg.dependencies?.['drizzle-orm'] === '0.45.4', 'Reviewed Drizzle 0.45.4 is pinned');
add('router', !pkg.dependencies?.['react-router-dom'] && !lock.packages?.['node_modules/react-router-dom'],
  'Unused React Router dependency is absent');
add('no-bundled-db', !/(?:data_carArchiver\.sqlite|\.db\b|\.sqlite\b)/i.test(builder) &&
  /"files"\s*:\s*\[\s*"dist"\s*,\s*"dist-electron"\s*\]/.test(builder),
  'Packager includes only dist and dist-electron, not customer data');
add('uninstall', /"deleteAppDataOnUninstall"\s*:\s*false/.test(builder),
  'NSIS does not request AppData deletion');
add('asar', /"asar"\s*:\s*true/.test(builder), 'ASAR is enabled');
add('ipc', /sandbox\s*:\s*true/.test(read('electron/main.ts')) &&
 /contextIsolation\s*:\s*true/.test(read('electron/main.ts')) &&
 /nodeIntegration\s*:\s*false/.test(read('electron/main.ts')),
 'Main BrowserWindow has sandbox, context isolation, no Node integration');
add('privacy', verifiedPrivacyUrl && /^Legal review:\s*approved$/mi.test(policyEvidence),
 'Final legal-reviewed privacy policy with a real published HTTPS URL is recorded');
const packageIdentity = identityEvidence.match(/^Identity name:\s*(\S+)/mi)?.[1] || '';
const publisher = identityEvidence.match(/^Publisher:\s*(CN=.+)$/mi)?.[1]?.trim() || '';
const publisherDisplayName = identityEvidence.match(/^Publisher display name:\s*(.+)$/mi)?.[1]?.trim() || '';
const appxBlock = builder.match(/"appx"\s*:\s*\{([^}]+)\}/)?.[1] || '';
const identityMatches = !!packageIdentity && !!publisher && !!publisherDisplayName
  && appxBlock.includes(`"identityName": "${packageIdentity}"`)
  && appxBlock.includes(`"publisher": "${publisher}"`)
  && appxBlock.includes(`"publisherDisplayName": "${publisherDisplayName}"`);
add('store-identity', /^Partner Center review:\s*verified$/mi.test(identityEvidence) && identityMatches,
 'Partner Center screenshot identity/publisher verified against appx build config (not Store certification)');
const electronMajor = Number((pkg.devDependencies?.electron || '').match(/\d+/)?.[0] || 0);
// Electron version freshness is a security concern, NOT a blanket Microsoft Store
// minimum-version requirement for an offline desktop application.
// Keep this visible in the report without inventing a certification blocker.
if (electronMajor < 43) warn('electron-support',
  `Electron ${lock.packages?.['node_modules/electron']?.version || pkg.devDependencies?.electron} is outside current support; security risk requires assessment, but Store policy does not impose an Electron 43+ blanket rule`);
// A development 0.x version may need a different four-part Store package version.
// Check the generated AppxManifest.xml before submission, not package.json alone.
if (/^0\./.test(pkg.version)) warn('appx-version',
  `Development version ${pkg.version}: verify generated AppX identity version meets Store's four-part version rules (nonzero major, revision 0)`);
add('legacy-rebuilder', !pkg.devDependencies?.['electron-rebuild'],
 'Deprecated electron-rebuild dependency removed');
add('msix-validated', /^Install test:\s*PASS$/mi.test(msixEvidence)
  && /^Update test:\s*PASS$/mi.test(msixEvidence)
  && /^Uninstall external data:\s*PASS$/mi.test(msixEvidence)
  && /^Package SHA256:\s*[a-f0-9]{64}$/mi.test(msixEvidence)
  && /^Package version:\s*\d+\.\d+\.\d+(?:\.\d+)?$/mi.test(msixEvidence),
 'Windows package hash and install/update/uninstall data-preservation evidence recorded');

console.log('CarArchiver Store release preflight (read-only)');
for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'} ${c.id}: ${c.message}`);
for (const a of advisories) console.log(`WARN ${a.id}: ${a.message}`);
const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} required gates passed; ${failed.length} still open; ${advisories.length} advisory warning(s).`);
console.log('No customer database or media directories were read, changed or deleted.');
if (process.argv.includes('--strict') && failed.length) process.exitCode = 1;
