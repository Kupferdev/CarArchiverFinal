export interface Language {
    id: number,
    languageCode: string,
    languageName:string
}

const languages : Array<Language> = [
  { id: 1,  languageCode: "en", languageName: "English" },
  { id: 2,  languageCode: "es", languageName: "Español" },
  { id: 3,  languageCode: "fr", languageName: "Français" },
  { id: 4,  languageCode: "de", languageName: "Deutsch" },
  { id: 5,  languageCode: "pt", languageName: "Português" },
  { id: 6,  languageCode: "zh", languageName: "中文" },
  { id: 7,  languageCode: "tr", languageName: "Türkçe" },
  { id: 8,  languageCode: "ja", languageName: "日本語" },
  { id: 9,  languageCode: "ko", languageName: "한국어" },
  { id: 10, languageCode: "ru", languageName: "Русский" },
  { id: 11, languageCode: "nl", languageName: "Nederlands" },
  { id: 12, languageCode: "az", languageName: "Azerbaijani" },
  { id: 13, languageCode: "it", languageName: "Italiano" },
  { id: 14, languageCode: "pl", languageName: "Polski" }
]