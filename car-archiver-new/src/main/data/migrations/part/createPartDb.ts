import { getDb } from "../../db";

export function createPartsTable() {
  getDb().exec(`
    CREATE TABLE IF NOT EXISTS Parts (
      partId INTEGER PRIMARY KEY AUTOINCREMENT,
      carId INTEGER NOT NULL REFERENCES Cars(carId) ON DELETE CASCADE,
      serviceId INTEGER NOT NULL REFERENCES Services(serviceId) ON DELETE CASCADE,
      partName TEXT NOT NULL CHECK(length(trim(partName)) > 0),
      quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
      unitPriceKurus INTEGER NOT NULL DEFAULT 0 CHECK(unitPriceKurus >= 0)
    )
  `);
}
