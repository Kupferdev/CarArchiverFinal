import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { BodyTypes } from "./bodyTypeSchema";

export const bodyTypeTranslations = sqliteTable("BodyTypeTranslations", {
  translationId: integer("translationId").primaryKey({ autoIncrement: true }),
  bodyTypeId: integer("bodyTypeId").references(() => BodyTypes.bodyTypeId),
  languageCode: text("languageCode").notNull(),
  translatedName: text("translatedName").notNull(),
});
