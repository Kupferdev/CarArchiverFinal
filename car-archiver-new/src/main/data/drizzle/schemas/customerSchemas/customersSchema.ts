import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const Customers = sqliteTable("Customers", {
  customerId: integer("customerId").primaryKey({ autoIncrement: true }),
  nationalId: text("nationalId"),
  firstName: text("firstName").notNull(),
  lastName: text("lastName"),
  taxNumber: text("taxNumber"),
});
