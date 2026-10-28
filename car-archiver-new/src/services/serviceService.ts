import { eq } from "drizzle-orm";
import type { Service } from "../shared/types/service";
import type { Part } from "../shared/types/part";
import { PartsRepository, ServicesRepository } from "../main/data/drizzle/repositories";
import { useDb } from "../main/data/drizzle/drizzleDb";
import { Services } from "../main/data/drizzle/schemas/servicesSchema";
import { Parts } from "../main/data/drizzle/schemas/partsSchema";
import { Cars } from "../main/data/drizzle/schemas/carsSchema";
import { ServiceResponse } from "../models/response.model";

/** All writes are synchronous inside Drizzle's better-sqlite3 transaction. */
export class ServiceService {
  constructor(
    private readonly servicesRepository: ServicesRepository,
    private readonly partsRepository: PartsRepository,
  ) {}

  async createService(service: Service, parts: Part[] = []) {
    if (parts.some((part) => part.partId != null)) return ServiceResponse.fail("New service parts must not have existing IDs.");
    try {
      const result = useDb().transaction((tx) => {
        validatePartEntries(parts);
        const { serviceId: _id, ...values } = service;
        void _id;
        const createdService = tx.insert(Services).values(values).returning().get();
        const createdParts = parts.map(({ partId: _partId, ...part }) => {
          void _partId;
          return tx.insert(Parts).values({ ...part, carId: createdService.carId, serviceId: createdService.serviceId }).returning().get();
        });
        // A service's odometer reading updates the vehicle's latest known mileage,
        // without overwriting a newer (higher) vehicle reading.
        if (createdService.km !== null && Number.isFinite(createdService.km) && createdService.km >= 0) {
          const car = tx.select({ km: Cars.km }).from(Cars).where(eq(Cars.carId, createdService.carId)).get();
          if (car && (car.km === null || createdService.km > car.km)) {
            tx.update(Cars).set({ km: createdService.km }).where(eq(Cars.carId, createdService.carId)).run();
          }
        }
        return { service: createdService as Service, parts: createdParts as Part[] };
      });
      return ServiceResponse.success(result, "Service created successfully.");
    } catch (error) {
      return ServiceResponse.error(error, "Service and parts could not be created together.");
    }
  }

  async updateService(serviceId: number, service: Service, parts: Part[] = []) {
    try {
      const result = useDb().transaction((tx) => {
        validatePartEntries(parts);
        const { serviceId: _id, ...values } = service;
        void _id;
        const updated = tx.update(Services).set(values).where(eq(Services.serviceId, serviceId)).returning().get();
        if (!updated) throw new Error("Service not found.");

        const existing = tx.select().from(Parts).where(eq(Parts.serviceId, serviceId)).all();
        const existingIds = new Set(existing.map((part) => part.partId));
        const incomingIds = new Set<number>();
        for (const part of parts) {
          if (part.partId == null) continue;
          if (!Number.isSafeInteger(part.partId) || !existingIds.has(part.partId) || incomingIds.has(part.partId)) {
            throw new Error("Invalid or duplicate part ID for this service.");
          }
          incomingIds.add(part.partId);
        }
        // Delete only rows removed in the UI. Preserve IDs of unchanged rows.
        for (const old of existing) {
          if (!incomingIds.has(old.partId)) tx.delete(Parts).where(eq(Parts.partId, old.partId)).run();
        }
        const savedParts = parts.map((part) => {
          const values = {
            carId: updated.carId,
            serviceId,
            partName: part.partName,
            quantity: part.quantity,
            unitPriceKurus: part.unitPriceKurus,
          };
          if (part.partId != null) {
            return tx.update(Parts).set(values).where(eq(Parts.partId, part.partId)).returning().get();
          }
          return tx.insert(Parts).values(values).returning().get();
        });
        // Keep the vehicle profile and service records consistent atomically.
        // Do this after parts writes so any failure rolls back both changes.
        if (updated.km !== null && Number.isFinite(updated.km) && updated.km >= 0) {
          const car = tx.select({ km: Cars.km }).from(Cars).where(eq(Cars.carId, updated.carId)).get();
          if (car && (car.km === null || updated.km > car.km)) {
            tx.update(Cars).set({ km: updated.km }).where(eq(Cars.carId, updated.carId)).run();
          }
        }
        return { service: updated as Service, parts: savedParts as Part[] };
      });
      return ServiceResponse.success(result, "Service updated successfully.");
    } catch (error) {
      return ServiceResponse.error(error, "Service and parts could not be updated together.");
    }
  }

  async deleteService(serviceId: number) {
    try {
      const deleted = useDb().transaction((tx) =>
        tx.delete(Services).where(eq(Services.serviceId, serviceId)).returning().get());
      if (!deleted) return ServiceResponse.fail("Service not found.");
      // Parts are removed by the existing ON DELETE CASCADE FK.
      return ServiceResponse.success(undefined, "Service deleted successfully.");
    } catch (error) {
      return ServiceResponse.error(error, "Service could not be deleted.");
    }
  }

  async getDetails(serviceId: number) {
    const serviceResult = await this.servicesRepository.getById(serviceId);
    if (!serviceResult.success || !serviceResult.data) return serviceResult;
    const partsResult = await this.partsRepository.getByServiceId(serviceId);
    if (!partsResult.success) return ServiceResponse.error(new Error(partsResult.message), "Service parts could not be loaded.");
    return ServiceResponse.success({ service: serviceResult.data as Service, parts: (partsResult.data ?? []) as Part[] }, "Service details fetched successfully.");
  }

  async getAll() { return this.servicesRepository.getAll(); }
  async getByCarId(carId: number) { return this.servicesRepository.getByCarId(carId); }
  async getByCustomerId(customerId: number) { return this.servicesRepository.getByCustomerId(customerId); }
  async getPartsByService(serviceId: number) { return this.partsRepository.getByServiceId(serviceId); }
}

/** Defense in depth: callers outside IPC must obey the same part rules. */
function validatePartEntries(parts: Part[]): void {
  for (const part of parts) {
    if (!part.partName.trim() || part.partName.length > 200) throw new Error("Invalid part name.");
    if (!Number.isSafeInteger(part.quantity) || part.quantity < 1) throw new Error("Part quantity must be positive whole number.");
    if (!Number.isSafeInteger(part.unitPriceKurus) || part.unitPriceKurus < 0 ||
        !Number.isSafeInteger(part.quantity * part.unitPriceKurus)) throw new Error("Invalid part price.");
  }
}

