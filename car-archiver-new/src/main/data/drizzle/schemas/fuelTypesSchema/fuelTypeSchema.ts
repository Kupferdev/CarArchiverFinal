import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const FuelTypes = sqliteTable("FuelTypes", {
  fuelTypeId: integer("fuelTypeId").primaryKey({ autoIncrement: true }),
  fuelTypeName: text("fuelTypeName").notNull().unique()
});