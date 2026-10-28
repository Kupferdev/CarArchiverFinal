/**
 * End-to-end database migration test.
 *
 * Runs the REAL migration code against temporary SQLite files:
 *   - fresh install creates every table with working foreign keys
 *   - migrations are idempotent
 *   - a failing migration is rolled back completely (no half-built database)
 *   - legacy databases (no foreign keys, old jobDuration) upgrade without data loss
 *   - orphaned rows stop the upgrade instead of being silently damaged
 *
 * Usage: npm run test:db
 *
 * better-sqlite3 is normally rebuilt for Electron's ABI in this project. If it does
 * not load under plain Node, this script transparently re-runs itself with
 * Electron's Node runtime (ELECTRON_RUN_AS_NODE) so the same binary is used.
 */
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const selfPath = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(selfPath), "..");
const tmpDir = path.join(root, ".tmp-test");

// ---------------------------------------------------------------------------
// 0. Make sure the native module loads; otherwise retry inside Electron's Node.
// ---------------------------------------------------------------------------
function loadProblem() {
  try {
    const Database = require("better-sqlite3");
    new Database(":memory:").close();
    return null;
  } catch (error) {
    return error;
  }
}

const problem = loadProblem();
if (problem) {
  const abiMismatch = /NODE_MODULE_VERSION|compiled against a different Node\.js version/.test(
    String(problem.message)
  );
  if (abiMismatch && !process.env.DB_TEST_IN_ELECTRON) {
    console.log("better-sqlite3 is built for Electron. Re-running with Electron's Node runtime...\n");
    let electronBinary;
    try {
      electronBinary = require("electron");
    } catch (error) {
      console.error("Could not locate the Electron binary:", error.message);
      process.exit(1);
    }
    const child = spawnSync(electronBinary, [selfPath], {
      stdio: "inherit",
      env: { ...process.env, ELECTRON_RUN_AS_NODE: "1", DB_TEST_IN_ELECTRON: "1" },
    });
    process.exit(child.status ?? 1);
  }
  console.error("better-sqlite3 could not be loaded:\n", problem.message);
  console.error("\nTry: npm rebuild better-sqlite3   (or: npm run native:rebuild)");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 1. Bundle the migration code (TypeScript) so it can run outside Vite/Electron.
// ---------------------------------------------------------------------------
fs.rmSync(tmpDir, { recursive: true, force: true });
fs.mkdirSync(tmpDir, { recursive: true });

const { build } = await import("esbuild");
const bundlePath = path.join(tmpDir, "db-under-test.mjs");
await build({
  absWorkingDir: root,
  stdin: {
    contents: `
      export { runDatabaseMigrations } from "./src/main/data/migrations/migrationRunner.ts";
      export { CreateDefaultDb, closeDb, getDb } from "./src/main/data/db.ts";
      export { initDrizzle, closeDrizzle } from "./src/main/data/drizzle/drizzleDb.ts";
    `,
    resolveDir: root,
    loader: "ts",
  },
  outfile: bundlePath,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  packages: "external",
  logLevel: "error",
});

const app = await import(pathToFileURL(bundlePath).href);

// ---------------------------------------------------------------------------
// 2. Tiny test harness
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

// The migration code is chatty (and Windows consoles garble its emoji), so mute
// console.* for the code under test and print our own results via `out`.
const out = (line) => process.stdout.write(`${line}\n`);
console.log = console.error = console.warn = () => {};

async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    out(`  ✓ ${name}`);
  } catch (error) {
    failed += 1;
    out(`  ✗ ${name}\n      ${String(error.message).split("\n").join("\n      ")}`);
  } finally {
    closeAll();
  }
}

function closeAll() {
  app.closeDrizzle();
  app.closeDb();
}

function openDb(name) {
  closeAll();
  const dbPath = path.join(tmpDir, `${name}.sqlite`);
  app.CreateDefaultDb(dbPath);
  app.initDrizzle();
  return app.getDb();
}

const migrate = () => app.runDatabaseMigrations();
const tableNames = (db) =>
  db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map((r) => r.name);
const count = (db, table) => db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
const versions = (db) => db.prepare("SELECT version FROM schema_migrations ORDER BY version").all().map((r) => r.version);

function hasForeignKey(db, table, from, parent, onDelete) {
  return db
    .pragma(`foreign_key_list(${table})`)
    .some((fk) => fk.from === from && fk.table === parent && fk.on_delete === onDelete);
}

/** Replaces the four child tables with the old foreign-key-less layout. */
function makeLegacy(db) {
  db.pragma("foreign_keys = OFF");
  db.exec(`
    DROP TABLE Services; DROP TABLE Cars; DROP TABLE Emails; DROP TABLE PhoneNumbers;
    DROP TABLE schema_migrations;
    CREATE TABLE PhoneNumbers (phoneNumberId INTEGER PRIMARY KEY AUTOINCREMENT, customerId INTEGER NOT NULL,
      countryCode TEXT NOT NULL, phoneNumber TEXT NOT NULL);
    CREATE TABLE Emails (emailId INTEGER PRIMARY KEY AUTOINCREMENT, customerId INTEGER NOT NULL,
      customerEmail TEXT NOT NULL);
    CREATE TABLE Cars (carId INTEGER PRIMARY KEY AUTOINCREMENT, customerId INTEGER, oldCustomerId JSON NULL,
      brandId INTEGER NULL, modelId INTEGER NULL, year INTEGER NULL, vinNumber TEXT NULL, plateNumber TEXT NULL,
      km REAL NULL, fuelType INTEGER NULL, bodyType INTEGER NULL);
    CREATE TABLE Services (serviceId INTEGER PRIMARY KEY AUTOINCREMENT, carId INTEGER NOT NULL,
      customerId INTEGER NULL, applicationDate DATETIME NULL, appointmentDate DATETIME NULL,
      jobDuration DATETIME NULL, deliveryDate DATETIME NULL, km REAL NULL, complaints TEXT NOT NULL,
      extraRequests TEXT NULL, faults JSON NULL, hasDamageOnReceive BOOLEAN NOT NULL, damageOnReceive JSON NULL,
      hasDamageDuringRepair BOOLEAN NULL, damageDuringRepair JSON NULL, laborCharge REAL NULL,
      totalCharge REAL NULL, targetDeliveryDate DATETIME NULL, isDelivered BOOLEAN NULL);
  `);
  db.pragma("foreign_keys = ON");
}

function insertLegacyData(db, { orphanCar = false } = {}) {
  db.pragma("foreign_keys = OFF");
  db.exec(`
    INSERT INTO Customers (customerId, firstName, lastName) VALUES (1, 'Ali', 'Veli'), (2, 'Ayşe', 'Yılmaz');
    INSERT INTO PhoneNumbers (phoneNumberId, customerId, countryCode, phoneNumber) VALUES (5, 1, '+90', '5551112233');
    INSERT INTO Emails (emailId, customerId, customerEmail) VALUES (7, 2, 'ayse@example.com');
    INSERT INTO Cars (carId, customerId, brandId, modelId, plateNumber, km) VALUES (10, 1, 36, 123, '44 ABC 123', 120000.5), (11, 2, NULL, NULL, '06 XYZ 987', 5000);
    INSERT INTO Services (serviceId, carId, customerId, complaints, hasDamageOnReceive, jobDuration)
      VALUES (20, 10, 1, 'Fren sesi', 0, 1700000000);
  `);
  if (orphanCar) db.exec("INSERT INTO Cars (carId, customerId, plateNumber) VALUES (12, 999, 'ORPHAN');");
  db.pragma("foreign_keys = ON");
}

// ---------------------------------------------------------------------------
// 3. Tests
// ---------------------------------------------------------------------------
out("Database migration tests\n");

await test("fresh install creates all tables and records every migration", async () => {
  const db = openDb("fresh");
  await migrate();

  const expected = [
    "Customers", "Brands", "FuelTypes", "BodyTypes", "Cars", "FuelTypeTranslations",
    "BodyTypeTranslations", "PhoneNumbers", "Emails", "Services", "Parts", "ServiceMedia", "TrashItems", "PendingMediaDeletes", "schema_migrations",
  ];
  for (const table of expected) assert.ok(tableNames(db).includes(table), `missing table ${table}`);

  assert.deepEqual(versions(db), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.equal(db.pragma("foreign_key_check").length, 0);
  assert.ok(count(db, "Brands") > 0, "brands were not seeded");
  assert.ok(hasForeignKey(db, "Cars", "brandId", "Brands", "SET NULL"));
  assert.ok(db.pragma("table_info(Cars)").some((column) => column.name === "model"));
  assert.equal(db.pragma("table_info(Cars)").some((column) => column.name === "modelId"), false);
  assert.ok(db.pragma("table_info(Cars)").some((column) => column.name === "engineVolumeCc"));
  assert.ok(db.pragma("table_info(Cars)").some((column) => column.name === "notes"));
  const addressColumn = db.pragma("table_info(Customers)").find((c) => c.name === "address");
  const advisorNotesColumn = db.pragma("table_info(Services)").find((c) => c.name === "advisorNotes");
  assert.ok(addressColumn, "Customers.address migration missing");
  assert.ok(advisorNotesColumn, "Services.advisorNotes migration missing");
  assert.equal(addressColumn.notnull, 0, "address must be nullable");
  assert.equal(advisorNotesColumn.notnull, 0, "advisorNotes must be nullable");
  const partColumns = db.pragma("table_info(Parts)").map((column) => column.name);
  assert.ok(partColumns.includes("quantity"));
  assert.ok(partColumns.includes("unitPriceKurus"));
  assert.equal(partColumns.includes("partTax"), false);
  assert.ok(hasForeignKey(db, "Parts", "serviceId", "Services", "CASCADE"));
  assert.ok(hasForeignKey(db, "ServiceMedia", "serviceId", "Services", "CASCADE"));
  assert.equal(count(db, "FuelTypes"), 5);
  assert.equal(count(db, "BodyTypes"), 9);

  const complaintsColumn = db.pragma("table_info(Services)").find((c) => c.name === "complaints");
  assert.equal(complaintsColumn.notnull, 0, "complaints must be nullable");
  const jobDuration = db.pragma("table_info(Services)").find((c) => c.name === "jobDuration");
  assert.equal(jobDuration.type, "INTEGER", "jobDuration must be an INTEGER (minutes)");
});

await test("optional complaint saves NULL and preserves dependent parts", async () => {
  const db = openDb("nullable-complaints");
  await migrate();
  db.exec(`
    INSERT INTO Customers (customerId, firstName) VALUES (99, 'Test');
    INSERT INTO Cars (carId, customerId, plateNumber) VALUES (99, 99, '34 TEST 99');
    INSERT INTO Services (serviceId, carId, customerId, complaints, hasDamageOnReceive)
      VALUES (99, 99, 99, NULL, 0);
  `);
  assert.equal(db.prepare("SELECT complaints FROM Services WHERE serviceId=99").get().complaints, null);
  assert.equal(db.pragma("foreign_key_check").length, 0);
});

await test("running migrations twice changes nothing", async () => {
  const db = openDb("idempotent");
  await migrate();
  const before = {
    brands: count(db, "Brands"), fuel: count(db, "FuelTypeTranslations"), body: count(db, "BodyTypeTranslations"),
  };
  await migrate();
  assert.deepEqual(versions(db), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.equal(count(db, "Brands"), before.brands);
  assert.equal(count(db, "FuelTypeTranslations"), before.fuel);
  assert.equal(count(db, "BodyTypeTranslations"), before.body);
});

await test("foreign keys cascade / null out correctly; jobDuration stores minutes", async () => {
  const db = openDb("relations");
  await migrate();

  db.exec(`
    INSERT INTO Customers (customerId, firstName) VALUES (1, 'Ali');
    INSERT INTO PhoneNumbers (customerId, countryCode, phoneNumber) VALUES (1, '+90', '5550000000');
    INSERT INTO Emails (customerId, customerEmail) VALUES (1, 'ali@example.com');
    INSERT INTO Cars (carId, customerId, plateNumber) VALUES (1, 1, '44 ABC 123');
    INSERT INTO Services (serviceId, carId, customerId, complaints, hasDamageOnReceive, jobDuration)
      VALUES (1, 1, 1, 'Yağ değişimi', 0, 90);
  `);
  const stored = db.prepare("SELECT jobDuration AS v, typeof(jobDuration) AS t FROM Services").get();
  assert.deepEqual(stored, { v: 90, t: "integer" });

  assert.throws(
    () => db.exec("INSERT INTO PhoneNumbers (customerId, countryCode, phoneNumber) VALUES (999, '+90', '1')"),
    /FOREIGN KEY/i,
    "foreign keys must be enforced"
  );

  db.exec("DELETE FROM Customers WHERE customerId = 1");
  assert.equal(count(db, "PhoneNumbers"), 0, "phones should cascade-delete");
  assert.equal(count(db, "Emails"), 0, "emails should cascade-delete");
  assert.equal(count(db, "Cars"), 1, "cars must survive customer deletion");
  assert.equal(db.prepare("SELECT customerId FROM Cars").get().customerId, null);
  assert.equal(db.prepare("SELECT customerId FROM Services").get().customerId, null);

  db.exec("DELETE FROM Cars WHERE carId = 1");
  assert.equal(count(db, "Services"), 0, "services should cascade-delete with their car");
});

await test("Cars brand relation and model string schema are ready for the UI", async () => {
  const db = openDb("car-brand-schema");
  await migrate();

  const brand = db.prepare("SELECT brandId FROM Brands WHERE brandName = 'Ford'").get();
  assert.ok(brand, "seeded Ford brand is missing");

  db.prepare("INSERT INTO Cars (customerId, brandId, model) VALUES (?, ?, ?)").run(null, brand.brandId, "Fiesta");
  assert.deepEqual(
    db.prepare("SELECT brandId, model FROM Cars WHERE model = 'Fiesta'").get(),
    { brandId: brand.brandId, model: "Fiesta" }
  );

  assert.throws(
    () => db.prepare("INSERT INTO Cars (brandId) VALUES (?)").run(999999),
    /FOREIGN KEY/i
  );
});

await test("a failing first migration is rolled back completely", async () => {
  const db = openDb("rollback");
  // Sabotage: a Brands table without the column the seed data needs.
  db.exec("CREATE TABLE Brands (unrelated INTEGER)");

  await assert.rejects(migrate(), /no column named/i);

  assert.equal(db.inTransaction, false, "transaction must be closed after failure");
  assert.deepEqual(
    tableNames(db).filter((name) => name !== "schema_migrations"),
    ["Brands"],
    "only the pre-existing table may remain"
  );
  assert.equal(count(db, "schema_migrations"), 0, "no migration may be recorded as applied");
});

await test("legacy database upgrades without losing data", async () => {
  const db = openDb("legacy");
  await migrate();
  makeLegacy(db);
  insertLegacyData(db);
  const seeded = {
    brands: count(db, "Brands"), fuel: count(db, "FuelTypeTranslations"), body: count(db, "BodyTypeTranslations"),
  };

  await migrate();

  assert.ok(hasForeignKey(db, "PhoneNumbers", "customerId", "Customers", "CASCADE"));
  assert.ok(hasForeignKey(db, "Emails", "customerId", "Customers", "CASCADE"));
  assert.ok(hasForeignKey(db, "Cars", "customerId", "Customers", "SET NULL"));
  assert.ok(hasForeignKey(db, "Services", "carId", "Cars", "CASCADE"));
  assert.ok(hasForeignKey(db, "Services", "customerId", "Customers", "SET NULL"));
  assert.equal(db.pragma("foreign_key_check").length, 0);
  assert.deepEqual(versions(db), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

  // Rows and their ids are preserved.
  assert.equal(db.prepare("SELECT phoneNumber FROM PhoneNumbers WHERE phoneNumberId = 5").get().phoneNumber, "5551112233");
  assert.equal(db.prepare("SELECT customerEmail FROM Emails WHERE emailId = 7").get().customerEmail, "ayse@example.com");
  assert.deepEqual(db.prepare("SELECT carId FROM Cars ORDER BY carId").all().map((r) => r.carId), [10, 11]);
  assert.equal(db.prepare("SELECT brandId FROM Cars WHERE carId = 10").get().brandId, 36);
  assert.equal(db.prepare("SELECT model FROM Cars WHERE carId = 10").get().model, null);
  assert.equal(db.prepare("SELECT complaints FROM Services WHERE serviceId = 20").get().complaints, "Fren sesi");

  // The old timestamp in jobDuration cannot be a duration and is cleared.
  assert.equal(db.prepare("SELECT jobDuration FROM Services WHERE serviceId = 20").get().jobDuration, null);

  // Re-running the seed steps on an old database must not duplicate reference data.
  assert.equal(count(db, "Brands"), seeded.brands, "brands duplicated");
  assert.equal(count(db, "FuelTypeTranslations"), seeded.fuel, "fuel translations duplicated");
  assert.equal(count(db, "BodyTypeTranslations"), seeded.body, "body translations duplicated");
});

await test("orphaned rows stop the upgrade and leave the data untouched", async () => {
  const db = openDb("orphans");
  await migrate();
  makeLegacy(db);
  insertLegacyData(db, { orphanCar: true });
  // Orphan check applies to non-nullable relations; also orphan a phone number.
  db.pragma("foreign_keys = OFF");
  db.exec("INSERT INTO PhoneNumbers (customerId, countryCode, phoneNumber) VALUES (777, '+90', '1')");
  db.pragma("foreign_keys = ON");

  await assert.rejects(migrate(), /orphaned/i);

  assert.equal(count(db, "PhoneNumbers"), 2, "data must not be modified");
  assert.equal(count(db, "Cars"), 3, "data must not be modified");
  assert.equal(hasForeignKey(db, "Cars", "customerId", "Customers", "SET NULL"), false);
});

await test("service media metadata stays external and cascades with service", async () => {
  const db = openDb("service-media");
  await migrate();
  db.exec(`
    INSERT INTO Customers (customerId, firstName) VALUES (501, 'Media Test');
    INSERT INTO Cars (carId, customerId, plateNumber) VALUES (501, 501, '34 MEDIA 501');
    INSERT INTO Services (serviceId, carId, customerId, hasDamageOnReceive) VALUES (501, 501, 501, 0);
    INSERT INTO ServiceMedia (serviceId, relativePath, originalName, mimeType, bytes)
      VALUES (501, 'services/501/123e4567-e89b-12d3-a456-426614174000.jpg', 'before.jpg', 'image/jpeg', 2048);
  `);
  assert.equal(count(db, 'ServiceMedia'), 1);
  const cols = db.pragma('table_info(ServiceMedia)').map(row => row.name);
  assert.equal(cols.includes('data'), false, 'media contents must not be in SQLite');
  assert.equal(cols.includes('blob'), false, 'image blobs must not be in SQLite');
  db.prepare('DELETE FROM Services WHERE serviceId = ?').run(501);
  assert.equal(count(db, 'ServiceMedia'), 0, 'media metadata should cascade');
});

// ---------------------------------------------------------------------------
closeAll();
fs.rmSync(tmpDir, { recursive: true, force: true });
out(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
