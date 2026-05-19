import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const Services = sqliteTable("Services", {
  serviceId: integer("serviceId").primaryKey({ autoIncrement: true }),
  carId: integer("carId").notNull(),
  customerId: integer("customerId"),

  applicationDate: integer("applicationDate", { mode: "timestamp" }),
  appointmentDate: integer("appointmentDate", { mode: "timestamp" }),
  jobDuration: integer("jobDuration", { mode: "timestamp" }),
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

  targetDeliveryDate: integer("target_delivery_date", { mode: "timestamp" }),
  isDelivered: integer("is_delivered", { mode: "boolean" }).default(false),
});
