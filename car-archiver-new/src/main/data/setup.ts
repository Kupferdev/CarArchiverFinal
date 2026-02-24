import db from "./db";
import { createBodyTypesTable } from "./migrations/bodyType/createBodyTypeDb";
import { createBrandsTable } from "./migrations/brand/createBrandDb";
import { createCarsTable } from "./migrations/car/createCarDb";
import { createCustomersTable } from "./migrations/customer/createCustomerDb";
import { createFuelTypesTable } from "./migrations/fuelType/createFuelTypeDb";
import { createPartsTable } from "./migrations/part/createPartDb";
import { createServicesTable } from "./migrations/service/createServiceDb";

export function CreateDefaultDb(){

    createBodyTypesTable();
    createBrandsTable();
    createCarsTable();
    createCustomersTable();
    createFuelTypesTable();
    createPartsTable();
    createServicesTable();
}



CreateDefaultDb();