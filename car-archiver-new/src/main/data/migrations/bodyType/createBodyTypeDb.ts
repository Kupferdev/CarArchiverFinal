import { useDb } from "../../drizzle/drizzleDb";
import { BodyTypes } from "../../drizzle/schemas/bodyTypesSchema/bodyTypeSchema";

import { getDb } from "../../db";



const baseBodyTypes: Array<{ bodyTypeName: string }> = [
  { bodyTypeName: "Sedan" },
  { bodyTypeName: "Hatchback" },
  { bodyTypeName: "SUV" },
  { bodyTypeName: "Coupe" },
  { bodyTypeName: "Station Wagon" },
  { bodyTypeName: "MPV" },
  { bodyTypeName: "Crossover" },
  { bodyTypeName: "Pickup" },
  { bodyTypeName: "Cabrio" }
];

export async function createBodyTypesTable() {

  const db = getDb();
  const orm = useDb();

  const createBodyTypesTableSql = `
    CREATE TABLE IF NOT EXISTS BodyTypes(
    bodyTypeId INTEGER PRIMARY KEY AUTOINCREMENT,
    bodyTypeName TEXT NOT NULL Unique
    )

`;

  try {
    db.exec(createBodyTypesTableSql);
    console.log("❇️ BodyTypes table created");
    try {
      await orm.insert(BodyTypes).values(baseBodyTypes).onConflictDoNothing();
      console.log(" ❇️ Base body types added the table.");
    } catch (err) {
      console.error("🆘 Base body types insert error:", (err as Error).message);
    }
  } catch (err) {
    console.log("🆘 BodyTypes table not created", (err as Error).message);
    throw err;
  }
}

