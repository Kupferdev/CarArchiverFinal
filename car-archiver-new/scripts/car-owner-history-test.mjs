/**
 * Regression test for the "previous owner not added to Car history on
 * customer change" bug.
 *
 * Runs the REAL repository code (CarsRepository.updateWithOldCustomer) against
 * a temporary SQLite database, exactly the way the UI calls it from the
 * `update-car` IPC handler.
 *
 * Usage: npm run test:car-owner
 *
 * See scripts/db-migration-test.mjs for notes on the Electron/Node ABI fallback
 * and the esbuild bundling approach used here.
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
const tmpDir = path.join(root, ".tmp-test-car-owner");

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
  console.error("\nTry: npm rebuild better-sqlite3   (or: npx electron-rebuild -f -w better-sqlite3)");
  process.exit(1);
}

fs.rmSync(tmpDir, { recursive: true, force: true });
fs.mkdirSync(tmpDir, { recursive: true });

const { build } = await import("esbuild");
const bundlePath = path.join(tmpDir, "car-owner-under-test.mjs");
await build({
  absWorkingDir: root,
  stdin: {
    contents: `
      export { runDatabaseMigrations } from "./src/main/data/migrations/migrationRunner.ts";
      export { CreateDefaultDb, closeDb, getDb } from "./src/main/data/db.ts";
      export { initDrizzle, closeDrizzle, useDb } from "./src/main/data/drizzle/drizzleDb.ts";
      export { CarsRepository } from "./src/main/data/drizzle/repositories/carsRepository.ts";
      export { Customers } from "./src/main/data/drizzle/schemas/customerSchemas/customersSchema.ts";
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

let passed = 0;
let failed = 0;
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
    app.closeDrizzle();
    app.closeDb();
  }
}

function openDb(name) {
  app.closeDrizzle();
  app.closeDb();
  const dbPath = path.join(tmpDir, `${name}.sqlite`);
  app.CreateDefaultDb(dbPath);
  app.initDrizzle();
  return app.getDb();
}

function addCustomer(db, firstName) {
  return db.prepare("INSERT INTO Customers (firstName) VALUES (?)").run(firstName).lastInsertRowid;
}

function addCar(db, customerId, plate) {
  return db
    .prepare("INSERT INTO Cars (customerId, plateNumber, oldCustomerId) VALUES (?, ?, '[]')")
    .run(customerId, plate).lastInsertRowid;
}

out("Car previous-owner regression tests\n");

await test("changing the owner records the previous owner in history (the reported bug)", async () => {
  const db = openDb("basic");
  await app.runDatabaseMigrations();
  const alice = addCustomer(db, "Alice");
  const bob = addCustomer(db, "Bob");
  const carId = addCar(db, alice, "34 ABC 1");

  // This mirrors exactly what CarForm.tsx sends on submit: the new data plus
  // the owner being replaced (`originalCustomerId`) as oldCustomerIdToAdd.
  const repo = new app.CarsRepository();
  const result = await repo.updateWithOldCustomer(carId, { customerId: bob }, alice);

  assert.equal(result.success, true, result.message);
  assert.equal(result.data.customerId, bob, "car must now belong to the new owner");
  assert.deepEqual(result.data.oldCustomerId, [String(alice)], "previous owner must be recorded in history");

  const row = db.prepare("SELECT customerId, oldCustomerId FROM Cars WHERE carId = ?").get(carId);
  assert.equal(row.customerId, bob);
  assert.deepEqual(JSON.parse(row.oldCustomerId), [String(alice)], "history must be persisted to disk, not just returned");
});

await test("history accumulates correctly across two separate edits", async () => {
  const db = openDb("duplicate");
  await app.runDatabaseMigrations();
  const alice = addCustomer(db, "Alice");
  const bob = addCustomer(db, "Bob");
  const carol = addCustomer(db, "Carol");
  const carId = addCar(db, alice, "34 ABC 2");

  const repo = new app.CarsRepository();
  // First edit session: car is loaded with owner = alice, user changes it to bob.
  await repo.updateWithOldCustomer(carId, { customerId: bob }, alice);
  // Second, separate edit session: car is now loaded with owner = bob (the
  // outcome of the first edit), user changes it to carol. CarForm.tsx always
  // passes the *currently loaded* owner, never a stale one.
  const second = await repo.updateWithOldCustomer(carId, { customerId: carol }, bob);

  assert.deepEqual(
    [...second.data.oldCustomerId].sort(),
    [String(alice), String(bob)].sort(),
    "both previous owners must be present, each only once"
  );
});

await test("re-adding the same previous owner within one update is not duplicated", async () => {
  const db = openDb("same-call-duplicate");
  await app.runDatabaseMigrations();
  const alice = addCustomer(db, "Alice");
  const bob = addCustomer(db, "Bob");
  const carId = addCar(db, alice, "34 ABC 2b");

  const repo = new app.CarsRepository();
  await repo.updateWithOldCustomer(carId, { customerId: bob }, alice);
  // Something (e.g. a retry, or the "+" picker) tries to add alice again.
  const second = await repo.updateWithOldCustomer(carId, {}, alice);

  assert.deepEqual(second.data.oldCustomerId, [String(alice)], "alice must appear only once");
});

await test("a customer is never added to their own history (nextCustomerId guard)", async () => {
  const db = openDb("self-guard");
  await app.runDatabaseMigrations();
  const alice = addCustomer(db, "Alice");
  const carId = addCar(db, alice, "34 ABC 3");

  const repo = new app.CarsRepository();
  // Same id passed as both the new owner and the "previous" owner to add.
  const result = await repo.updateWithOldCustomer(carId, { customerId: alice }, alice);

  assert.deepEqual(result.data.oldCustomerId, [], "a current owner must never also appear in their own history");
});

await test("declining the history checkbox (oldCustomerIdToAdd = null) adds nobody", async () => {
  const db = openDb("declined");
  await app.runDatabaseMigrations();
  const alice = addCustomer(db, "Alice");
  const bob = addCustomer(db, "Bob");
  const carId = addCar(db, alice, "34 ABC 4");

  const repo = new app.CarsRepository();
  const result = await repo.updateWithOldCustomer(carId, { customerId: bob }, null);

  assert.equal(result.data.customerId, bob);
  assert.deepEqual(result.data.oldCustomerId, [], "history must stay empty when the user declined to record it");
});

app.closeDrizzle();
app.closeDb();
fs.rmSync(tmpDir, { recursive: true, force: true });
out(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
