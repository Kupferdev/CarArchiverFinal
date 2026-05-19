import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css'

import { SetupWizard } from './setup/SetupWizard';
import './setup/setup.css'; 
import HomePage from './components/dashboard/HomePage';
import { useInitialConfig } from './hooks/useInitialConfig';

function App() {
  const { isFirstRun } = useInitialConfig();
  const { i18n } = useTranslation();
  const [isLangReady, setIsLangReady] = useState(false);

  useEffect(() => {
    const initSavedLanguage = async () => {
      // Eğer ilk açılış değilse, yani config.json halihazırda varsa
      if (isFirstRun === false) {
        try {
          // Electron ana sürecinden (main process) config dosyasını çekiyoruz
          // ipcHandlers.ts içindeki konfigürasyon getirme fonksiyonunun adıyla eşleşmeli
          const config = await window.Electron.ipcRenderer.invoke('get-config'); 
          
          if (config && config.languageCode) {
            // i18n dilini config.json'dan gelen kodla (en, tr, es vb.) değiştiriyoruz
            await i18n.changeLanguage(config.languageCode);
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

  return isFirstRun ? <SetupWizard /> : <HomePage />;
}

export default App;