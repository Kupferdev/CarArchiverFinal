import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// İsimleri değiştiriyoruz (Bundler'ın kafası karışmasın diye)
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);

export let dbInstance: any = null;

export function CreateDefaultDb(dbPath: string) {
    const dbPathFinal = path.normalize(dbPath); 

    try {
        const folder = path.dirname(dbPathFinal);
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        // Eğer hala hata veriyorsa, sorun better-sqlite3'ün içindedir.
        // Ama bu atama ile aşmış olmamız lazım.

        dbInstance = new Database(dbPathFinal);
        dbInstance.pragma("foreign_keys = on");

        
        console.log("❇️ SQLite Motoru Ateşlendi: ", dbPathFinal);
    } catch (err) {
        // HATA MESAJINI DAHA NET GÖRELİM
        console.error("🆘 DB OLUŞTURMA SIRASINDA PATLADI:", err);
        throw err; 
    }
    
}

export function getDb() {
    return dbInstance;   
}