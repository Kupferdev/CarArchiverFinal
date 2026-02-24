import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

let filePath = "C:\\Users\\bakir\\Desktop\\";

const dbPath = path.resolve(filePath + "data_carArchiver.sqlite");

let db: Database.Database;

try {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new Database(dbPath);
    db.pragma("foreign_keys = on");

    console.log("❇️ Db created!");
} catch (err) {
    console.log("🆘 Db not created! ", (err as Error).message);
    process.exit(1);
}

export default db;
