import { ipcMain, dialog, app } from 'electron';
import fs from 'fs';
import path from 'path';

export function registerIpcHandlers() {
  // Klasör Seçme (Zaten vardı)
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    return result.canceled ? null : result.filePaths[0];
  });

  // İçe Aktarma Kontrolü: .sqlite dosyası var mı?
  ipcMain.handle('verify-import-path', async (_event, folderPath) => {
    const dbPath = path.join(folderPath, 'data_carArcihiver.sqlite');
    return fs.existsSync(dbPath) ? dbPath : null;
  });

  // Yeni Kurulum: Klasör yapısını oluştur ve DB'yi tetikle
  ipcMain.handle('setup-new-data-structure', async (_event, baseRoot) => {
    try {
      const mainFolder = path.join(baseRoot, 'CarServiceArchiver');
      const mediaFolder = path.join(mainFolder, 'media');
      
      if (!fs.existsSync(mediaFolder)) {
        fs.mkdirSync(mediaFolder, { recursive: true });
      }

      const dbPath = path.join(mainFolder, 'data_carArcihiver.sqlite');
      
      // Backend'deki metodunu tetikle (Main içinde tanımlı olduğunu varsayıyorum)
      // CreateDefaultDb(dbPath); 

      return dbPath;
    } catch (e) {
      return null;
    }
  });
}