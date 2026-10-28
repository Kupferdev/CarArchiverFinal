# v16 — Customer address and Service advisor notes

- Added nullable `Customers.address` and `Services.advisorNotes` fields through schema migration v9.
- Added fields to shared types, IPC payload validators, customer persistence, and service persistence.
- Customer create/edit and profile now handle address.
- Service create/edit and profile now handle advisor notes as free text.
- Expanded DB migration test to assert both columns and nullable semantics.
- Existing user data and financial rules are unchanged.

## Important
Back up `data_carArchiver.sqlite` before running the new migration. On a development machine with dependencies installed, run `npm run verify` to validate.
