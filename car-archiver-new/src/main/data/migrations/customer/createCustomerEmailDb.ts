import db from "../../db";

export function createCustomerEmailsTable() {

    const createCustomerEmailTableSql = `
    CREATE TABLE IF NOT EXISTS Emails (
        emailId INTEGER PRIMARY KEY AUTOINCREMENT,
        customerId INTEGER NOT NULL,
        customerEmail TEXT NOT NULL
    )
`;

    try {
        db.exec(createCustomerEmailTableSql);
        console.log("❇️ Email table created");
    } catch (err) {
        console.log("🆘Email table not created", (err as Error).message);
    }
}