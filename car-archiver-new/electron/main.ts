import { app, BrowserWindow, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { registerIpcHandlers } from './ipcHandlers'
import { closeDb, CreateDefaultDb } from '../src/main/data/db';
import { closeDrizzle, initDrizzle } from '../src/main/data/drizzle/drizzleDb';
import { runDatabaseMigrations } from '../src/main/data/migrations/migrationRunner';
import { getConfig } from '../src/main/helpers/config/configManager';


//const __dirname = path.dirname(fileURLToPath(import.meta.url))


const currentFilePath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(currentFilePath);

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

const VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST
process.env.VITE_PUBLIC = VITE_PUBLIC

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })


  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('before-quit', () => {
  closeDb();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

const STARTUP_ERROR_TEXTS = {
  tr: {
    title: 'Veritabanı başlatılamadı',
    body: (dbPath: string, message: string, logFile: string) =>
      `Uygulama veritabanını açamadığı için kapatılacak.\n\nVeritabanı: ${dbPath}\nHata: ${message}\n\nAyrıntılar: ${logFile}\n\nSorun sürerse bu iletiyi ve log dosyasını geliştiriciye iletin.`,
  },
  en: {
    title: 'Database could not be started',
    body: (dbPath: string, message: string, logFile: string) =>
      `The application could not open its database and will close.\n\nDatabase: ${dbPath}\nError: ${message}\n\nDetails: ${logFile}\n\nIf the problem persists, send this message and the log file to the developer.`,
  },
} as const

/** Shows a blocking error dialog, writes a log file and terminates the app. */
function failStartup(error: unknown, dbPath: string, language: string | undefined): never {
  const message = error instanceof Error ? error.message : String(error)
  const logFile = path.join(app.getPath('userData'), 'startup-error.log')

  try {
    const details = error instanceof Error ? (error.stack ?? error.message) : String(error)
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] DB: ${dbPath}\n${details}\n\n`)
  } catch (logError) {
    console.error('Could not write startup log:', logError)
  }

  const texts = language === 'tr' ? STARTUP_ERROR_TEXTS.tr : STARTUP_ERROR_TEXTS.en
  dialog.showErrorBox(texts.title, texts.body(dbPath, message, logFile))

  closeDrizzle()
  closeDb()
  app.exit(1)
  throw error // unreachable in practice; app.exit() terminates the process
}

app.whenReady().then(async () => {
  registerIpcHandlers();

  const config = getConfig();
  const finalDbPath = config?.savePath;

  if (finalDbPath) {
    try {
      CreateDefaultDb(finalDbPath);
      initDrizzle();
      await runDatabaseMigrations();
      console.log("🟢 Veritabanı bağlandı:", finalDbPath);
    } catch (error) {
      console.error("🔴 Veritabanı başlatılırken hata oluştu:", error);
      // Never open the UI without a working database: every IPC call would fail
      // with "SQLite engine has not been initialized".
      failStartup(error, finalDbPath, config?.language);
    }
  }

  //await seedCustomers(38);
  createWindow();
});
