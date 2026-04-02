import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);

export let dbInstance: Database.Database | null = null;

export function CreateDefaultDb(dbPath: string) {
    if (dbInstance) {
        console.log("ℹ️ Database connection is already open.");
        return dbInstance;
    }

    const dbPathFinal = path.normalize(dbPath); 

    try {
        const folder = path.dirname(dbPathFinal);
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        dbInstance = new Database(dbPathFinal);
        dbInstance.pragma("foreign_keys = on");
        
        console.log("❇️ DB Started: ", dbPathFinal);
        return dbInstance;
    } catch (err) {
        console.error("🆘 DB Error:", err);
        throw err; 
    }
}

export function getDb() {
    if (!dbInstance) {
        throw new Error("SQLite engine has not been initialized yet! Please call CreateDefaultDb() first.");
    }
    return dbInstance;   
}