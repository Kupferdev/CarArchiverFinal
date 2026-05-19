import { ipcMain, dialog, app } from 'electron';
import fs from 'fs';
import path from 'path';
import { CreateDefaultDb } from '../src/main/data/db';
import { CreateDefaultDbTables } from '../src/main/data/setup';
import { initDrizzle } from '../src/main/data/drizzle/drizzleDb';
import { exec } from 'child_process';

const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'config.json');

export function registerIpcHandlers() {

  // 1. Config Check
  ipcMain.handle('check-config', async () => {
    return fs.existsSync(configPath);
  });

  // 2. Directory Selection Dialog
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  // 3. Import Validation (is there a .sqlite file?)
  ipcMain.handle('verify-import-path', async (_event, folderPath) => {
    const dbName = 'data_carArcihiver.sqlite';
    const dbPath = path.join(folderPath, dbName);

    if (fs.existsSync(dbPath)) {
      return dbPath;
    }
    return null;
  });

  // 4. New Setup: Create Folder and Media Structure
  ipcMain.handle('setup-new-data-structure', async (_event, selectedRoot) => {
    try {
      const mainFolderName = 'CarServiceArchiver';
      const mainPath = path.join(selectedRoot, mainFolderName);
      const dbPath = path.join(mainPath, 'data_carArcihiver.sqlite');
      const mediaPath = path.join(mainPath, 'media');

      // Create directories if they don't exist
      if (!fs.existsSync(mainPath)) {
        fs.mkdirSync(mainPath, { recursive: true });
        console.log('📁 Main folder created:', mainPath);
      }

      if (!fs.existsSync(mediaPath)) {
        fs.mkdirSync(mediaPath, { recursive: true });
        console.log('📁 Media folder created:', mediaPath);
      }

      // Hide media folder from Windows Explorer and indexing (Windows only)
      if (process.platform === 'win32') {
        exec(`attrib +h +i "${mediaPath}"`, (error) => {
          if (error) {
            console.error('⚠️ Media folder could not be hidden:', error);
          } else {
            console.log('🥷 Media folder hidden from Windows Explorer.');
          }
        });
      }

      CreateDefaultDb(dbPath);
      initDrizzle();
      await CreateDefaultDbTables();

      console.log('❇️ Setup completed successfully. DB path:', dbPath);
      return dbPath;

    } catch (error: any) {
      console.error('🆘 Setup failed:', error.message);
      return null;
    }
  });

  // 5. Save Config
  ipcMain.handle('save-config', async (_event, configData) => {
    try {
      const userDataPath = app.getPath('userData');
      const configPath = path.join(userDataPath, 'config.json');

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');

      console.log('❇️ Config file saved successfully:', configPath);
      return true;

    } catch (error: any) {
      console.error('🆘 Failed to save config:', error.message);
      return false;
    }
  });

}