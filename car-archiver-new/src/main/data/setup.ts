import { createBodyTypesTable } from "./migrations/bodyType/createBodyTypeDb";
import { createBrandsTable } from "./migrations/brand/createBrandDb";
import { createCarsTable } from "./migrations/car/createCarDb";
import { createCustomersTable } from "./migrations/customer/createCustomerDb";
import { createFuelTypesTable } from "./migrations/fuelType/createFuelTypeDb";
import { createPartsTable } from "./migrations/part/createPartDb";
import { createServicesTable } from "./migrations/service/createServiceDb";

export async function CreateDefaultDbTables(){

    await createBodyTypesTable();
    await createBrandsTable();
    await createCarsTable();
    await createCustomersTable();
    await createFuelTypesTable();
    await createPartsTable();
    await createServicesTable();
}
