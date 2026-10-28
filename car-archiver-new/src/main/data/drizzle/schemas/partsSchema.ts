import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { Services } from "./servicesSchema";
import { Cars } from "./carsSchema";

export const Parts = sqliteTable("Parts", {
  partId: integer("partId").primaryKey({ autoIncrement: true }),
  carId: integer("carId").notNull().references(() => Cars.carId, { onDelete: "cascade" }),
  serviceId: integer("serviceId").notNull().references(() => Services.serviceId, { onDelete: "cascade" }),
  partName: text("partName").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPriceKurus: integer("unitPriceKurus").notNull().default(0),
});
