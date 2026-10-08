import { eq } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";
// 1. DEĞİŞİKLİK: drizzleDb yerine useDb import edildi
import { useDb } from "../drizzleDb";
import { getDb } from "../../db"; 
import { Cars } from "../schemas/carsSchema";
import { BaseRepository } from "./baseRepository";
import { IApiResponse, ServiceResponse } from "../../../../models/response.model";

export class CarsRepository extends BaseRepository<typeof Cars> {
  constructor() {
    super(Cars, "carId");
  }

  async getByCustomerId(customerId: number): Promise<IApiResponse<InferSelectModel<typeof Cars>[]>> {
    try {
      // 2. DEĞİŞİKLİK: drizzleDb.select() yerine useDb().select()
      const result = await useDb()
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
      const result = await useDb()
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
      const result = await useDb()
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
      const result = await useDb()
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
      const result = await useDb()
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
      const result = await useDb()
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

      return ServiceResponse.fail("No car found with this VIN number.", "NOT_FOUND");
    } catch (err) {
      return this.handleError(err, "Failed to fetch car by VIN.");
    }
  }

  async getByPlateNumber(plateNumber: string): Promise<IApiResponse<InferSelectModel<typeof Cars> | undefined>> {
    try {
      const result = await useDb()
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

      return ServiceResponse.fail("No car found with this Plate Number.", "NOT_FOUND");
    } catch (err) {
      return this.handleError(err, "Failed to fetch car by Plate Number.");
    }
  }

  async addOldCustomer(carId: number, oldCustomerIdToAdd: number): Promise<IApiResponse<string>> {
    try {
      // Okuma işlemi için useDb()
      const result = await useDb()
        .select()
        .from(Cars)
        .where(eq(Cars.carId, carId));

      const car = result[0];

      if (!car) {
        return ServiceResponse.fail("Car not found.", "NOT_FOUND");
      }

      const currentIds = car.oldCustomerId ?? [];
      const idToAddStr = oldCustomerIdToAdd.toString();

      if (currentIds.includes(idToAddStr)) {
        return ServiceResponse.success("ID already exists in history", "Customer already exists in car history.");
      }

      const updatedList = [...currentIds, idToAddStr];

      // Güncelleme işlemi için useDb()
      await useDb()
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
      const result = await useDb()
        .select()
        .from(Cars)
        .where(eq(Cars.carId, carId));

      const car = result[0];

      if (!car) {
        return ServiceResponse.fail("Car not found.", "NOT_FOUND");
      }

      const currentIds = car.oldCustomerId ?? [];
      const idList = currentIds.map((id) => Number(id)).filter(Number.isInteger);

      return ServiceResponse.success(idList, "Old customers retrieved successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to get old customers.");
    }
  }

  async removeOldCustomer(carId: number, oldCustomerIdToRemove: number): Promise<IApiResponse<void>> {
    try {
      const result = await useDb()
        .select()
        .from(Cars)
        .where(eq(Cars.carId, carId));

      const car = result[0];
      if (!car) return ServiceResponse.fail<void>("Car not found.", "NOT_FOUND");

      const currentIds = car.oldCustomerId ?? [];
      const idToRemove = oldCustomerIdToRemove.toString();
      const updatedList = currentIds.filter((id) => id !== idToRemove);

      await useDb()
        .update(Cars)
        .set({ oldCustomerId: updatedList })
        .where(eq(Cars.carId, carId));

      return ServiceResponse.success(undefined, "Old customer removed successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to remove old customer.");
    }
  }

  async updateWithOldCustomer(
    carId: number,
    data: Partial<InferSelectModel<typeof Cars>>,
    oldCustomerIdToAdd?: number | null,
  ): Promise<IApiResponse<InferSelectModel<typeof Cars> | undefined>> {
    try {
      // better-sqlite3 transactions must be synchronous. Drizzle's async query
      // methods return Promises, so using them directly inside db.transaction()
      // causes: "Transaction function cannot return a promise".
      // Use the underlying better-sqlite3 connection for this small atomic update.
      const db = getDb();
      const transaction = db.transaction(() => {
        const currentRow = db
          .prepare("SELECT * FROM Cars WHERE carId = ?")
          .get(carId) as (Record<string, unknown> & { oldCustomerId?: string | string[] | null; customerId?: number | null }) | undefined;

        if (!currentRow) return null;

        let oldCustomerIds: string[] = [];
        if (Array.isArray(currentRow.oldCustomerId)) {
          oldCustomerIds = currentRow.oldCustomerId.map(String);
        } else if (typeof currentRow.oldCustomerId === "string" && currentRow.oldCustomerId.trim()) {
          try {
            const parsed = JSON.parse(currentRow.oldCustomerId) as unknown;
            if (Array.isArray(parsed)) oldCustomerIds = parsed.map(String);
          } catch {
            oldCustomerIds = [];
          }
        }

        // `data.customerId` is the customer the car is being assigned to now.
        // `currentRow.customerId` (read above, before the UPDATE runs) is the
        // owner the car still has. oldCustomerIdToAdd is always equal to
        // currentRow.customerId by construction (the caller passes the owner
        // being replaced), so comparing against currentRow.customerId here
        // was a no-op guard that silently skipped every push. The only
        // meaningful guard is: don't add someone to history if they are also
        // the car's new owner.
        const nextCustomerId = Object.prototype.hasOwnProperty.call(data, "customerId")
          ? (data as unknown as Record<string, unknown>).customerId
          : currentRow.customerId;

        if (oldCustomerIdToAdd && oldCustomerIdToAdd !== nextCustomerId) {
          const id = String(oldCustomerIdToAdd);
          if (!oldCustomerIds.includes(id)) oldCustomerIds.push(id);
        }

        const allowedFields = [
          "customerId", "brandId", "model", "year", "vinNumber", "plateNumber",
          "km", "fuelType", "bodyType", "engineVolumeCc", "notes",
        ] as const;
        const setParts: string[] = [];
        const values: unknown[] = [];

        for (const field of allowedFields) {
          if (Object.prototype.hasOwnProperty.call(data, field)) {
            setParts.push(`${field} = ?`);
            values.push((data as unknown as Record<string, unknown>)[field] ?? null);
          }
        }

        setParts.push("oldCustomerId = ?");
        values.push(JSON.stringify(oldCustomerIds));
        values.push(carId);

        db.prepare(`UPDATE Cars SET ${setParts.join(", ")} WHERE carId = ?`).run(...values);

        const updated = db
          .prepare("SELECT * FROM Cars WHERE carId = ?")
          .get(carId) as Record<string, unknown> | undefined;

        if (!updated) return null;

        const rawOldIds = updated.oldCustomerId;
        let normalizedOldIds: string[] = [];
        if (typeof rawOldIds === "string" && rawOldIds.trim()) {
          try {
            const parsed = JSON.parse(rawOldIds) as unknown;
            if (Array.isArray(parsed)) normalizedOldIds = parsed.map(String);
          } catch {
            normalizedOldIds = [];
          }
        } else if (Array.isArray(rawOldIds)) {
          normalizedOldIds = rawOldIds.map(String);
        }

        return {
          ...updated,
          oldCustomerId: normalizedOldIds,
        } as InferSelectModel<typeof Cars>;
      });

      const result = transaction();
      if (!result) return ServiceResponse.fail<InferSelectModel<typeof Cars> | undefined>("Car not found.", "NOT_FOUND");
      return ServiceResponse.success(result, "Updated successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to update car.");
    }
  }
}