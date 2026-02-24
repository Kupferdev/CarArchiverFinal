import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const PhoneNumbers = sqliteTable("PhoneNumbers", {
  phoneNumberId: integer("phoneNumberId").primaryKey({ autoIncrement: true }),
  customerId: integer("customerId").notNull(),
  countryCode: text("countryCode").notNull(),
  phoneNumber: text("phoneNumber").notNull(),
});
