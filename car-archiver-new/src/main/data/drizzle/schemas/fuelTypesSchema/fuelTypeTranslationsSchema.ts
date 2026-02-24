import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { FuelTypes } from "./fuelTypeSchema";


export const fuelTypeTranslations = sqliteTable("FuelTypeTranslations", {
  translationId: integer("translationId").primaryKey({ autoIncrement: true }),
  fuelTypeId: integer("fuelTypeId").references(() => FuelTypes.fuelTypeId),
  languageCode: text("languageCode").notNull(),
  translatedName: text("translatedName").notNull(),
});
