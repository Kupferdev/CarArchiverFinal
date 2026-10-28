/** Real SQLite integration test. Requires installed project dependencies. Uses a disposable DB only. */
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const testDir = path.join(root, '.tmp-service-integration');
try {
  const SQLite = require('better-sqlite3');
  new SQLite(':memory:').close();
} catch (error) {
  if (/NODE_MODULE_VERSION|compiled against a different Node\.js version/.test(String(error.message)) && !process.env.DB_TEST_IN_ELECTRON) {
    const child = spawnSync(require('electron'), [fileURLToPath(import.meta.url)], {
      stdio: 'inherit', env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', DB_TEST_IN_ELECTRON: '1' },
    });
    process.exit(child.status ?? 1);
  }
  throw error;
}
fs.rmSync(testDir, { recursive: true, force: true });
fs.mkdirSync(testDir, { recursive: true });
try {
  const { build } = await import('esbuild');
  const outfile = path.join(testDir, 'service-test.mjs');
  await build({
    stdin: {
      contents: `
        export { CreateDefaultDb, closeDb, getDb } from './src/main/data/db.ts';
        export { runDatabaseMigrations } from './src/main/data/migrations/migrationRunner.ts';
        export { initDrizzle, closeDrizzle } from './src/main/data/drizzle/drizzleDb.ts';
        export { ServiceService } from './src/services/serviceService.ts';
        export { ServicesRepository, PartsRepository } from './src/main/data/drizzle/repositories/index.ts';
      `,
      resolveDir: root, loader: 'ts',
    },
    outfile, bundle: true, platform: 'node', format: 'esm', target: 'node18', packages: 'external', logLevel: 'error',
  });
  const app = await import(pathToFileURL(outfile).href);
  try {
    app.CreateDefaultDb(path.join(testDir, 'integration.sqlite'));
    app.initDrizzle();
    await app.runDatabaseMigrations();
    const db = app.getDb();
    assert.equal(db.pragma('foreign_keys', { simple: true }), 1);
    db.exec(`INSERT INTO Customers (customerId, firstName, lastName) VALUES (999, 'Test', 'User');
             INSERT INTO Cars (carId, customerId, plateNumber) VALUES (999, 999, '34 TEST 999');`);
    const service = new app.ServiceService(new app.ServicesRepository(), new app.PartsRepository());
    const serviceData = { carId: 999, customerId: 999, complaints: null, hasDamageOnReceive: false, totalCharge: 350, km: 120000 };
    const part = (name, id) => ({ ...(id === undefined ? {} : { partId: id }), carId: 999, serviceId: 0,
      partName: name, quantity: 2, unitPriceKurus: 1250 });
    const created = await service.createService(serviceData, [part('Filter'), part('Oil')]);
    assert.equal(created.success, true, created.message);
    const serviceId = created.data.service.serviceId;
    assert.equal(db.prepare('SELECT km FROM Cars WHERE carId=999').get().km, 120000, 'New service should update latest vehicle km');
    const firstId = created.data.parts[0].partId;
    const secondId = created.data.parts[1].partId;
    assert.equal(db.prepare('SELECT complaints FROM Services WHERE serviceId=?').get(serviceId).complaints, null);
    const updated = await service.updateService(serviceId, { ...serviceData, km: 135000, totalCharge: 520 },
      [part('Filter New', firstId), part('Battery')]);
    assert.equal(updated.success, true, updated.message);
    assert.equal(db.prepare('SELECT km FROM Cars WHERE carId=999').get().km, 135000, 'Service edit should advance vehicle km');
    const olderReading = await service.updateService(serviceId, { ...serviceData, km: 110000, totalCharge: 520 },
      [part('Filter New', firstId), part('Battery', undefined)]);
    assert.equal(olderReading.success, true, olderReading.message);
    assert.equal(db.prepare('SELECT km FROM Cars WHERE carId=999').get().km, 135000, 'Historical mileage must not decrease vehicle km');
    assert.equal(updated.data.parts[0].partId, firstId, 'Existing part ID must survive an edit');
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM Parts WHERE partId=?').get(secondId).n, 0);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM Parts WHERE serviceId=?').get(serviceId).n, 2);
    assert.equal(db.prepare('SELECT totalCharge FROM Services WHERE serviceId=?').get(serviceId).totalCharge, 520);
    const before = db.prepare('SELECT partId, partName, quantity, unitPriceKurus FROM Parts WHERE serviceId=? ORDER BY partId').all(serviceId);
    // A trigger simulates a late DB failure *after* the parent row and existing part have been changed.
    db.exec(`CREATE TRIGGER test_abort_part BEFORE INSERT ON Parts WHEN NEW.partName='FAIL_TEST'
      BEGIN SELECT RAISE(ABORT, 'simulated part insert failure'); END;`);
    const failed = await service.updateService(serviceId, { ...serviceData, km: 200000, totalCharge: 999 },
      [part('Modified Before Failure', firstId), part('FAIL_TEST')]);
    assert.equal(failed.success, false, 'Injected DB failure must be propagated');
    assert.equal(db.prepare('SELECT km FROM Cars WHERE carId=999').get().km, 135000, 'Failed edit must not change vehicle km');
    assert.equal(db.prepare('SELECT totalCharge FROM Services WHERE serviceId=?').get(serviceId).totalCharge, 520,
      'Service must roll back');
    assert.deepEqual(db.prepare('SELECT partId, partName, quantity, unitPriceKurus FROM Parts WHERE serviceId=? ORDER BY partId').all(serviceId), before,
      'All old parts must survive failed update');
    // A failing new service creation must not leave its parent Service row behind.
    const countBeforeFailedCreate = db.prepare('SELECT COUNT(*) AS n FROM Services').get().n;
    const createFailed = await service.createService({ ...serviceData, km: 250000 }, [part('Filter'), part('FAIL_TEST')]);
    assert.equal(createFailed.success, false);
    assert.equal(db.prepare('SELECT km FROM Cars WHERE carId=999').get().km, 135000, 'Failed new service must not change vehicle km');
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM Services').get().n, countBeforeFailedCreate,
      'Failed creation must not leave an orphan service');
    db.exec('DROP TRIGGER test_abort_part');
    const deleted = await service.deleteService(serviceId);
    assert.equal(deleted.success, true, deleted.message);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM Parts WHERE serviceId=?').get(serviceId).n, 0, 'Cascade must delete parts');
    console.log('Real SQLite service integration passed: create, null complaint, part IDs, edit, update/create rollback, cascade.');
  } finally {
    app.closeDrizzle();
    app.closeDb();
  }
} finally {
  fs.rmSync(testDir, { recursive: true, force: true });
}
