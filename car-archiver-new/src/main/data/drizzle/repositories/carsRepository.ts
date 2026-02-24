import { eq } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";
import { drizzleDb } from "../drizzleDb";
import { Cars } from "../schemas/carsSchema";
import { BaseRepository } from "./baseRepository";
import { IApiResponse, ServiceResponse } from "../../../../models/response.model";

export class CarsRepository extends BaseRepository<typeof Cars> {
  constructor() {
    super(Cars, "carId");
  }


  async getByCustomerId(customerId: number): Promise<IApiResponse<InferSelectModel<typeof Cars>[]>> {
    try {
      const result = await drizzleDb
        .select()
        .from(Cars)
        .where(eq(Cars.customerId, customerId));

      return ServiceResponse.success(
        result as unknown as InferSelectModel<typeof Cars>[],
        "Customer's cars fetched successfully."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch cars by customer.");
    }
  }

  async getByBrandId(brandId: number): Promise<IApiResponse<InferSelectModel<typeof Cars>[]>> {
    try {
      const result = await drizzleDb
        .select()
        .from(Cars)
        .where(eq(Cars.brandId, brandId));

      return ServiceResponse.success(
        result as unknown as InferSelectModel<typeof Cars>[],
        "Cars fetched by brand."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch cars by brand.");
    }
  }

  async getByYear(year: number): Promise<IApiResponse<InferSelectModel<typeof Cars>[]>> {
    try {
      const result = await drizzleDb
        .select()
        .from(Cars)
        .where(eq(Cars.year, year));

      return ServiceResponse.success(
        result as unknown as InferSelectModel<typeof Cars>[],
        `Cars from year ${year} fetched.`
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch cars by year.");
    }
  }

  async getByFuelType(fuelType: number): Promise<IApiResponse<InferSelectModel<typeof Cars>[]>> {
    try {
      const result = await drizzleDb
        .select()
        .from(Cars)
        .where(eq(Cars.fuelType, fuelType));

      return ServiceResponse.success(
        result as unknown as InferSelectModel<typeof Cars>[],
        "Cars fetched by fuel type."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch cars by fuel type.");
    }
  }

  async getByBodyType(bodyType: number): Promise<IApiResponse<InferSelectModel<typeof Cars>[]>> {
    try {
      const result = await drizzleDb
        .select()
        .from(Cars)
        .where(eq(Cars.bodyType, bodyType));

      return ServiceResponse.success(
        result as unknown as InferSelectModel<typeof Cars>[],
        "Cars fetched by body type."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch cars by body type.");
    }
  }

  async getByVinNumber(vinNumber: string): Promise<IApiResponse<InferSelectModel<typeof Cars> | undefined>> {
    try {
      const result = await drizzleDb
        .select()
        .from(Cars)
        .where(eq(Cars.vinNumber, vinNumber));

      const car = result[0];

      if (car) {
        return ServiceResponse.success(
          car as unknown as InferSelectModel<typeof Cars>,
          "Car found by VIN."
        );
      }

      return ServiceResponse.fail("No car found with this VIN number.", "NOT_FOUND") as any;
    } catch (err) {
      return this.handleError(err, "Failed to fetch car by VIN.");
    }
  }

  async getByPlateNumber(plateNumber: string): Promise<IApiResponse<InferSelectModel<typeof Cars> | undefined>> {
    try {
      const result = await drizzleDb
        .select()
        .from(Cars)
        .where(eq(Cars.plateNumber, plateNumber));

      const car = result[0];

      if (car) {
        return ServiceResponse.success(
          car as unknown as InferSelectModel<typeof Cars>,
          "Car found by Plate Number."
        );
      }

      return ServiceResponse.fail("No car found with this Plate Number.", "NOT_FOUND") as any;
    } catch (err) {
      return this.handleError(err, "Failed to fetch car by Plate Number.");
    }
  }

  /*
  async addOldCustomer(carId: number, oldCustomerIdToAdd: number): Promise<IApiResponse<string>> {
    try {
      const result = await drizzleDb
        .select()
        .from(Cars)
        .where(eq(Cars.carId, carId));

      const car = result[0];

      if (!car) {
        return ServiceResponse.fail("Car not found.", "NOT_FOUND") as any;
      }

      let currentIds: number[] = [];
      if (car.oldCustomerId && car.oldCustomerId.length > 0) {
        currentIds = car.oldCustomerId.split(',').map(id => Number(id.trim()));
      }

      if (!currentIds.includes(oldCustomerIdToAdd)) {
        currentIds.push(oldCustomerIdToAdd);
      } else {
        return ServiceResponse.success("ID already exists in history", "Customer already exists in car history.");
      }

      const newOldCustomerString = currentIds.join(',');

      await drizzleDb
        .update(Cars)
        .set({ oldCustomerId: newOldCustomerString })
        .where(eq(Cars.carId, carId));

      return ServiceResponse.success("Success", "Old customer added successfully.");

    } catch (err) {
      return this.handleError(err, "Failed to add old customer.");
    }
  }

  async getOldCustomers(carId: number): Promise<IApiResponse<number[]>> {
    try {
      const result = await drizzleDb
        .select()
        .from(Cars)
        .where(eq(Cars.carId, carId));

      const car = result[0];

      if (!car) {
        return ServiceResponse.fail("Car not found.", "NOT_FOUND") as any;
      }

      const rawString = car.oldCustomerId;

      if (!rawString) {
        return ServiceResponse.success([], "No old customers found.");
      }

      const idList = rawString.split(',').map(id => Number(id.trim()));

      return ServiceResponse.success(idList, "Old customers retrieved successfully.");

    } catch (err) {
      return this.handleError(err, "Failed to get old customers.");
    }
  }
    */

  async addOldCustomer(carId: number, oldCustomerIdToAdd: number): Promise<IApiResponse<string>> {
    try {
      const result = await drizzleDb
        .select()
        .from(Cars)
        .where(eq(Cars.carId, carId));

      const car = result[0];

      if (!car) {
        return ServiceResponse.fail("Car not found.", "NOT_FOUND") as any;
      }

      const currentIds = car.oldCustomerId ?? [];

      const idToAddStr = oldCustomerIdToAdd.toString();

      if (currentIds.includes(idToAddStr)) {
        return ServiceResponse.success("ID already exists in history", "Customer already exists in car history.");
      }

      const updatedList = [...currentIds, idToAddStr];

      await drizzleDb
        .update(Cars)
        .set({ oldCustomerId: updatedList })
        .where(eq(Cars.carId, carId));

      return ServiceResponse.success("Success", "Old customer added successfully.");

    } catch (err) {
      return this.handleError(err, "Failed to add old customer.");
    }
  }

  async getOldCustomers(carId: number): Promise<IApiResponse<number[]>> {
    try {
      const result = await drizzleDb
        .select()
        .from(Cars)
        .where(eq(Cars.carId, carId));

      const car = result[0];

      if (!car) {
        return ServiceResponse.fail("Car not found.", "NOT_FOUND") as any;
      }

      const currentIds = car.oldCustomerId ?? [];

      if (currentIds.length === 0) {
        return ServiceResponse.success([], "No old customers found.");
      }

      const idList = currentIds.map(id => Number(id));

      return ServiceResponse.success(idList, "Old customers retrieved successfully.");

    } catch (err) {
      return this.handleError(err, "Failed to get old customers.");
    }
  }
}