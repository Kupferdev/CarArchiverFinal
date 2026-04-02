import { createBodyTypesTable } from "./migrations/bodyType/createBodyTypeDb";
import { createBrandsTable } from "./migrations/brand/createBrandDb";
import { createCarsTable } from "./migrations/car/createCarDb";
import { createCustomersTable } from "./migrations/customer/createCustomerDb";
import { createFuelTypesTable } from "./migrations/fuelType/createFuelTypeDb";
import { createPartsTable } from "./migrations/part/createPartDb";
import { createServicesTable } from "./migrations/service/createServiceDb";
import { createCustomerPhoneNumbersTable } from "./migrations/customer/createCustomerPhoneNumberDb";
import { createCustomerEmailsTable } from "./migrations/customer/createCustomerEmailDb";
import { createFuelTypesTranslationsTable } from "../data/translations/fuelTypeTranslationsDb";
import { createBodyTypesTranslationsTable } from "../data/translations/bodyTypeTranslationsDb";



export async function CreateDefaultDbTables() {
    try {
        console.log("⏳ Starting table creation process in hierarchical order...");

        // --- LEVEL 1: Independent Tables (Kökler) ---
        // Bunlar kimseye muhtaç değil, önce bunları kuralım.
        createCustomersTable();
        createBrandsTable();
        createFuelTypesTable();
        createBodyTypesTable();

        // --- LEVEL 2: Intermediate Tables (Gövde) ---
        // Cars tablosu Brands ve Customers'a ihtiyaç duyar.
        createCarsTable();

        //Translations
        createFuelTypesTranslationsTable();
        createBodyTypesTranslationsTable();

        // Müşteriye bağlı iletişim bilgileri
        createCustomerPhoneNumbersTable();
        createCustomerEmailsTable();

        // --- LEVEL 3: Dependent Tables (Dallar) ---
        // Services arabaya, Parts ise hem arabaya hem servise bağlıdır.
        await createServicesTable();
        await createPartsTable();

        console.log("❇️ All database tables verified and linked successfully.");
    } catch (error: any) {
        console.error("🆘 Setup aborted! Dependency order error:", error.message);
        throw error;
    }
}