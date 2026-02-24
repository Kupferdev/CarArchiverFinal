import { ipcMain, dialog, app } from 'electron';
import fs from 'fs';
import path from 'path';

const configPath = path.join(app.getPath('userData'), 'config.json');

export function registerIpcHandlers() {
  // Klasör Seçme
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  // Config Kaydetme
  ipcMain.handle('save-config', async (_event, configData) => {
    try {
      if (!fs.existsSync(path.dirname(configPath))) {
        fs.mkdirSync(path.dirname(configPath), { recursive: true });
      }
      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
      return true;
    } catch (e) {
      return false;
    }
  });

  // Config Kontrol
  ipcMain.handle('check-config', async () => {
    return fs.existsSync(configPath);
  });
}