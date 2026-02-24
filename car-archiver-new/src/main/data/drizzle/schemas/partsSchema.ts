import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const Parts = sqliteTable("Parts", {
  partId: integer("partId").primaryKey({ autoIncrement: true }),
  carId: integer("carId").notNull(),
  serviceId: integer("serviceId").notNull(),
  partName: text("partName").notNull(),
  partTax: real("partTax"),
  partPrice: real("partPrice"),
});
