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
        console.log("⏳ Starting table creation process...");

        await createCustomersTable();
        await createBrandsTable();
        await createFuelTypesTable();
        await createBodyTypesTable();

        await createCarsTable();

        await createFuelTypesTranslationsTable();
        await createBodyTypesTranslationsTable();

        await createCustomerPhoneNumbersTable();
        await createCustomerEmailsTable();

        await createServicesTable();
        await createPartsTable();

        console.log("❇️ All database tables created successfully.");
    } catch (error: any) {
        console.error("🆘 Setup aborted:", error.message);
        throw error;
    }
}