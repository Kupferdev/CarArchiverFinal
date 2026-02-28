import { getDb } from "../../db";


export function createPartsTable(){

    const db = getDb();

const createPartTableSql = `
    CREATE TABLE IF NOT EXISTS Parts(
        partId INTEGER PRIMARY KEY AUTOINCREMENT,
        carId INTEGER NOT NULL,
        serviceId INTEGER NOT NULL,
        partName TEXT NOT NULL,
        partTax REAL NULL,
        partPrice REAL NULL
    );
`;

try {
    db.exec(createPartTableSql);
    console.log("❇️ Parts table created");
} catch (err) {
    console.log("🆘 Parts table not created", (err as Error).message);
}
}

