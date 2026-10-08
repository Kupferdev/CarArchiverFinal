import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { Customers } from "./customerSchemas/customersSchema";
import { Brands } from "./brandsSchema";

export const Cars = sqliteTable("Cars", {
  carId: integer("carId").primaryKey({ autoIncrement: true }),

  customerId: integer("customerId")
    .references(() => Customers.customerId, { onDelete: "set null" }),

  oldCustomerId: text("oldCustomerId", { mode: "json" })
    .$type<string[]>()
    .default([]),

  brandId: integer("brandId")
    .references(() => Brands.brandId, { onDelete: "set null" }),

  model: text("model"),
  year: integer("year"),
  vinNumber: text("vinNumber"),
  plateNumber: text("plateNumber"),
  km: real("km"),
  fuelType: integer("fuelType"),
  bodyType: integer("bodyType"),
  engineVolumeCc: integer("engineVolumeCc"),
  notes: text("notes"),
});
