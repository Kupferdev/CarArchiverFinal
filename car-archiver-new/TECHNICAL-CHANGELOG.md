# Service write integrity maintenance

- Service and parts creation, update and deletion use a single synchronous `better-sqlite3`-backed Drizzle transaction per operation.
- During update, existing part IDs are updated in place. Only removed part IDs are deleted. New parts are inserted. Incoming IDs from another service and duplicate IDs are rejected.
- A failed insert/update/delete rolls back the entire transaction, including the parent service update.
- Service delete uses the database `ON DELETE CASCADE` for parts, not a separate first deletion.
- The service form and IPC DTO pass existing part IDs to the write layer.
- Extracted an accessible, reusable labelled `FormField` component.
- Added `npm run test:service-atomicity` to verification scripts. This script checks source invariants only; it does not substitute for a live SQLite integration test.
- No currency changes and no migrations. Historical car-user JSON is intentionally retained: introducing an owner-history relational table would be a separate feature and migration.

## Validate locally

1. Back up your SQLite database and use a disposable test database.
2. `npm ci` then `npm run verify`.
3. Test service add with multiple parts, editing one part without changing its ID, deleting a single part, adding a part, and deleting the service (parts should cascade).
4. Test a forced part insert validation/constraint failure and confirm service details and existing parts stay unchanged.

This environment could run smoke and static consistency tests but not dependency-backed TypeScript/SQLite integration tests.
