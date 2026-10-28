import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DashboardInfoTexts } from './dashboardTexts';
import { FeatureTexts } from './featureTexts';
import { ExtendedDashboardTexts } from './extendedDashboardTexts';
import { CustomerTexts } from './customerTexts';
import { DialogTexts } from './dialogTexts';
import { CommonTexts } from './commonTexts';
import { SettingsTexts } from './settingsTexts';
import { DetailTexts } from './detailTexts';
import { PrintTexts } from './printTexts';
import { V34Texts } from './v34Texts';
import { V35Texts } from './v35Texts';
// import { SetupInfoTexts } from './setupWizard'; // İstersen setup çevirilerini de buraya dahil edebilirsin

// Çeviri verilerimizi i18next'in istediği formata (resources) dönüştürüyoruz
const resources: Record<string, { translation: Record<string, string> }> = {};

DashboardInfoTexts.forEach((langData) => {
  // languageCode ve id'yi ayır, geri kalan her şeyi çeviri metni olarak al
  const { languageCode, id, ...translations } = langData;
  
  resources[languageCode] = {
    translation: {
      ...translations,
      ...(ExtendedDashboardTexts[languageCode] ?? {}),
      ...(CustomerTexts[languageCode] ?? {}),
      ...(DialogTexts[languageCode] ?? {}),
      ...(CommonTexts[languageCode] ?? {}),
      ...(SettingsTexts[languageCode] ?? {}),
      ...(DetailTexts[languageCode] ?? {}),
      ...(PrintTexts[languageCode] ?? {}),
      ...(FeatureTexts[languageCode] ?? {}),
      ...(V34Texts[languageCode] ?? {}),
      ...(V35Texts[languageCode] ?? {})
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