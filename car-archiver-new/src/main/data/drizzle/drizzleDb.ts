import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { getDb } from "../db";

export let drizzleDb: BetterSQLite3Database | null = null;

export function initDrizzle() {
    if (drizzleDb) {
        console.log("ℹ️ Drizzle ORM is already initialized.");
        return drizzleDb;
    }

    const db = getDb();
    
    drizzleDb = drizzle(db);
    console.log("❇️ Drizzle ORM initialized successfully.");
    return drizzleDb;
}

export function useDb() {
    if (!drizzleDb) {
        throw new Error("Drizzle ORM has not been initialized yet! Please call initDrizzle() first.");
    }
    return drizzleDb;
}