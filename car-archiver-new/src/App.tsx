import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css'

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
    const initSavedLanguage = async () => {
      // Eğer ilk açılış değilse, yani config.json halihazırda varsa
      if (isFirstRun === false) {
        try {
          // DÜZELTME 1: "Electron" yerine "electron" (Küçük harf)
          const config = await (window as any).electron.ipcRenderer.invoke('get-config'); 
          
          if (config) {
            // DÜZELTME 2: İster languageCode ister language diye kaydetmiş ol, ikisini de yakalar
            const savedLang = config.languageCode || config.language;
            if (savedLang) {
              await i18n.changeLanguage(savedLang);
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
      {isFirstRun ? <SetupWizard /> : <HomePage />}
      <ToastContainer />
    </>
  );
}

export default App;