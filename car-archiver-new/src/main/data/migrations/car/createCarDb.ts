import { getDb } from "../../db";

export function createCarsTable() {
  const db = getDb();

  const createCarTableSql = `
    CREATE TABLE IF NOT EXISTS Cars (
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
    )
  `;

  try {
    db.exec(createCarTableSql);
    console.log("❇️ Car table created");
  } catch (err) {
    console.log("🆘 Car table not created", (err as Error).message);
    throw err;
  }
}
