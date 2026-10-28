import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css'
import {applyFont} from './utils/fontPreferences';

import { SetupWizard } from './setup/SetupWizard';
import './setup/setup.css'; 
import HomePage from './components/dashboard/HomePage';
import { useInitialConfig } from './hooks/useInitialConfig';

// Kendi yazdığımız ToastContainer bileşenini içeri alıyoruz
import ToastContainer from './components/ui/ToastContainer';

function App() {
  const { isFirstRun } = useInitialConfig();
  const { i18n } = useTranslation();
  const [isLangReady, setIsLangReady] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('cararchiver-theme') || 'navy') as 'navy'|'dark'|'light'|'dim';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.style.setProperty('--user-font-size', `${localStorage.getItem('cararchiver-font-size') || 14}px`);
    document.documentElement.style.setProperty('--user-icon-size', `${localStorage.getItem('cararchiver-icon-size') || 20}px`);
    document.documentElement.style.setProperty('--user-font-factor', String(Number(localStorage.getItem('cararchiver-font-size') || 14) / 14));
    document.documentElement.style.setProperty('--user-ui-scale', String(Math.max(50, Math.min(150, Number(localStorage.getItem('cararchiver-ui-scale') || 100) || 100)) / 100));
    document.documentElement.style.setProperty('--user-icon-factor', String(Number(localStorage.getItem('cararchiver-icon-size') || 20) / 20));
    const selectedFont = localStorage.getItem('cararchiver-font-family');
    applyFont(selectedFont || 'system');
    if (navigator.userAgent.includes('Windows')) document.documentElement.classList.add('windows-overlay');
    void window.electron.ipcRenderer.invoke('set-window-theme', savedTheme).catch(console.error);
  }, []);

  useEffect(() => {
    const initSavedLanguage = async () => {
      // Eğer ilk açılış değilse, yani config.json halihazırda varsa
      if (isFirstRun === false) {
        try {
          // DÜZELTME 1: "Electron" yerine "electron" (Küçük harf)
          const config = await window.electron.ipcRenderer.invoke('get-config'); 
          
          if (config) {
            // DÜZELTME 2: İster languageCode ister language diye kaydetmiş ol, ikisini de yakalar
            const savedLang = localStorage.getItem('cararchiver-language') || config.language;
            if (savedLang) {
              await i18n.changeLanguage(savedLang);
              // Sync legacy installations: the original config language may differ
              // from the effective language stored in renderer localStorage.
              void window.electron.ipcRenderer.invoke('set-startup-language',savedLang).catch(console.error);
            }
          }
        } catch (error) {
          console.error('Kayıtlı dil yüklenirken hata oluştu:', error);
        }
      }
      // İlk açılışsa veya dil yükleme işlemi bittiyse uygulamayı hazır hale getir
      setIsLangReady(true);
    };

    if (isFirstRun !== null) {
      initSavedLanguage();
    }
  }, [isFirstRun, i18n]);

  // Konfigürasyon veya dil ayarı henüz yüklenmediyse ekrana bir şey basma
  if (isFirstRun === null || !isLangReady) return null;

  // Ana sayfayı veya kurulum ekranını render ederken altına ToastContainer'ı da ekliyoruz
  // React Fragment (<> ... </>) kullanarak iki bileşeni tek bir çatı altında topluyoruz
  return (
    <>
      <div className="windowChrome" aria-hidden="true" />
      {isFirstRun ? <SetupWizard /> : <HomePage />}
      <ToastContainer />
    </>
  );
}

export default App;