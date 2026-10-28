import { retryPendingMediaDeletes } from '../src/main/data/trash';
import { app, BrowserWindow, dialog, Menu, Rectangle, session } from 'electron';
import { isTrustedAppUrl } from './security';
import { isPermittedRendererRequest } from './networkPolicy';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { registerIpcHandlers } from './ipcHandlers';
import { closeDb, CreateDefaultDb } from '../src/main/data/db';
import { closeDrizzle, initDrizzle } from '../src/main/data/drizzle/drizzleDb';
import { runDatabaseMigrations } from '../src/main/data/migrations/migrationRunner';
import { getConfig } from '../src/main/helpers/config/configManager';
import { applyPendingRestore } from '../src/main/data/dataRestore';

const currentFilePath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(currentFilePath);

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

const VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;
process.env.VITE_PUBLIC = VITE_PUBLIC;

let win: BrowserWindow | null = null;
let showingStartup = true;

interface PersistedWindowState {
  bounds: Pick<Rectangle, 'x' | 'y' | 'width' | 'height'>;
  isMaximized: boolean;
}

const WINDOW_STATE_FILE = 'window-state.json';
const DEFAULT_WINDOW_SIZE = { width: 1440, height: 920 };
const WINDOW_THEME_FILE = 'window-theme.json';
const WINDOW_THEME_COLORS = {
  navy: { color: '#151b35', symbolColor: '#e8eaff' },
  dark: { color: '#12151b', symbolColor: '#f0f3f7' },
  light: { color: '#ffffff', symbolColor: '#111827' },
  dim: { color: '#30343d', symbolColor: '#e4e6eb' },
} as const;

function getInitialWindowTheme() {
  try {
    const theme = JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), WINDOW_THEME_FILE), 'utf8')) as unknown;
    if (typeof theme === 'string' && Object.prototype.hasOwnProperty.call(WINDOW_THEME_COLORS, theme)) {
      return WINDOW_THEME_COLORS[theme as keyof typeof WINDOW_THEME_COLORS];
    }
  } catch { /* No saved theme yet. */ }
  return WINDOW_THEME_COLORS.navy;
}


function getWindowStatePath() {
  return path.join(app.getPath('userData'), WINDOW_STATE_FILE);
}

function loadWindowState(): PersistedWindowState | null {
  try {
    const raw = fs.readFileSync(getWindowStatePath(), 'utf8');
    const parsed = JSON.parse(raw) as PersistedWindowState;
    if (!parsed?.bounds?.width || !parsed?.bounds?.height) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveWindowState(window: BrowserWindow) {
  try {
    const bounds = window.getBounds();
    const payload: PersistedWindowState = {
      bounds,
      isMaximized: window.isMaximized(),
    };
    fs.writeFileSync(getWindowStatePath(), JSON.stringify(payload, null, 2), 'utf8');
  } catch (error) {
    console.error('Could not persist window state:', error);
  }
}

// Localized main-process copy: splash is visible before React/i18next starts.
const splashCopy:Record<string,[string,string,string,string,string,string,string,string]>={
 tr:['Yerel servis kayıtları','Uygulama başlatılıyor…','Uygulama hazırlanıyor…','Bekleyen yedek kontrol ediliyor…','Yerel veritabanı açılıyor…','Veritabanı yapısı kontrol ediliyor…','Arayüz yükleniyor…','Başlatma beklenenden uzun sürdü. Uygulama günlüklerini kontrol edin.'],
 en:['Local service records','Starting application…','Preparing application…','Checking pending backup restoration…','Opening local database…','Checking database structure…','Loading interface…','Startup is taking longer than expected. Check application logs.'],
 es:['Registros locales del taller','Iniciando aplicación…','Preparando aplicación…','Comprobando restauración pendiente…','Abriendo base de datos local…','Comprobando estructura de datos…','Cargando interfaz…','El inicio tarda más de lo esperado. Revise los registros.'],
 fr:['Dossiers locaux de l’atelier','Démarrage de l’application…','Préparation de l’application…','Vérification de la sauvegarde à restaurer…','Ouverture de la base locale…','Vérification de la base de données…','Chargement de l’interface…','Démarrage plus long que prévu. Vérifiez les journaux.'],
 de:['Lokale Servicedaten','Anwendung wird gestartet…','Anwendung wird vorbereitet…','Ausstehende Wiederherstellung wird geprüft…','Lokale Datenbank wird geöffnet…','Datenbankstruktur wird geprüft…','Oberfläche wird geladen…','Start dauert länger als erwartet. Prüfen Sie die Protokolle.'],
 pt:['Registos locais de oficina','A iniciar a aplicação…','A preparar a aplicação…','A verificar restauro pendente…','A abrir base de dados local…','A verificar estrutura da base…','A carregar interface…','O arranque está a demorar. Consulte os registos.'],
 zh:['本地维修记录','正在启动应用…','正在准备应用…','正在检查待恢复的备份…','正在打开本地数据库…','正在检查数据库结构…','正在加载界面…','启动时间超出预期，请查看应用日志。'],
 ja:['ローカル整備記録','アプリを起動中…','アプリを準備中…','復元待ちのバックアップを確認中…','ローカルデータベースを開いています…','データベース構造を確認中…','画面を読み込み中…','起動に時間がかかっています。ログを確認してください。'],
 ko:['로컬 정비 기록','앱 시작 중…','앱 준비 중…','대기 중인 백업 복원 확인…','로컬 데이터베이스 여는 중…','데이터베이스 구조 확인 중…','화면 불러오는 중…','시작이 예상보다 오래 걸립니다. 로그를 확인하세요.'],
 ru:['Локальные сервисные записи','Запуск приложения…','Подготовка приложения…','Проверка ожидающего восстановления…','Открытие локальной базы данных…','Проверка структуры базы данных…','Загрузка интерфейса…','Запуск занимает слишком много времени. Проверьте журналы.'],
 nl:['Lokale servicegegevens','App starten…','App voorbereiden…','Herstel van back-up controleren…','Lokale database openen…','Databasestructuur controleren…','Interface laden…','Opstarten duurt langer dan verwacht. Controleer de logbestanden.'],
 az:['Yerli servis qeydləri','Tətbiq başladılır…','Tətbiq hazırlanır…','Gözləyən bərpa yoxlanılır…','Yerli verilənlər bazası açılır…','Baza strukturu yoxlanılır…','İnterfeys yüklənir…','Başlama gözləniləndən uzun çəkir. Jurnalları yoxlayın.'],
 it:['Registri locali di assistenza','Avvio dell’app…','Preparazione dell’app…','Verifica ripristino in sospeso…','Apertura del database locale…','Verifica struttura del database…','Caricamento interfaccia…','Avvio più lento del previsto. Controllare i registri.'],
 pl:['Lokalne rejestry serwisowe','Uruchamianie aplikacji…','Przygotowywanie aplikacji…','Sprawdzanie oczekującego przywracania…','Otwieranie lokalnej bazy danych…','Sprawdzanie struktury bazy…','Ładowanie interfejsu…','Uruchamianie trwa dłużej niż zwykle. Sprawdź dzienniki.']
};
function currentStartupLanguage(): string {
  try {
    const saved = JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'startup-language.json'),'utf8')) as {language?:unknown};
    if (typeof saved.language === 'string' && splashCopy[saved.language]) return saved.language;
  } catch { /* First launch, or no language override yet. */ }
  const configured = getConfig()?.language?.split('-')[0];
  if (configured && splashCopy[configured]) return configured;
  const osLanguage = app.getLocale().split('-')[0];
  return splashCopy[osLanguage] ? osLanguage : 'en';
}
const splashLabels=()=>splashCopy[currentStartupLanguage()]??splashCopy.en;

// A single BrowserWindow owns both startup and the main renderer. A separate
// splash BrowserWindow can overlap the native title bar and appear as a second app.
async function createStartupSplash(): Promise<void> {
  const theme = getInitialWindowTheme();
  const savedState = loadWindowState();
  win = new BrowserWindow({
    title: 'Car Service Archiver',
    icon: path.join(VITE_PUBLIC, 'car-archiver-logo.png'),
    ...(process.platform === 'win32' ? {titleBarStyle: 'hidden' as const, titleBarOverlay: {...theme, height:30}} : {}),
    width: savedState?.bounds.width ?? DEFAULT_WINDOW_SIZE.width,
    height: savedState?.bounds.height ?? DEFAULT_WINDOW_SIZE.height,
    x: savedState?.bounds.x,
    y: savedState?.bounds.y,
    minWidth: 720,
    minHeight: 520,
    movable: true, // Explicitly allow native Windows dragging of CSS app regions.
    backgroundColor: theme.color,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {preload: path.join(__dirname,'preload.mjs'), nodeIntegration:false, contextIsolation:true, sandbox:true, webSecurity:true},
  });
  const currentWindow = win;
  // Register guards only after the window reference exists. Electron 30 supports
  // will-navigate; will-frame-navigate is not part of its typed WebContents API.
  currentWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  currentWindow.webContents.on('will-navigate', (event, url) => {
    if (!isTrustedAppUrl(url, VITE_DEV_SERVER_URL, RENDERER_DIST)) event.preventDefault();
  });
  Menu.setApplicationMenu(null);
  currentWindow.once('ready-to-show', () => { if (!currentWindow.isDestroyed()) currentWindow.show(); });
  currentWindow.webContents.once('did-finish-load', () => { if (!currentWindow.isDestroyed() && !currentWindow.isVisible()) currentWindow.show(); });
  if (savedState?.isMaximized) currentWindow.maximize();
  currentWindow.on('close', () => saveWindowState(currentWindow));
  currentWindow.on('closed', () => {if (win === currentWindow) win = null;});

  const labels=splashLabels();
  const page = `<!DOCTYPE html><html lang="${currentStartupLanguage()}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:${theme.color};color:${theme.symbolColor};font:14px system-ui,Segoe UI,sans-serif;-webkit-user-select:none}
  .startupDrag{position:fixed;top:0;left:0;right:140px;height:30px;-webkit-app-region:drag}main{width:min(480px,100%);padding:32px 38px}.brand{display:flex;gap:14px;align-items:center;margin-bottom:36px}.symbol{height:46px;width:46px;border-radius:12px;display:grid;place-items:center;background:#6477db;color:white;font-size:23px;font-weight:700}.title{font-weight:750;font-size:21px}.sub{opacity:.66;font-size:12px;margin-top:3px}.status{opacity:.88;margin-bottom:12px;font-size:13px;min-height:22px}.track{height:5px;overflow:hidden;border-radius:6px;background:#8d9ab033}.pulse{height:100%;width:38%;border-radius:6px;background:#8999fa;animation:slide 1.4s ease-in-out infinite alternate}@keyframes slide{from{transform:translateX(-15%)}to{transform:translateX(190%)}}</style></head>
  <body><div class="startupDrag" aria-hidden="true"></div><main><div class="brand"><div class="symbol">C</div><div><div class="title">Car Service Archiver</div><div class="sub">${labels[0]}</div></div></div><div class="status" id="status">${labels[1]}</div><div class="track"><div class="pulse"></div></div></main></body></html>`;
  await currentWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(page));
}
function updateSplash(message: string) {
  if (!showingStartup || !win || win.isDestroyed()) return;
  // While the splash document is loading, it may not yet have the status node.
  void win.webContents.executeJavaScript(`{ const status = document.getElementById('status'); if (status) status.textContent = ${JSON.stringify(message)}; }`).catch(() => {});
}

function createWindow() {
  // Reuse the already visible startup window; do not create a second window.
  const mainWindow = win;
  if (!mainWindow || mainWindow.isDestroyed()) throw new Error('Startup window is unavailable');
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, description) => {
    console.error('Renderer load failed:', errorCode, description);
  });
  mainWindow.webContents.once('did-finish-load', () => {showingStartup = false;});
  if (VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

app.on('before-quit', () => {
  closeDb();
});

app.on('browser-window-created', (_event, browserWindow) => {
  browserWindow.setMenuBarVisibility(false);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    // Startup is owned by the initial ready handler; avoid a duplicate window.
    console.warn('No window on activate; application startup is not active.');
  }
});

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
} as const;

function failStartup(error: unknown, dbPath: string, language: string | undefined): never {
  const message = error instanceof Error ? error.message : String(error);
  const logFile = path.join(app.getPath('userData'), 'startup-error.log');

  try {
    const details = error instanceof Error ? (error.stack ?? error.message) : String(error);
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] DB: ${dbPath}\n${details}\n\n`);
  } catch (logError) {
    console.error('Could not write startup log:', logError);
  }

  const texts = language === 'tr' ? STARTUP_ERROR_TEXTS.tr : STARTUP_ERROR_TEXTS.en;
  dialog.showErrorBox(texts.title, texts.body(dbPath, message, logFile));

  closeDrizzle();
  closeDb();
  app.exit(1);
  throw error;
}

app.whenReady().then(async () => {
  // This is a record-entry application, not a browser editor. No red spellcheck underlines.
  session.defaultSession.setSpellCheckerEnabled(false);
  // Do not permit renderer/print HTML to reach outside addresses, even if a
  // malicious resource slips past the renderer CSP. Vite HMR is loopback-only.
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    callback({ cancel: !isPermittedRendererRequest(details.url, VITE_DEV_SERVER_URL) });
  });
  await createStartupSplash();
  updateSplash(splashLabels()[2]);
  registerIpcHandlers();

  const config = getConfig();
  const finalDbPath = config?.savePath;

  if (finalDbPath) {
    try {
      updateSplash(splashLabels()[3]);
      const rescue = applyPendingRestore(app.getPath('userData'), finalDbPath);
      if (rescue) console.log('Backup restored. Original files preserved at:', rescue);
      updateSplash(splashLabels()[4]);
      CreateDefaultDb(finalDbPath);
      initDrizzle();
      updateSplash(splashLabels()[5]);
      await runDatabaseMigrations();
      try {retryPendingMediaDeletes();}
      catch (error) {console.error('Deferred media cleanup failed at startup:',error);}
      console.log('🟢 Veritabanı bağlandı:', finalDbPath);
    } catch (error) {
      console.error('🔴 Veritabanı başlatılırken hata oluştu:', error);
      failStartup(error, finalDbPath, currentStartupLanguage());
    }
  }

  updateSplash(splashLabels()[6]);
  createWindow();
  setTimeout(() => {
    if (showingStartup && win && !win.isDestroyed()) updateSplash(splashLabels()[7]);
  }, 30000);
}).catch(error => {
  console.error('Unexpected startup failure:',error);
  failStartup(error,'(startup)', currentStartupLanguage());
});
