import { FuelType } from "../../../../shared/types/fueltype";
import { useDb } from "../../drizzle/drizzleDb";
import { FuelTypes } from "../../drizzle/schemas/fuelTypesSchema/fuelTypeSchema";

import { getDb } from "../../db";


const baseFuelTypes: Array<FuelType> = [
    { fuelTypeName: "Benzin" },
    { fuelTypeName: "Dizel" },
    { fuelTypeName: "LPG" },
    { fuelTypeName: "Elektrik" },
    { fuelTypeName: "Hibrit" }
];


export async function createFuelTypesTable() {

    const db = getDb();
    const orm = useDb();

    const createFuelTypesTableSql = `
    CREATE TABLE IF NOT EXISTS FuelTypes(
        fuelTypeId INTEGER PRIMARY KEY AUTOINCREMENT,
        fuelTypeName TEXT NOT NULL Unique
    )

`;

    try {
        db.exec(createFuelTypesTableSql);
        console.log("❇️ FuelTypes table created");
        try {
            await orm.insert(FuelTypes).values(baseFuelTypes).onConflictDoNothing();;
            console.log(" ❇️ Base Fuel types added the table.");
        } catch (err){
            console.error("🆘 Base Fuel types insert error:", (err as Error).message);
            throw err;
        }
    } catch (err) {
        console.log("🆘 FuelTypes table not created", (err as Error).message);
        throw err;
    }
}

