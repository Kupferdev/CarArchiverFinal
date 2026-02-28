import { getDb } from "../../db";


export function createCustomerPhoneNumbersTable() {

    const db = getDb();

    const createPhoneNumbersTableSql = `
    CREATE TABLE IF NOT EXISTS PhoneNumbers(
        phoneNumberId INTEGER PRIMARY KEY AUTOINCREMENT,
        customerId  INTEGER NOT NULL,
        countryCode TEXT NOT NULL,
        phoneNumber TEXT NOT NULL
        );
`;

    try {
        db.exec(createPhoneNumbersTableSql);
        console.log("❇️ PhoneNumbers table created!");
    } catch (err) {
        console.log("🆘PhoneNumber table not created", (err as Error).message);
    }
}