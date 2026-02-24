import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const BodyTypes = sqliteTable("BodyTypes", {
  bodyTypeId: integer("bodyTypeId").primaryKey({ autoIncrement: true }),
  bodyTypeName: text("bodyTypeName").notNull().unique()
});
