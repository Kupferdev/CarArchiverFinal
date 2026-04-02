import { createCustomerEmailsTable } from "./createCustomerEmailDb";
import { createCustomerPhoneNumbersTable } from "./createCustomerPhoneNumberDb";

import { getDb } from "../../db";

export function createCustomersTable() {

    const db = getDb();

    const createCustomersTableSql = `
    CREATE TABLE IF NOT EXISTS Customers (
        customerId INTEGER PRIMARY KEY AUTOINCREMENT,
        nationalId TEXT NULL,
        firstName  TEXT NOT NULL,
        lastName   TEXT NULL,
        taxNumber  TEXT NULL
    );
`;

    try {
        db.exec(createCustomersTableSql);
        console.log("❇️ Customer table created");
    } catch (err) {
        console.log("🆘Customers table not created", (err as Error).message);
        throw err;
    }


};
