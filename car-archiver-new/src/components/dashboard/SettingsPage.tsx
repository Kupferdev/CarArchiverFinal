import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './SettingsPage.module.css';
import { applyFont,fontStacks } from '../../utils/fontPreferences';
import { setClockStyle,useClockStyle,type ClockStyle } from '../../utils/clockPreferences';
import {useToastStore} from '../../store/toastStore';
import {SettingsExtras,LegalAbout,FeedbackPanel} from './SettingsExtras';
import TrashPanel from './TrashPanel';
type ThemeChoice = 'navy' | 'dark' | 'light' | 'dim';
const languageNames: Record<string,string> = {
  tr:'Türkçe',en:'English',es:'Español',fr:'Français',de:'Deutsch',pt:'Português',
  zh:'中文',ja:'日本語',ko:'한국어',ru:'Русский',nl:'Nederlands',az:'Azərbaycanca',it:'Italiano',pl:'Polski'
};
const themes: {id:ThemeChoice;label:string;description:string;background:string}[] = [
  {id:'navy',label:'Lacivert',description:'themeDescNavy',background:'#1c2340'},
  {id:'dark',label:'Koyu',description:'themeDescDark',background:'#0a0c10'},
  {id:'light',label:'Açık',description:'themeDescLight',background:'#f3f4f6'},
  {id:'dim',label:'Dim',description:'themeDescDim',background:'#282b33'},
];

// Storage restore copy: fixed localized safety warning in all supported languages.
const restoreLabels:Record<string,[string,string,string,string]> = {
  tr:['Yedekten geri yükle','Seçilen yedek SQLite ve fotoğrafların yerini alır. İşlemden önce mevcut veriler kurtarma klasörüne taşınır. Uygulama yeniden açılır.','Yedeği seç ve geri yükle','Yedek doğrulanıyor…'],
  en:['Restore a backup','The selected backup replaces your SQLite data and photos. Current data is saved to a recovery folder first. The app restarts.','Choose backup and restore','Checking backup…'],
  es:['Restaurar copia de seguridad','La copia reemplazará la base de datos y las fotos. Antes se guardarán los datos actuales en una carpeta de recuperación. La aplicación se reiniciará.','Seleccionar copia y restaurar','Comprobando copia…'],
  fr:['Restaurer une sauvegarde','La sauvegarde remplacera la base SQLite et les photos. Les données actuelles seront d’abord conservées dans un dossier de récupération. L’application redémarrera.','Choisir une sauvegarde','Vérification…'],
  de:['Sicherung wiederherstellen','Die Sicherung ersetzt SQLite-Daten und Fotos. Die aktuellen Daten werden zuerst in einem Rettungsordner aufbewahrt. Die Anwendung startet neu.','Sicherung wählen und wiederherstellen','Sicherung prüfen…'],
  pt:['Restaurar cópia de segurança','A cópia substitui a base SQLite e as fotos. Os dados atuais serão guardados numa pasta de recuperação antes de reiniciar.','Escolher cópia e restaurar','A verificar a cópia…'],
  zh:['恢复备份','所选备份将替换 SQLite 数据和照片。当前数据将先保存到恢复文件夹，然后重新启动应用。','选择备份并恢复','正在检查备份…'],
  ja:['バックアップを復元','SQLite データと写真が置き換わります。現在のデータは復旧用フォルダーに保存され、その後アプリが再起動します。','バックアップを選んで復元','バックアップを確認中…'],
  ko:['백업 복원','선택한 백업으로 SQLite 데이터와 사진을 교체합니다. 현재 데이터는 복구 폴더에 보관한 다음 앱이 다시 시작됩니다.','백업 선택 및 복원','백업 확인 중…'],
  ru:['Восстановить резервную копию','Копия заменит базу SQLite и фотографии. Текущие данные сначала сохранятся в папке восстановления. Приложение перезапустится.','Выбрать копию и восстановить','Проверка копии…'],
  nl:['Back-up herstellen','De back-up vervangt de SQLite-data en foto’s. De huidige gegevens worden eerst in een herstelmap bewaard. De app start opnieuw.','Back-up kiezen en herstellen','Back-up controleren…'],
  az:['Yedəyi bərpa et','Seçilən ehtiyat nüsxə SQLite məlumatlarını və fotoları əvəz edəcək. Cari məlumatlar əvvəlcə bərpa qovluğuna köçürüləcək. Tətbiq yenidən açılacaq.','Yedəyi seç və bərpa et','Yedək yoxlanılır…'],
  it:['Ripristina backup','Il backup sostituirà il database SQLite e le foto. I dati attuali saranno prima salvati in una cartella di recupero. L’app verrà riavviata.','Seleziona backup e ripristina','Verifica backup…'],
  pl:['Przywróć kopię zapasową','Kopia zastąpi bazę SQLite i zdjęcia. Bieżące dane zostaną najpierw zachowane w folderze odzyskiwania. Aplikacja uruchomi się ponownie.','Wybierz kopię i przywróć','Sprawdzanie kopii…'],
};

const confirmLabels:Record<string,[string,string,string,string,string]> = {
  tr:['Geri yüklemeyi onayla','Bu işlem iki veritabanını birleştirmez. Seçili yedek aktif verilerin yerini alacak; mevcut veriler kurtarma klasörüne alınacak.','Vazgeç','Geri yükle ve yeniden başlat','Uygulama yeniden başlatılıyor…'],
  en:['Confirm restore','This does not merge databases. The selected backup replaces the active data. Current data will be kept in a recovery folder.','Cancel','Restore and restart','Restarting the application…'],
  es:['Confirmar restauración','No combina bases de datos. La copia sustituirá los datos activos; los actuales se guardarán en una carpeta de recuperación.','Cancelar','Restaurar y reiniciar','Reiniciando la aplicación…'],
  fr:['Confirmer la restauration','Les bases de données ne sont pas fusionnées. La sauvegarde remplace les données actives; les anciennes sont conservées dans un dossier de récupération.','Annuler','Restaurer et redémarrer','Redémarrage en cours…'],
  de:['Wiederherstellung bestätigen','Die Datenbanken werden nicht zusammengeführt. Die Sicherung ersetzt die aktiven Daten; die bisherigen Daten werden im Wiederherstellungsordner gesichert.','Abbrechen','Wiederherstellen und neu starten','Anwendung wird neu gestartet…'],
  pt:['Confirmar restauro','As bases de dados não são combinadas. A cópia substitui os dados ativos; os atuais ficam numa pasta de recuperação.','Cancelar','Restaurar e reiniciar','A reiniciar a aplicação…'],
  zh:['确认恢复','此操作不会合并数据库。所选备份将替换当前数据，原数据将保存在恢复文件夹中。','取消','恢复并重新启动','正在重新启动应用…'],
  ja:['復元の確認','データベースは結合されません。選択したバックアップが現在のデータを置き換え、元のデータは復旧フォルダーに保管されます。','キャンセル','復元して再起動','アプリを再起動しています…'],
  ko:['복원 확인','데이터베이스는 병합되지 않습니다. 선택한 백업이 현재 데이터를 대체하며 기존 데이터는 복구 폴더에 보관됩니다.','취소','복원 후 다시 시작','앱을 다시 시작하는 중…'],
  ru:['Подтвердить восстановление','Базы данных не объединяются. Резервная копия заменит текущие данные, а прежние будут сохранены в папке восстановления.','Отмена','Восстановить и перезапустить','Перезапуск приложения…'],
  nl:['Herstel bevestigen','Databases worden niet samengevoegd. De back-up vervangt de actieve gegevens; de huidige gegevens blijven in een herstelmap bewaard.','Annuleren','Herstellen en opnieuw starten','De app wordt opnieuw gestart…'],
  az:['Bərpanı təsdiqlə','Verilənlər bazaları birləşdirilmir. Yedək cari məlumatları əvəz edir; mövcud məlumatlar bərpa qovluğunda saxlanılır.','Ləğv et','Bərpa et və yenidən başlat','Tətbiq yenidən başladılır…'],
  it:['Conferma ripristino','I database non vengono uniti. Il backup sostituisce i dati attivi; i dati correnti vengono conservati in una cartella di recupero.','Annulla','Ripristina e riavvia','Riavvio dell’app…'],
  pl:['Potwierdź przywrócenie','Bazy danych nie zostaną połączone. Kopia zastąpi aktywne dane, a obecne zostaną zapisane w folderze odzyskiwania.','Anuluj','Przywróć i uruchom ponownie','Ponowne uruchamianie…'],
};

export default function SettingsPage(){
  const { i18n, t } = useTranslation();
  const clockStyle=useClockStyle();
  const addToast=useToastStore(s=>s.addToast);
  const [theme,setTheme] = useState<ThemeChoice>(() => (localStorage.getItem('cararchiver-theme') as ThemeChoice) || 'navy');
  const [fontSize,setFontSize] = useState(() => Number(localStorage.getItem('cararchiver-font-size') || 14));
  const [uiScale,setUiScale] = useState(() => Math.max(50, Math.min(150, Number(localStorage.getItem('cararchiver-ui-scale') || 100) || 100)));
  const [iconSize,setIconSize] = useState(() => Number(localStorage.getItem('cararchiver-icon-size') || 20));
  const [fontFamily,setFontFamily] = useState(() => localStorage.getItem('cararchiver-font-family') || 'system');
  const [dataPath,setDataPath] = useState('');
  const [backupBusy,setBackupBusy] = useState(false);
  const [backupStatus,setBackupStatus] = useState('');
  const [restoreBusy,setRestoreBusy] = useState(false);
  const [restoreStatus,setRestoreStatus] = useState('');
  const [restoreFolder,setRestoreFolder] = useState<string | null>(null);
  const [restoreRestarting,setRestoreRestarting] = useState(false);
  const [restoreNeedsManualRestart,setRestoreNeedsManualRestart] = useState(false);
  const [exportBusy,setExportBusy] = useState(false);
  const [exportStatus,setExportStatus] = useState('');
  const [section,setSection] = useState<'appearance'|'language'|'storage'|'trash'|'feedback'|'about'>('appearance');
  useEffect(()=>{void window.electron.ipcRenderer.invoke('get-config').then(cfg=>setDataPath(cfg?.savePath || '—'));},[]);
  useEffect(() => {
    document.documentElement.style.setProperty('--user-font-size', `${fontSize}px`);
    document.documentElement.style.setProperty('--user-font-factor', String(fontSize / 14));
    document.documentElement.style.setProperty('--user-ui-scale', String(uiScale / 100));
    document.documentElement.style.setProperty('--user-icon-factor', String(iconSize / 20));
    document.documentElement.style.setProperty('--user-icon-size', `${iconSize}px`);
    applyFont(fontFamily);
    localStorage.setItem('cararchiver-font-size', String(fontSize));
    localStorage.setItem('cararchiver-ui-scale', String(uiScale));
    localStorage.setItem('cararchiver-icon-size', String(iconSize));
    localStorage.setItem('cararchiver-font-family', fontFamily);
  },[fontSize,iconSize,fontFamily,uiScale]);
  const backup = async () => {
    setBackupBusy(true);
    setBackupStatus('');
    try {
      const result = await window.electron.ipcRenderer.invoke('backup-data');
      if (result.success) setBackupStatus(`${t('settingsBackupSuccess', 'Backup saved')}: ${result.location}`);
      else if (!result.canceled) setBackupStatus(result.message || t('settingsBackupFailure', 'Backup failed'));
    } catch (error) {
      setBackupStatus(error instanceof Error ? error.message : t('settingsBackupFailure', 'Backup failed'));
    } finally { setBackupBusy(false); }
  };
  const restore = async () => {
    setRestoreBusy(true); setRestoreStatus('');
    try {
      const result = await window.electron.ipcRenderer.invoke('restore-data');
      if (result.success && result.folder) setRestoreFolder(result.folder);
      else if (!result.canceled) setRestoreStatus(result.message || t('settingsBackupFailure', 'Backup validation failed.'));
    } catch(error) {setRestoreStatus(error instanceof Error ? error.message : t('settingsBackupFailure'));}
    finally {setRestoreBusy(false);}
  };
  const cancelRestore = () => {
    setRestoreFolder(null);
    void window.electron.ipcRenderer.invoke('cancel-restore-data');
  };
  const confirmRestore = async () => {
    setRestoreBusy(true); setRestoreStatus('');
    try {
      const result = await window.electron.ipcRenderer.invoke('confirm-restore-data');
      if (result.success) {setRestoreFolder(null);setRestoreRestarting(true);setRestoreNeedsManualRestart(!result.restarting);}
      else {setRestoreFolder(null);setRestoreStatus(result.message || t('settingsBackupFailure'));}
    } catch(error) {setRestoreFolder(null);setRestoreStatus(error instanceof Error?error.message:t('settingsBackupFailure'));}
    finally {setRestoreBusy(false);}
  };
  const exportCsv = async () => {
    setExportBusy(true);
    setExportStatus('');
    try {
      const result = await window.electron.ipcRenderer.invoke('export-data-csv');
      if (result.success) setExportStatus(`${t('settingsExportSuccess')}: ${result.location}`);
      else if (!result.canceled) setExportStatus(result.message || t('settingsBackupFailure'));
    } catch (error) { setExportStatus(error instanceof Error ? error.message : t('settingsBackupFailure')); }
    finally { setExportBusy(false); }
  };
  const changeTheme=(next:ThemeChoice)=>{setTheme(next);document.documentElement.setAttribute('data-theme',next);localStorage.setItem('cararchiver-theme',next);void window.electron.ipcRenderer.invoke('set-window-theme',next).catch(console.error);};
  const changeLanguage=(next:string)=>{void i18n.changeLanguage(next);localStorage.setItem('cararchiver-language',next);void window.electron.ipcRenderer.invoke('set-startup-language',next).catch(console.error);};
  return <div className={styles.page}>
    <h2>{t('settingsTitle')}</h2>
    <div className={styles.layout}>
      <nav className={styles.nav}>
        {([['appearance','settingsAppearance'],['language','settingsLanguage'],['storage','settingsStorage'],['trash','settingsTrash'],['feedback','settingsFeedback'],['about','settingsAbout']] as const).map(([key,label])=><button className={section===key?styles.active:''} key={key} onClick={()=>setSection(key)}>{key==='trash' ? ({tr:'Çöp Kutusu',en:'Trash',es:'Papelera',fr:'Corbeille',de:'Papierkorb',pt:'Lixeira',zh:'回收站',ja:'ゴミ箱',ko:'휴지통',ru:'Корзина',nl:'Prullenbak',az:'Zibil qutusu',it:'Cestino',pl:'Kosz'} as Record<string,string>)[i18n.language.split('-')[0]] ?? 'Trash' : t(label)}</button>)}
      </nav>
      <div className={styles.content}>
        {section==='appearance'&&<><h3>{t('settingsTheme')}</h3><div className={styles.themeGrid}>{themes.map(item=><button key={item.id} className={`${styles.themeChoice} ${theme===item.id?styles.selected:''}`} onClick={()=>changeTheme(item.id)}><div className={styles.preview} style={{background:item.background}}><div/><span/><span/></div><strong>{t(('settingsTheme'+item.id.charAt(0).toUpperCase()+item.id.slice(1)) as 'settingsThemeNavy')}</strong><small>{t(item.description)}</small></button>)}</div>
        <h3 style={{marginTop:24}}>{t('settingInterface')}</h3>
        <div className={styles.controlGrid}>
          <label>{t('settingUiScale', 'Genel arayüz ölçeği')} · {uiScale}%<input type="range" min="50" max="150" step="5" value={uiScale} onChange={e=>setUiScale(Number(e.target.value))}/></label>
          <label>{t('settingFontSize')} · {fontSize}px<input type="range" min="12" max="19" step="1" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))}/></label>
          <label>{t('settingIconSize')} · {iconSize}px<input type="range" min="16" max="28" step="1" value={iconSize} onChange={e=>setIconSize(Number(e.target.value))}/></label>
          <label>{t('settingFontFamily')}<select value={fontFamily} onChange={e=>setFontFamily(e.target.value)}><option value="system">System UI</option><option value="segoe">Segoe UI</option><option value="inter">Inter</option><option value="arial">Arial</option><option value="verdana">Verdana</option><option value="trebuchet">Trebuchet MS</option><option value="georgia">Georgia</option></select></label>
        </div>
        <div className={styles.livePreview}><small>{t('settingLivePreview')}</small><div style={{fontFamily:fontStacks[fontFamily] ?? fontStacks.system,fontSize:fontSize*uiScale/100,display:'flex',alignItems:'center',gap:12,minHeight:44*uiScale/100}}><span style={{fontSize:iconSize*uiScale/100,marginRight:10}}>🚘</span>{t('carProfileTitle')} · 34 AB 438</div></div>
        <SettingsExtras locale={i18n.language} clockStyle={clockStyle} onClockChange={(style:ClockStyle)=>setClockStyle(style)}/>
        <button type="button" onClick={()=>{setFontSize(14);setIconSize(20);setUiScale(100);setFontFamily('system');setClockStyle('classic')}}>{t('settingReset')}</button>
        </>}
        {section==='language'&&<><h3>{t('settingsLanguage')}</h3><label htmlFor="app-language">{t('settingsChooseLanguage')}</label><select id="app-language" value={i18n.language} onChange={e=>changeLanguage(e.target.value)}>{Object.entries(languageNames).map(([key,name])=><option key={key} value={key}>{name}</option>)}</select></>}
        {section==='storage'&&<><div className={styles.storageSection}><h3>{t("settingsDataLocation")}</h3><p>{t('settingsDataInfo')}</p><div className={styles.path}>{dataPath}</div><p>{t('settingsDataWarning')}</p></div><div className={styles.storageSection}>
          <h3>{t('settingsBackupTitle', 'Backup local data')}</h3>
          <p>{t('settingsBackupDescription', 'Save your SQLite database and media files together to a folder you choose. Keep the backup on another drive.')}</p>
          <button type="button" disabled={backupBusy} onClick={()=>void backup()}>{backupBusy ? t('settingsBackupWorking', 'Backing up…') : t('settingsBackupAction', 'Create backup')}</button>
          {backupStatus && <p role="status">{backupStatus}</p>}
          <div className={styles.restoreArea}>
            <h3>{restoreLabels[i18n.language.split('-')[0]]?.[0]??restoreLabels.en[0]}</h3>
            <p>{restoreLabels[i18n.language.split('-')[0]]?.[1]??restoreLabels.en[1]}</p>
            <button type="button" disabled={restoreBusy||backupBusy} onClick={()=>void restore()}>{restoreBusy?(restoreLabels[i18n.language.split('-')[0]]?.[3]??restoreLabels.en[3]):(restoreLabels[i18n.language.split('-')[0]]?.[2]??restoreLabels.en[2])}</button>
            {restoreStatus&&<p role="alert">{restoreStatus}</p>}
          </div></div><div className={styles.storageSection}>
          <h3>{t('settingsExportTitle')}</h3>
          <p>{t('settingsExportDescription')}</p>
          <button type="button" disabled={exportBusy} onClick={()=>void exportCsv()}>{t('settingsExportAction')}</button>
          {exportStatus && <p role="status">{exportStatus}</p>}</div>
        </>}
        {section==='trash'&&<TrashPanel locale={i18n.language}/>}
        {section==='feedback'&&<FeedbackPanel locale={i18n.language} onNotify={addToast}/> }
        {section==='about'&&<LegalAbout locale={i18n.language}/>}
      </div>
    </div>
    {restoreFolder && <div className={styles.modalShade} role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)cancelRestore()}}>
      <div className={styles.restoreDialog} role="dialog" aria-modal="true" aria-labelledby="restore-confirm-title">
        <h3 id="restore-confirm-title">{(confirmLabels[i18n.language.split('-')[0]]??confirmLabels.en)[0]}</h3>
        <p>{(confirmLabels[i18n.language.split('-')[0]]??confirmLabels.en)[1]}</p>
        <div className={styles.restoreFolder}>{restoreFolder}</div>
        <div className={styles.dialogActions}>
          <button type="button" onClick={cancelRestore} disabled={restoreBusy}>{(confirmLabels[i18n.language.split('-')[0]]??confirmLabels.en)[2]}</button>
          <button type="button" className={styles.primaryAction} onClick={()=>void confirmRestore()} disabled={restoreBusy}>{(confirmLabels[i18n.language.split('-')[0]]??confirmLabels.en)[3]}</button>
        </div>
      </div>
    </div>}
    {restoreRestarting && <div role="status" aria-live="polite" className={styles.modalShade}><div className={styles.restoreDialog}><h3>{restoreNeedsManualRestart ? (i18n.language==='tr'?'Geliştirme modunda geri yükleme hazırlandı. Uygulamayı kapatıp npm run dev komutuyla yeniden başlatın.':'Restore is queued in development mode. Close the app and restart with npm run dev.') : (confirmLabels[i18n.language.split('-')[0]]??confirmLabels.en)[4]}</h3></div></div>}
  </div>;
}
