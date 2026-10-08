import { runDatabaseMigrations } from "./migrations/migrationRunner";

export async function CreateDefaultDbTables() {
  await runDatabaseMigrations();
}
