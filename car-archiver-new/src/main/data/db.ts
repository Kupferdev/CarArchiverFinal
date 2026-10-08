import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export let dbInstance: Database.Database | null = null;
let activeDbPath: string | null = null;

function normalizeDbPath(dbPath: string): string {
    return path.normalize(path.resolve(dbPath));
}

export function getActiveDbPath(): string | null {
    return activeDbPath;
}

export function CreateDefaultDb(dbPath: string) {
    const dbPathFinal = normalizeDbPath(dbPath);

    if (dbInstance) {
        if (activeDbPath === dbPathFinal) {
            return dbInstance;
        }
        throw new Error("A different database is already open. Close the current database before switching.");
    }

    try {
        const folder = path.dirname(dbPathFinal);
        fs.mkdirSync(folder, { recursive: true });

        const instance = new Database(dbPathFinal);
        instance.pragma("journal_mode = WAL");
        instance.pragma("synchronous = NORMAL");
        instance.pragma("foreign_keys = ON");

        dbInstance = instance;
        activeDbPath = dbPathFinal;

        console.log("❇️ DB Started:", dbPathFinal);
        return instance;
    } catch (err) {
        console.error("🆘 DB Error:", err);
        throw err;
    }
}

export function closeDb(): void {
    if (!dbInstance) return;

    dbInstance.close();
    dbInstance = null;
    activeDbPath = null;
    console.log("🔒 DB connection closed.");
}

export function getDb() {
    if (!dbInstance) {
        throw new Error("SQLite engine has not been initialized yet! Please call CreateDefaultDb() first.");
    }
    return dbInstance;
}
