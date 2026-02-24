import { FuelType } from "../../../../shared/types/fueltype";
import db from "../../db";
import { drizzleDb } from "../../drizzle/drizzleDb";
import { FuelTypes } from "../../drizzle/schemas/fuelTypesSchema/fuelTypeSchema";
import { createFuelTypesTranslationsTable } from "../../translations/fuelTypeTranslationsDb";


const baseFuelTypes: Array<FuelType> = [
    { fuelTypeName: "Benzin" },
    { fuelTypeName: "Dizel" },
    { fuelTypeName: "LPG" },
    { fuelTypeName: "Elektrik" },
    { fuelTypeName: "Hibrit" }
];


export async function createFuelTypesTable() {

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
            await drizzleDb.insert(FuelTypes).values(baseFuelTypes);
            console.log(" ❇️ Base Fuel types added the table.");
            createFuelTypesTranslationsTable();
        } catch (err){
            console.log("🆘 Base Fuel types insert error."), (err as Error).message;
        }
    } catch (err) {
        console.log("🆘 FuelTypes table not created", (err as Error).message);
    }
}

