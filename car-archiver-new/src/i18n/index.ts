import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DashboardInfoTexts } from './dashboardTexts'; // Bir önceki adımda oluşturduğumuz dosya
// import { SetupInfoTexts } from './setupWizard'; // İstersen setup çevirilerini de buraya dahil edebilirsin

// Çeviri verilerimizi i18next'in istediği formata (resources) dönüştürüyoruz
const resources: any = {};

DashboardInfoTexts.forEach((langData) => {
  // languageCode ve id'yi ayır, geri kalan her şeyi çeviri metni olarak al
  const { languageCode, id, ...translations } = langData;
  
  resources[languageCode] = {
    translation: {
      ...translations
    }
  };
});

i18n
  .use(initReactI18next)
  .init({
    resources, // Dönüştürdüğümüz veriyi buraya veriyoruz
    lng: 'tr', // Varsayılan başlangıç dili
    fallbackLng: 'en', // Çeviri bulunamazsa kullanılacak dil
    interpolation: {
      escapeValue: false // React için gerekli ayar
    }
  });

export default i18n;