import db from "../db";
import { drizzleDb } from "../drizzle/drizzleDb";
import { bodyTypeTranslations } from "../drizzle/schemas/bodyTypesSchema/bodyTypeTranslationsSchemas";

export interface BodyTypeTranslations {
  bodyTypeId: number,
  languageCode: string,
  translatedName: string
}

  const baseBodyTypeTranslationsSql = `
  CREATE TABLE BodyTypeTranslations (
  translationId INTEGER PRIMARY KEY AUTOINCREMENT,
  bodyTypeId INTEGER NOT NULL,
  languageCode TEXT NOT NULL,
  translatedName TEXT NOT NULL,
  FOREIGN KEY (bodyTypeId) REFERENCES BodyTypes(bodyTypeId)
);
`;

const baseBodyTypeTranslations: Array<BodyTypeTranslations> = [
  // Sedan (bodyTypeId: 1)
  { bodyTypeId: 1, languageCode: "en", translatedName: "Sedan" },
  { bodyTypeId: 1, languageCode: "es", translatedName: "Sedán" },
  { bodyTypeId: 1, languageCode: "fr", translatedName: "Berline" },
  { bodyTypeId: 1, languageCode: "de", translatedName: "Limousine" },
  { bodyTypeId: 1, languageCode: "pt", translatedName: "Sedã" },
  { bodyTypeId: 1, languageCode: "zh", translatedName: "轿车" },
  { bodyTypeId: 1, languageCode: "ja", translatedName: "セダン" },
  { bodyTypeId: 1, languageCode: "tr", translatedName: "Sedan" },
  { bodyTypeId: 1, languageCode: "ko", translatedName: "세단" },
  { bodyTypeId: 1, languageCode: "ru", translatedName: "Седан" },
  { bodyTypeId: 1, languageCode: "nl", translatedName: "Sedan" },
  { bodyTypeId: 1, languageCode: "az", translatedName: "Sedan" },
  { bodyTypeId: 1, languageCode: "it", translatedName: "Berlina" },
  { bodyTypeId: 1, languageCode: "pl", translatedName: "Sedan" },

  // Hatchback (bodyTypeId: 2)
  { bodyTypeId: 2, languageCode: "en", translatedName: "Hatchback" },
  { bodyTypeId: 2, languageCode: "es", translatedName: "Hatchback" },
  { bodyTypeId: 2, languageCode: "fr", translatedName: "Hayon" },
  { bodyTypeId: 2, languageCode: "de", translatedName: "Kompaktwagen" },
  { bodyTypeId: 2, languageCode: "pt", translatedName: "Hatch" },
  { bodyTypeId: 2, languageCode: "zh", translatedName: "掀背车" },
  { bodyTypeId: 2, languageCode: "ja", translatedName: "ハッチバック" },
  { bodyTypeId: 2, languageCode: "tr", translatedName: "Hatchback" },
  { bodyTypeId: 2, languageCode: "ko", translatedName: "해치백" },
  { bodyTypeId: 2, languageCode: "ru", translatedName: "Хэтчбек" },
  { bodyTypeId: 2, languageCode: "nl", translatedName: "Hatchback" },
  { bodyTypeId: 2, languageCode: "az", translatedName: "Hatchback" },
  { bodyTypeId: 2, languageCode: "it", translatedName: "Hatchback" },
  { bodyTypeId: 2, languageCode: "pl", translatedName: "Hatchback" },

  // SUV (bodyTypeId: 3)
  { bodyTypeId: 3, languageCode: "en", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "es", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "fr", translatedName: "VUS" },
  { bodyTypeId: 3, languageCode: "de", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "pt", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "zh", translatedName: "越野车" },
  { bodyTypeId: 3, languageCode: "ja", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "tr", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "ko", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "ru", translatedName: "Внедорожник" },
  { bodyTypeId: 3, languageCode: "nl", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "az", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "it", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "pl", translatedName: "SUV" },

  // Coupe (bodyTypeId: 4)
  { bodyTypeId: 4, languageCode: "en", translatedName: "Coupe" },
  { bodyTypeId: 4, languageCode: "es", translatedName: "Cupé" },
  { bodyTypeId: 4, languageCode: "fr", translatedName: "Coupé" },
  { bodyTypeId: 4, languageCode: "de", translatedName: "Coupé" },
  { bodyTypeId: 4, languageCode: "pt", translatedName: "Cupê" },
  { bodyTypeId: 4, languageCode: "zh", translatedName: "双门轿跑车" },
  { bodyTypeId: 4, languageCode: "ja", translatedName: "クーペ" },
  { bodyTypeId: 4, languageCode: "tr", translatedName: "Coupe" },
  { bodyTypeId: 4, languageCode: "ko", translatedName: "쿠페" },
  { bodyTypeId: 4, languageCode: "ru", translatedName: "Купе" },
  { bodyTypeId: 4, languageCode: "nl", translatedName: "Coupé" },
  { bodyTypeId: 4, languageCode: "az", translatedName: "Coupe" },
  { bodyTypeId: 4, languageCode: "it", translatedName: "Coupé" },
  { bodyTypeId: 4, languageCode: "pl", translatedName: "Coupe" },

  // Station Wagon (bodyTypeId: 5)
  { bodyTypeId: 5, languageCode: "en", translatedName: "Station Wagon" },
  { bodyTypeId: 5, languageCode: "es", translatedName: "Familiar" },
  { bodyTypeId: 5, languageCode: "fr", translatedName: "Break" },
  { bodyTypeId: 5, languageCode: "de", translatedName: "Kombi" },
  { bodyTypeId: 5, languageCode: "pt", translatedName: "Perua" },
  { bodyTypeId: 5, languageCode: "zh", translatedName: "旅行车" },
  { bodyTypeId: 5, languageCode: "ja", translatedName: "ステーションワゴン" },
  { bodyTypeId: 5, languageCode: "tr", translatedName: "Station Wagon" },
  { bodyTypeId: 5, languageCode: "ko", translatedName: "스테이션 왜건" },
  { bodyTypeId: 5, languageCode: "ru", translatedName: "Универсал" },
  { bodyTypeId: 5, languageCode: "nl", translatedName: "Stationwagen" },
  { bodyTypeId: 5, languageCode: "az", translatedName: "Universal" },
  { bodyTypeId: 5, languageCode: "it", translatedName: "Familiare" },
  { bodyTypeId: 5, languageCode: "pl", translatedName: "Kombi" },

  // MPV (bodyTypeId: 6)
  { bodyTypeId: 6, languageCode: "en", translatedName: "MPV" },
  { bodyTypeId: 6, languageCode: "es", translatedName: "Monovolumen" },
  { bodyTypeId: 6, languageCode: "fr", translatedName: "Monospace" },
  { bodyTypeId: 6, languageCode: "de", translatedName: "Van" },
  { bodyTypeId: 6, languageCode: "pt", translatedName: "Minivan" },
  { bodyTypeId: 6, languageCode: "zh", translatedName: "多功能车" },
  { bodyTypeId: 6, languageCode: "ja", translatedName: "ミニバン" },
  { bodyTypeId: 6, languageCode: "tr", translatedName: "MPV" },
  { bodyTypeId: 6, languageCode: "ko", translatedName: "미니밴" },
  { bodyTypeId: 6, languageCode: "ru", translatedName: "Минивэн" },
  { bodyTypeId: 6, languageCode: "nl", translatedName: "MPV" },
  { bodyTypeId: 6, languageCode: "az", translatedName: "MPV" },
  { bodyTypeId: 6, languageCode: "it", translatedName: "Monovolume" },
  { bodyTypeId: 6, languageCode: "pl", translatedName: "Minivan" },

  // Crossover (bodyTypeId: 7)
  { bodyTypeId: 7, languageCode: "en", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "es", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "fr", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "de", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "pt", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "zh", translatedName: "跨界车" },
  { bodyTypeId: 7, languageCode: "ja", translatedName: "クロスオーバー" },
  { bodyTypeId: 7, languageCode: "tr", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "ko", translatedName: "크로스오버" },
  { bodyTypeId: 7, languageCode: "ru", translatedName: "Кроссовер" },
  { bodyTypeId: 7, languageCode: "nl", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "az", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "it", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "pl", translatedName: "Crossover" },

  // Pickup (bodyTypeId: 8)
  { bodyTypeId: 8, languageCode: "en", translatedName: "Pickup" },
  { bodyTypeId: 8, languageCode: "es", translatedName: "Camioneta" },
  { bodyTypeId: 8, languageCode: "fr", translatedName: "Pickup" },
  { bodyTypeId: 8, languageCode: "de", translatedName: "Pickup" },
  { bodyTypeId: 8, languageCode: "pt", translatedName: "Caminhonete" },
  { bodyTypeId: 8, languageCode: "zh", translatedName: "皮卡" },
  { bodyTypeId: 8, languageCode: "ja", translatedName: "ピックアップ" },
  { bodyTypeId: 8, languageCode: "tr", translatedName: "Pickup" },
  { bodyTypeId: 8, languageCode: "ko", translatedName: "픽업" },
  { bodyTypeId: 8, languageCode: "ru", translatedName: "Пикап" },
  { bodyTypeId: 8, languageCode: "nl", translatedName: "Pick-up" },
  { bodyTypeId: 8, languageCode: "az", translatedName: "Pickup" },
  { bodyTypeId: 8, languageCode: "it", translatedName: "Pick-up" },
  { bodyTypeId: 8, languageCode: "pl", translatedName: "Pickup" },

  // Convertible (bodyTypeId: 9)
  { bodyTypeId: 9, languageCode: "en", translatedName: "Convertible" },
  { bodyTypeId: 9, languageCode: "es", translatedName: "Descapotable" },
  { bodyTypeId: 9, languageCode: "fr", translatedName: "Cabriolet" },
  { bodyTypeId: 9, languageCode: "de", translatedName: "Cabrio" },
  { bodyTypeId: 9, languageCode: "pt", translatedName: "Conversível" },
  { bodyTypeId: 9, languageCode: "zh", translatedName: "敞篷车" },
  { bodyTypeId: 9, languageCode: "ja", translatedName: "コンバーチブル" },
  { bodyTypeId: 9, languageCode: "tr", translatedName: "Cabrio" },
  { bodyTypeId: 9, languageCode: "ko", translatedName: "컨버터블" },
  { bodyTypeId: 9, languageCode: "ru", translatedName: "Кабриолет" },
  { bodyTypeId: 9, languageCode: "nl", translatedName: "Cabriolet" },
  { bodyTypeId: 9, languageCode: "az", translatedName: "Cabriolet" },
  { bodyTypeId: 9, languageCode: "it", translatedName: "Decappottabile" },
  { bodyTypeId: 9, languageCode: "pl", translatedName: "Kabriolet" },
];

export async function createBodyTypesTranslationsTable() {

  try {
    db.exec(baseBodyTypeTranslationsSql);
    console.log("❇️ Translations Base body translations table created");
    try {
      await drizzleDb.insert(bodyTypeTranslations).values(baseBodyTypeTranslations);
      console.log("❇️ Translations Base body types insert success");

    } catch (err) {
      console.log("🆘 Translations Base body types not insert.", (err as Error).message);
    }

  } catch (err) {
    console.log("🆘 Translations Base body translations table not created | Error: ", (err as Error).message);
  }

}