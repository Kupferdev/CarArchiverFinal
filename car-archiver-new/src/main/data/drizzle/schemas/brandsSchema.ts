import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const Brands = sqliteTable("Brands", {
  brandId: integer("brandId").primaryKey({ autoIncrement: true }),
  brandName: text("brandName").notNull(),
});
