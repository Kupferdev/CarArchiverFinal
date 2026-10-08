import { getDb } from "../db";
import {
  createBodyTypesTable,
} from "./bodyType/createBodyTypeDb";
import { createBrandsTable } from "./brand/createBrandDb";
import { createCarsTable } from "./car/createCarDb";
import { createCustomersTable } from "./customer/createCustomerDb";
import { createCustomerEmailsTable } from "./customer/createCustomerEmailDb";
import { createCustomerPhoneNumbersTable } from "./customer/createCustomerPhoneNumberDb";
import { createFuelTypesTable } from "./fuelType/createFuelTypeDb";
import { createPartsTable } from "./part/createPartDb";
import { createServicesTable } from "./service/createServiceDb";
import { createFuelTypesTranslationsTable } from "../translations/fuelTypeTranslationsDb";
import { createBodyTypesTranslationsTable } from "../translations/bodyTypeTranslationsDb";

const CURRENT_SCHEMA_VERSION = 6;

// Migrations that are safe to run inside one SQLite transaction together with
// their schema_migrations record: either everything is applied or nothing is.
// Migrations 2/3/5 are excluded on purpose: they toggle `PRAGMA foreign_keys`
// and manage their own transaction. SQLite silently ignores a `PRAGMA
// foreign_keys` change while a transaction is already open, so nesting these
// inside an outer BEGIN would leave foreign keys ON during the rebuild and
// cascade-delete unrelated rows (this actually happened to Services here:
// Cars got dropped/rebuilt with foreign_keys still enforced, silently
// deleting every row that referenced it). Keep new migrations out of this
// set unless you have verified they do not touch `PRAGMA foreign_keys`.
const ATOMIC_MIGRATIONS = new Set([1, 4, 6]);

function tableHasForeignKey(tableName: string, fromColumn: string, targetTable: string, onDelete: string): boolean {
  const db = getDb();
  const rows = db.pragma(`foreign_key_list(${tableName})`) as Array<{
    from: string;
    table: string;
    on_delete: string;
  }>;

  return rows.some(
    (row) =>
      row.from === fromColumn &&
      row.table === targetTable &&
      row.on_delete.toUpperCase() === onDelete.toUpperCase()
  );
}

function assertNoOrphans(): void {
  const db = getDb();
  const checks = [
    ["PhoneNumbers", "customerId", "Customers", false],
    ["Emails", "customerId", "Customers", false],
    ["Cars", "customerId", "Customers", true],
    ["Services", "customerId", "Customers", true],
    ["Services", "carId", "Cars", false],
  ] as const;

  for (const [child, column, parent, nullable] of checks) {
    const condition = nullable
      ? `c.${column} IS NOT NULL AND c.${column} NOT IN (SELECT p.${parent === "Customers" ? "customerId" : "carId"} FROM ${parent} p)`
      : `c.${column} NOT IN (SELECT p.${parent === "Customers" ? "customerId" : "carId"} FROM ${parent} p)`;

    const row = db.prepare(`SELECT COUNT(*) AS count FROM ${child} c WHERE ${condition}`).get() as { count: number };
    if (row.count > 0) {
      throw new Error(
        `Database migration stopped: ${row.count} orphaned ${child}.${column} record(s) reference missing ${parent} records.`
      );
    }
  }
}

function migrateCustomerRelationships(): void {
  const db = getDb();

  const requirements = [
    ["PhoneNumbers", "customerId", "Customers", "CASCADE"],
    ["Emails", "customerId", "Customers", "CASCADE"],
    ["Cars", "customerId", "Customers", "SET NULL"],
    ["Services", "carId", "Cars", "CASCADE"],
    ["Services", "customerId", "Customers", "SET NULL"],
  ] as const;

  const needsMigration = requirements.some(
    ([table, column, parent, action]) => !tableHasForeignKey(table, column, parent, action)
  );

  if (!needsMigration) return;

  assertNoOrphans();

  // SQLite cannot add a foreign key with ALTER TABLE. Rebuild only the
  // affected child tables while preserving all existing row IDs/data.
  db.pragma("foreign_keys = OFF");

  const carColumns = db.pragma("table_info(Cars)") as Array<{ name: string }>;
  const legacyCarsUseModelId = carColumns.some((column) => column.name === "modelId");
  const carsHaveEngineVolume = carColumns.some((column) => column.name === "engineVolumeCc");
  const carsHaveNotes = carColumns.some((column) => column.name === "notes");

  try {
    db.transaction(() => {
      db.exec(`
        CREATE TABLE PhoneNumbers_new (
          phoneNumberId INTEGER PRIMARY KEY AUTOINCREMENT,
          customerId INTEGER NOT NULL,
          countryCode TEXT NOT NULL,
          phoneNumber TEXT NOT NULL,
          FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE CASCADE
        );
        INSERT INTO PhoneNumbers_new SELECT phoneNumberId, customerId, countryCode, phoneNumber FROM PhoneNumbers;
        DROP TABLE PhoneNumbers;
        ALTER TABLE PhoneNumbers_new RENAME TO PhoneNumbers;

        CREATE TABLE Emails_new (
          emailId INTEGER PRIMARY KEY AUTOINCREMENT,
          customerId INTEGER NOT NULL,
          customerEmail TEXT NOT NULL,
          FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE CASCADE
        );
        INSERT INTO Emails_new SELECT emailId, customerId, customerEmail FROM Emails;
        DROP TABLE Emails;
        ALTER TABLE Emails_new RENAME TO Emails;

        CREATE TABLE Cars_new (
          carId INTEGER PRIMARY KEY AUTOINCREMENT,
          customerId INTEGER,
          oldCustomerId JSON NULL,
          brandId INTEGER NULL,
          model TEXT NULL,
          year INTEGER NULL,
          vinNumber TEXT NULL,
          plateNumber TEXT NULL,
          km REAL NULL,
          fuelType INTEGER NULL,
          bodyType INTEGER NULL,
          engineVolumeCc INTEGER NULL,
          notes TEXT NULL,
          FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE SET NULL
        );

        INSERT INTO Cars_new (
          carId, customerId, oldCustomerId, brandId, model, year,
          vinNumber, plateNumber, km, fuelType, bodyType, engineVolumeCc, notes
        )
        SELECT
          carId, customerId, oldCustomerId, brandId, ${legacyCarsUseModelId ? "NULL" : "model"}, year,
          vinNumber, plateNumber, km, fuelType, bodyType,
          ${carsHaveEngineVolume ? "engineVolumeCc" : "NULL"}, ${carsHaveNotes ? "notes" : "NULL"}
        FROM Cars;

        DROP TABLE Cars;
        ALTER TABLE Cars_new RENAME TO Cars;

        CREATE TABLE Services_new (
          serviceId INTEGER PRIMARY KEY AUTOINCREMENT,
          carId INTEGER NOT NULL,
          customerId INTEGER NULL,
          applicationDate DATETIME NULL,
          appointmentDate DATETIME NULL,
          jobDuration INTEGER NULL,
          deliveryDate DATETIME NULL,
          km REAL NULL,
          complaints TEXT NOT NULL,
          extraRequests TEXT NULL,
          faults JSON NULL,
          hasDamageOnReceive BOOLEAN NOT NULL,
          damageOnReceive JSON NULL,
          hasDamageDuringRepair BOOLEAN NULL,
          damageDuringRepair JSON NULL,
          laborCharge REAL NULL,
          totalCharge REAL NULL,
          targetDeliveryDate DATETIME NULL,
          isDelivered BOOLEAN NULL,
          FOREIGN KEY (carId) REFERENCES Cars(carId) ON DELETE CASCADE,
          FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE SET NULL
        );
        INSERT INTO Services_new SELECT serviceId, carId, customerId, applicationDate, appointmentDate, jobDuration, deliveryDate, km, complaints, extraRequests, faults, hasDamageOnReceive, damageOnReceive, hasDamageDuringRepair, damageDuringRepair, laborCharge, totalCharge, targetDeliveryDate, isDelivered FROM Services;
        DROP TABLE Services;
        ALTER TABLE Services_new RENAME TO Services;
      `);
    })();
  } finally {
    db.pragma("foreign_keys = ON");
  }

  const violations = db.pragma("foreign_key_check") as unknown[];
  if (violations.length > 0) {
    throw new Error(`Database migration failed: ${violations.length} foreign key violation(s) remain.`);
  }
}

function migrateCarBrandAndModel(): void {
  const db = getDb();

  const columns = db.pragma("table_info(Cars)") as Array<{ name: string }>;
  const hasModelColumn = columns.some((column) => column.name === "model");
  const hasModelIdColumn = columns.some((column) => column.name === "modelId");
  const hasBrandIdColumn = columns.some((column) => column.name === "brandId");

  if (!hasBrandIdColumn) {
    throw new Error("Database migration stopped: Cars.brandId column is missing.");
  }

  const hasBrandForeignKey = tableHasForeignKey(
    "Cars",
    "brandId",
    "Brands",
    "SET NULL"
  );

  if (hasModelColumn && !hasModelIdColumn && hasBrandForeignKey) {
    return;
  }

  const orphanBrands = db
    .prepare(`
      SELECT COUNT(*) AS count
      FROM Cars
      WHERE brandId IS NOT NULL
        AND brandId NOT IN (SELECT brandId FROM Brands)
    `)
    .get() as { count: number };

  if (orphanBrands.count > 0) {
    throw new Error(
      `Database migration stopped: ${orphanBrands.count} car(s) reference missing Brands records.`
    );
  }

  // modelId has never been backed by a Models table in this project, so there
  // is no model name to migrate. The old numeric column is intentionally removed.
  db.pragma("foreign_keys = OFF");

  const carColumns = db.pragma("table_info(Cars)") as Array<{ name: string }>;
  const carsHaveEngineVolume = carColumns.some((column) => column.name === "engineVolumeCc");
  const carsHaveNotes = carColumns.some((column) => column.name === "notes");

  try {
    db.transaction(() => {
      db.exec(`
        CREATE TABLE Cars_new (
          carId INTEGER PRIMARY KEY AUTOINCREMENT,
          customerId INTEGER,
          oldCustomerId JSON NULL,
          brandId INTEGER NULL,
          model TEXT NULL,
          year INTEGER NULL,
          vinNumber TEXT NULL,
          plateNumber TEXT NULL,
          km REAL NULL,
          fuelType INTEGER NULL,
          bodyType INTEGER NULL,
          engineVolumeCc INTEGER NULL,
          notes TEXT NULL,
          FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE SET NULL,
          FOREIGN KEY (brandId) REFERENCES Brands(brandId) ON DELETE SET NULL
        );

        INSERT INTO Cars_new (
          carId, customerId, oldCustomerId, brandId, model, year,
          vinNumber, plateNumber, km, fuelType, bodyType, engineVolumeCc, notes
        )
        SELECT
          carId, customerId, oldCustomerId, brandId, NULL, year,
          vinNumber, plateNumber, km, fuelType, bodyType,
          ${carsHaveEngineVolume ? "engineVolumeCc" : "NULL"}, ${carsHaveNotes ? "notes" : "NULL"}
        FROM Cars;

        DROP TABLE Cars;
        ALTER TABLE Cars_new RENAME TO Cars;
      `);
    })();
  } finally {
    db.pragma("foreign_keys = ON");
  }

  const violations = db.pragma("foreign_key_check") as unknown[];
  if (violations.length > 0) {
    throw new Error(
      `Car brand/model migration failed: ${violations.length} foreign key violation(s) remain.`
    );
  }
}

async function runMigration(version: number): Promise<void> {
  switch (version) {
    case 1:
      await createCustomersTable();
      await createBrandsTable();
      await createFuelTypesTable();
      await createBodyTypesTable();
      await createCarsTable();
      await createFuelTypesTranslationsTable();
      await createBodyTypesTranslationsTable();
      await createCustomerPhoneNumbersTable();
      await createCustomerEmailsTable();
      await createServicesTable();
      await createPartsTable();
      break;
    case 2:
      migrateCustomerRelationships();
      break;
    case 3:
      // Schema normalization checkpoint. SQLite identifiers are case-insensitive,
      // but we keep the canonical Drizzle spelling for future migrations.
      migrateCustomerRelationships();
      break;
    case 4:
      // jobDuration used to be a timestamp column. It is a length of time and
      // is now stored as whole minutes. Old values were epoch timestamps written
      // by no UI, so they cannot be converted to minutes and are cleared.
      // (Legacy databases keep the old declared column type; SQLite stores the
      // integers identically, so this has no functional effect.)
      getDb().exec("UPDATE Services SET jobDuration = NULL WHERE jobDuration IS NOT NULL");
      break;
    case 5:
      migrateCarBrandAndModel();
      break;
    case 6:
      // Vehicle-specific details used by the car form/profile.
      {
        const db = getDb();
        const columns = db.pragma("table_info(Cars)") as Array<{ name: string }>;
        if (!columns.some((column) => column.name === "engineVolumeCc")) {
          db.exec("ALTER TABLE Cars ADD COLUMN engineVolumeCc INTEGER NULL");
        }
        if (!columns.some((column) => column.name === "notes")) {
          db.exec("ALTER TABLE Cars ADD COLUMN notes TEXT NULL");
        }
      }
      break;
    default:
      throw new Error(`Unknown database migration: ${version}`);
  }
}

export async function runDatabaseMigrations(): Promise<void> {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      appliedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const appliedRows = db
    .prepare("SELECT version FROM schema_migrations ORDER BY version")
    .all() as Array<{ version: number }>;
  const applied = new Set(appliedRows.map((row) => row.version));

  for (let version = 1; version <= CURRENT_SCHEMA_VERSION; version += 1) {
    if (applied.has(version)) continue;

    if (ATOMIC_MIGRATIONS.has(version)) {
      // Migration steps only await synchronous better-sqlite3 work, so no other
      // task can touch this connection between BEGIN and COMMIT.
      db.exec("BEGIN IMMEDIATE");
      try {
        await runMigration(version);
        db.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(version);
        db.exec("COMMIT");
      } catch (error) {
        if (db.inTransaction) db.exec("ROLLBACK");
        throw error;
      }
    } else {
      await runMigration(version);
      db.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(version);
    }
    console.log(`❇️ Database migration ${version} applied.`);
  }
}
