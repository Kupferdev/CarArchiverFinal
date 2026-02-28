import { ipcMain, dialog, app } from 'electron';
import fs from 'fs';
import path from 'path';
import { CreateDefaultDb } from '../src/main/data/db';
import { CreateDefaultDbTables } from '../src/main/data/setup';
import { initDrizzle } from '../src/main/data/drizzle/drizzleDb';
import { exec } from 'child_process';

// Uygulama verilerinin saklandığı klasör (Roaming içindeki klasörün)
const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'config.json');

export function registerIpcHandlers() {
  // 1. Config Kontrolü (Hata buradaydı, eklendi)
  ipcMain.handle('check-config', async () => {
    return fs.existsSync(configPath);
  });

  // 2. Klasör Seçme Diyaloğu
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  // 3. İçe Aktarma Doğrulaması (.sqlite dosyası var mı?)
  ipcMain.handle('verify-import-path', async (_event, folderPath) => {
    const dbName = 'data_carArcihiver.sqlite';
    const dbPath = path.join(folderPath, dbName);
    
    // Klasörün içinde bu isimde bir dosya var mı?
    if (fs.existsSync(dbPath)) {
      return dbPath;
    }
    return null;
  });

  // 4. Yeni Kurulum: Klasör ve Media Yapısı Oluşturma
// ipcHandlers.ts içindeki ilgili kısım
ipcMain.handle('setup-new-data-structure', async (_event, selectedRoot) => {
    try {
        // ÇİFT ÇALIŞMA KORUMASI: Eğer gelen yol zaten .sqlite ise, kurulum bitmiştir, geri dön!
        if (selectedRoot.endsWith('.sqlite')) {
            return selectedRoot;
        }

        const mainFolderName = 'CarServiceArchiver';
        const mainPath = path.join(selectedRoot, mainFolderName);
        const dbPath = path.join(mainPath, 'data_carArcihiver.sqlite');
        const mediaPath = path.join(mainPath, 'media');

        // KLASÖRÜ GİZLEME VE İNDEKSTEN ÇIKARMA OPERASYONU (Sadece Windows'ta çalışır)
            if (process.platform === 'win32') {
                // +h: Gizli yapar (Hidden)
                // +i: İçerik dizinlemeyi kapatır (Not Content Indexed)
                exec(`attrib +h +i "${mediaPath}"`, (error) => {
                    if (error) {
                        console.error("⚠️ Media klasörü gizlenemedi:", error);
                    } else {
                        console.log("🥷 Media klasörü Windows'tan gizlendi!");
                    }
                });
            }

        // ... mkdir işlemleri ...
        
        CreateDefaultDb(dbPath);
        initDrizzle(); // Drizzle'ı ateşle
        
        // DİKKAT: Artık tablolar asenkron olduğu için 'await' ile beklemeliyiz!
        await CreateDefaultDbTables(); 

        return dbPath;
    } catch (error: any) {
        console.error("🆘 SETUP PATLADI:", error.message);
        return null;
    }
});

ipcMain.handle('save-config', async (_event, configData) => {
    try {
        // İşletim sistemine göre uygulamanın güvenli veri klasörünü bulur (Örn: AppData/Roaming/SeninUygulama)
        const userDataPath = app.getPath('userData');
        const configPath = path.join(userDataPath, 'config.json');

        // Gelen configData objesini güzelce formatlayıp (null, 2) JSON dosyası olarak kaydeder
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');
        
        console.log("❇️ Config dosyası başarıyla kaydedildi: ", configPath);
        return true; // Başarılı olduğunu arayüze bildiriyoruz

    } catch (error: any) {
        console.error("🆘 Config kaydedilirken hata oluştu:", error.message);
        return false; // Başarısız oldu
    }
});

}