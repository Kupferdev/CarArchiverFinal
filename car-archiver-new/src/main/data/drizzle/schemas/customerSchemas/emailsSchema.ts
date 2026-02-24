import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const Emails = sqliteTable("Emails", {
  emailId: integer("emailId").primaryKey({ autoIncrement: true }),
  customerId: integer("customerId").notNull(),
  customerEmail: text("customerEmail").notNull(),
});
