import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { Customers } from "./customersSchema";

export const Emails = sqliteTable("Emails", {
  emailId: integer("emailId").primaryKey({ autoIncrement: true }),
  customerId: integer("customerId")
    .notNull()
    .references(() => Customers.customerId, { onDelete: "cascade" }),
  customerEmail: text("customerEmail").notNull(),
});
