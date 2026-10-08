import { getDb } from "../../db";


export function createCustomerEmailsTable() {

    const db = getDb();

    const createCustomerEmailTableSql = `
    CREATE TABLE IF NOT EXISTS Emails (
        emailId INTEGER PRIMARY KEY AUTOINCREMENT,
        customerId INTEGER NOT NULL,
        customerEmail TEXT NOT NULL,
        FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE CASCADE
    )
`;

    try {
        db.exec(createCustomerEmailTableSql);
        console.log("❇️ Email table created");
    } catch (err) {
        console.log("🆘Email table not created", (err as Error).message);
        throw err;
    }
}