import { drizzle } from "drizzle-orm/better-sqlite3";
import { getDb } from "../db";

// 1. Drizzle'ı başta boş tanımlıyoruz. (Uygulama açılırken patlamaz)
export let drizzleDb: any = null;

// 2. Bu fonksiyonu sadece SQLite hazır olduğunda biz çağıracağız!
export function initDrizzle() {
    const db = getDb();
    
    if (!db) {
        throw new Error("Aga SQLite motoru yok, Drizzle'ı bağlayamam!");
    }

    // 3. Motoru Drizzle'a tam burada veriyoruz.
    drizzleDb = drizzle(db);
    console.log("❇️ Drizzle ORM Veritabanına Bağlandı!");
}