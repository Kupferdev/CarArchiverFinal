import { drizzle } from "drizzle-orm/singlestore";
import { drizzleDb } from "../drizzle/drizzleDb";
import { FuelTypes } from "../drizzle/schemas/fuelTypesSchema/fuelTypeSchema";
import { fuelTypeTranslations } from "../drizzle/schemas/fuelTypesSchema/fuelTypeTranslationsSchema";

import { getDb } from "../db";


export interface FuelTypeTranslations {
    fuelTypeId: number,
    languageCode: string,
    translatedName: string
}

const baseFuelTypeTranslations: Array<FuelTypeTranslations> = [
    // Benzin (Gasoline/Petrol) (fuelTypeId: 1)
    { fuelTypeId: 1, languageCode: "en", translatedName: "Gasoline" },
    { fuelTypeId: 1, languageCode: "es", translatedName: "Gasolina" },
    { fuelTypeId: 1, languageCode: "fr", translatedName: "Essence" },
    { fuelTypeId: 1, languageCode: "de", translatedName: "Benzin" },
    { fuelTypeId: 1, languageCode: "pt", translatedName: "Gasolina" },
    { fuelTypeId: 1, languageCode: "zh", translatedName: "汽油" },
    { fuelTypeId: 1, languageCode: "ja", translatedName: "ガソリン" },
    { fuelTypeId: 1, languageCode: "tr", translatedName: "Benzin" },
    { fuelTypeId: 1, languageCode: "ko", translatedName: "휘발유" },
    { fuelTypeId: 1, languageCode: "ru", translatedName: "Бензин" },
    { fuelTypeId: 1, languageCode: "nl", translatedName: "Benzine" },
    { fuelTypeId: 1, languageCode: "az", translatedName: "Benzin" },
    { fuelTypeId: 1, languageCode: "it", translatedName: "Benzina" },
    { fuelTypeId: 1, languageCode: "pl", translatedName: "Benzyna" },

    // Dizel (Diesel) (fuelTypeId: 2)
    { fuelTypeId: 2, languageCode: "en", translatedName: "Diesel" },
    { fuelTypeId: 2, languageCode: "es", translatedName: "Diésel" },
    { fuelTypeId: 2, languageCode: "fr", translatedName: "Diesel" },
    { fuelTypeId: 2, languageCode: "de", translatedName: "Diesel" },
    { fuelTypeId: 2, languageCode: "pt", translatedName: "Diesel" },
    { fuelTypeId: 2, languageCode: "zh", translatedName: "柴油" },
    { fuelTypeId: 2, languageCode: "ja", translatedName: "ディーゼル" },
    { fuelTypeId: 2, languageCode: "tr", translatedName: "Dizel" },
    { fuelTypeId: 2, languageCode: "ko", translatedName: "디젤" },
    { fuelTypeId: 2, languageCode: "ru", translatedName: "Дизель" },
    { fuelTypeId: 2, languageCode: "nl", translatedName: "Diesel" },
    { fuelTypeId: 2, languageCode: "az", translatedName: "Dizel" },
    { fuelTypeId: 2, languageCode: "it", translatedName: "Diesel" },
    { fuelTypeId: 2, languageCode: "pl", translatedName: "Diesel" },

    // LPG (fuelTypeId: 3)
    { fuelTypeId: 3, languageCode: "en", translatedName: "LPG" },
    { fuelTypeId: 3, languageCode: "es", translatedName: "GLP" }, // Gas Licuado de Petróleo
    { fuelTypeId: 3, languageCode: "fr", translatedName: "GPL" }, // Gaz de Pétrole Liquéfié
    { fuelTypeId: 3, languageCode: "de", translatedName: "Autogas (LPG)" },
    { fuelTypeId: 3, languageCode: "pt", translatedName: "GPL" }, // Gás Liquefeito de Petróleo
    { fuelTypeId: 3, languageCode: "zh", translatedName: "液化石油气" },
    { fuelTypeId: 3, languageCode: "ja", translatedName: "LPG" },
    { fuelTypeId: 3, languageCode: "tr", translatedName: "LPG" },
    { fuelTypeId: 3, languageCode: "ko", translatedName: "LPG" },
    { fuelTypeId: 3, languageCode: "ru", translatedName: "СНГ" }, // Сжиженный нефтяной газ
    { fuelTypeId: 3, languageCode: "nl", translatedName: "LPG" },
    { fuelTypeId: 3, languageCode: "az", translatedName: "LPG" },
    { fuelTypeId: 3, languageCode: "it", translatedName: "GPL" }, // Gas di Petrolio Liquefatti
    { fuelTypeId: 3, languageCode: "pl", translatedName: "LPG" },

    // Elektrik (Electric) (fuelTypeId: 4)
    { fuelTypeId: 4, languageCode: "en", translatedName: "Electric" },
    { fuelTypeId: 4, languageCode: "es", translatedName: "Eléctrico" },
    { fuelTypeId: 4, languageCode: "fr", translatedName: "Électrique" },
    { fuelTypeId: 4, languageCode: "de", translatedName: "Elektro" },
    { fuelTypeId: 4, languageCode: "pt", translatedName: "Elétrico" },
    { fuelTypeId: 4, languageCode: "zh", translatedName: "电动" },
    { fuelTypeId: 4, languageCode: "ja", translatedName: "電気" },
    { fuelTypeId: 4, languageCode: "tr", translatedName: "Elektrik" },
    { fuelTypeId: 4, languageCode: "ko", translatedName: "전기" },
    { fuelTypeId: 4, languageCode: "ru", translatedName: "Электро" },
    { fuelTypeId: 4, languageCode: "nl", translatedName: "Elektrisch" },
    { fuelTypeId: 4, languageCode: "az", translatedName: "Elektrik" },
    { fuelTypeId: 4, languageCode: "it", translatedName: "Elettrica" },
    { fuelTypeId: 4, languageCode: "pl", translatedName: "Elektryczny" },

    // Hibrit (Hybrid) (fuelTypeId: 5)
    { fuelTypeId: 5, languageCode: "en", translatedName: "Hybrid" },
    { fuelTypeId: 5, languageCode: "es", translatedName: "Híbrido" },
    { fuelTypeId: 5, languageCode: "fr", translatedName: "Hybride" },
    { fuelTypeId: 5, languageCode: "de", translatedName: "Hybrid" },
    { fuelTypeId: 5, languageCode: "pt", translatedName: "Híbrido" },
    { fuelTypeId: 5, languageCode: "zh", translatedName: "混合动力" },
    { fuelTypeId: 5, languageCode: "ja", translatedName: "ハイブリッド" },
    { fuelTypeId: 5, languageCode: "tr", translatedName: "Hibrit" },
    { fuelTypeId: 5, languageCode: "ko", translatedName: "하이브리드" },
    { fuelTypeId: 5, languageCode: "ru", translatedName: "Гибрид" },
    { fuelTypeId: 5, languageCode: "nl", translatedName: "Hybride" },
    { fuelTypeId: 5, languageCode: "az", translatedName: "Hibrid" },
    { fuelTypeId: 5, languageCode: "it", translatedName: "Ibrida" },
    { fuelTypeId: 5, languageCode: "pl", translatedName: "Hybryda" },
];

const baseFuelTypeTranslationsSql = `
  CREATE TABLE FuelTypeTranslations (
  translationId INTEGER PRIMARY KEY AUTOINCREMENT,
  FuelTypeId INTEGER NOT NULL,
  languageCode TEXT NOT NULL,
  translatedName TEXT NOT NULL,
  FOREIGN KEY (fuelTypeId) REFERENCES FuelTypes(fuelTypeId)
);
`;

export async function createFuelTypesTranslationsTable() {

    const db = getDb();

    try {
        db.exec(baseFuelTypeTranslationsSql);
        console.log("❇️ Translations Base FuelType translations table created");
        try {
            await drizzleDb.insert(fuelTypeTranslations).values(baseFuelTypeTranslations);
            console.log("❇️ Translations Base FuelType insert success");

        } catch (err) {
            console.log("🆘 Translations Base FuelType not insert.", (err as Error).message);

        }

    } catch (err) {
        console.log("🆘 Translations Base FuelType translations table not created | Error: ", (err as Error).message);

    }

}