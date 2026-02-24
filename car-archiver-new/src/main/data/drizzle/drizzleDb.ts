import db from "../db";
import { drizzle } from "drizzle-orm/better-sqlite3";

export const drizzleDb = drizzle(db);

