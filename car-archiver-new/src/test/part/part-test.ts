import path from 'path';
import fs from 'fs';
import { faker } from '@faker-js/faker';

// Proje içi importlar
import { CreateDefaultDb } from '../../../src/main/data/db';
import { initDrizzle, useDb } from '../../../src/main/data/drizzle/drizzleDb';
import { CreateDefaultDbTables } from '../../../src/main/data/setup';
import { PartsRepository } from "../../../src/main/data/drizzle/repositories/partsRepository";
import { PartService } from "../../services/partService";

const log = (msg: string, type: 'info' | 'success' | 'err' | 'step' = 'info') => {
    const icons = { info: 'ℹ️', success: '✅', err: '🆘', step: '🚀' };
    console.log(`${icons[type]} ${msg}`);
};

// --- YOLU ÇEKEN ANA FONKSİYON ---
function getDbPathFromConfig(): string | null {
    try {
        // Windows'ta Roaming klasörüne git ve senin klasörüne gir
        const roamingPath = process.env.APPDATA || '';
        const appFolderName = "CarServiceArchiver"; // <--- Klasör adın tam olarak bu!
        const configPath = path.join(roamingPath, appFolderName, 'config.json');

        log(`Searching config at: ${configPath}`, 'info');

        if (!fs.existsSync(configPath)) {
            log("Config file not found! Please check if the folder name is correct in %APPDATA%.", 'err');
            return null;
        }

        const configRaw = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configRaw);

        if (config.savePath) {
            log(`Database path found: ${config.savePath}`, 'success');
            return config.savePath;
        } else {
            log("Key 'savePath' not found in config.json!", 'err');
            return null;
        }
    } catch (error: any) {
        log(`Read error: ${error.message}`, 'err');
        return null;
    }
}

async function runFullTest() {
    log("Starting Test with Config Settings...", 'step');

    const dbPath = getDbPathFromConfig();

    if (!dbPath) {
        log("Test stopped because DB path couldn't be resolved.", 'err');
        return;
    }

    try {
        // --- MOTORU ÇALIŞTIR ---
        log(`Connecting to: ${dbPath}`, 'info');
        CreateDefaultDb(dbPath);
        initDrizzle();
        
        // Tabloları kontrol et
        log("Checking tables...", 'info');
        CreateDefaultDbTables(); 
        
        const partsRepo = new PartsRepository();
        const partService = new PartService(partsRepo);

        // --- TEST VERİSİ EKLEME ---
        // Not: Canlı DB'de carId=1 ve serviceId=1 olduğunu varsayıyoruz.
        log("Inserting test parts...", 'step');
        const mockParts = Array.from({ length: 3 }).map(() => ({
            carId: 1,
            serviceId: 1,
            partName: "TEST_" + faker.commerce.productName(),
            partPrice: 500,
            partTax: 20
        }));

        const createRes = await partService.createParts(mockParts);
        
        if (createRes.success) {
            log("SUCCESS: Data written to your LIVE database!", 'success');
        } else {
            log(`FAILED: ${createRes.message}`, 'err');
        }

    } catch (error: any) {
        log(`CRITICAL: ${error.message}`, 'err');
    }
}

runFullTest();