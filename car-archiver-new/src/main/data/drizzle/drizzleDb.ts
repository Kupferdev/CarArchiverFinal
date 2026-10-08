import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { getDb } from "../db";

export let drizzleDb: BetterSQLite3Database | null = null;

export function initDrizzle() {
    if (drizzleDb) {
        return drizzleDb;
    }

    drizzleDb = drizzle(getDb());
    console.log("❇️ Drizzle ORM initialized successfully.");
    return drizzleDb;
}

export function closeDrizzle(): void {
    drizzleDb = null;
}

export function useDb() {
    if (!drizzleDb) {
        throw new Error("Drizzle ORM has not been initialized yet! Please call initDrizzle() first.");
    }
    return drizzleDb;
}
