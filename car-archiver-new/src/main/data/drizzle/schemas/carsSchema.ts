import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const Cars = sqliteTable("Cars", {
  carId: integer("carId").primaryKey({ autoIncrement: true }),
  customerId: integer("customerId"),
  oldCustomerId: text("oldCustomerId", { mode: 'json' }).$type<string[]>().default([]),
  brandId: integer("brandId"),
  modelId: integer("modelId"),
  year: integer("year"),
  vinNumber: text("vinNumber"),
  plateNumber: text("plateNumber"),
  km: real("km"),
  fuelType: integer("fuelType"),
  bodyType: integer("bodyType"),
});
