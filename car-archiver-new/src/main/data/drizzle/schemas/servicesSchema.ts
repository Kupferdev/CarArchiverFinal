import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { Customers } from "./customerSchemas/customersSchema";
import { Cars } from "./carsSchema";

export const Services = sqliteTable("Services", {
  serviceId: integer("serviceId").primaryKey({ autoIncrement: true }),
  carId: integer("carId")
    .notNull()
    .references(() => Cars.carId, { onDelete: "cascade" }),
  customerId: integer("customerId")
    .references(() => Customers.customerId, { onDelete: "set null" }),

  applicationDate: integer("applicationDate", { mode: "timestamp" }),
  appointmentDate: integer("appointmentDate", { mode: "timestamp" }),
  // Job duration in whole MINUTES (a length of time, not a point in time).
  jobDuration: integer("jobDuration"),
  deliveryDate: integer("deliveryDate", { mode: "timestamp" }),

  km: real("km"),
  complaints: text("complaints").notNull(),
  extraRequests: text("extraRequests"),

  faults: text("faults", { mode: 'json' }).$type<string[]>().default([]),

  hasDamageOnReceive: integer("hasDamageOnReceive", { mode: "boolean" }).notNull().default(false),

  damageOnReceive: text("damageOnReceive", { mode: 'json' }).$type<string[]>().default([]),

  hasDamageDuringRepair: integer("hasDamageDuringRepair", { mode: "boolean" }).default(false),
  damageDuringRepair: text("damageDuringRepair", { mode: 'json' }).$type<string[]>().default([]),

  laborCharge: real("laborCharge"),
  totalCharge: real("totalCharge"),

  targetDeliveryDate: integer("targetDeliveryDate", { mode: "timestamp" }),
  isDelivered: integer("isDelivered", { mode: "boolean" }).default(false),
});
