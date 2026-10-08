import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { Customers } from "./customersSchema";

export const PhoneNumbers = sqliteTable("PhoneNumbers", {
  phoneNumberId: integer("phoneNumberId").primaryKey({ autoIncrement: true }),
  customerId: integer("customerId")
    .notNull()
    .references(() => Customers.customerId, { onDelete: "cascade" }),
  countryCode: text("countryCode").notNull(),
  phoneNumber: text("phoneNumber").notNull(),
});
