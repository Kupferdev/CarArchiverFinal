import db from "../../db";


export function createCarsTable() {

    const createCarTableSql = `
    CREATE TABLE IF NOT EXISTS Cars (
    carId INTEGER PRIMARY KEY AUTOINCREMENT,
    customerId INTEGER,
    oldCustomerId JSON NULL,
    brandId INTEGER NULL,
    modelId INTEGER NULL,
    year INTEGER NULL,
    vinNumber TEXT NULL,
    plateNumber TEXT NULL,
    km REAL NULL,
    fuelType INTEGER NULL,
    bodyType INTEGER NULL
    )
`;

    try {
        db.exec(createCarTableSql);
        console.log("❇️ Car table created")
    } catch (err) {
        console.log("🆘 Car table not created", (err as Error).message);
    }
}