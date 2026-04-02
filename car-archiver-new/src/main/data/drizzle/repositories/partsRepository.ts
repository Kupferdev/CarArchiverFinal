import { and, eq } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";
// 1. DEĞİŞİKLİK: drizzleDb yerine useDb import edildi
import { useDb } from "../drizzleDb"; 
import { Parts } from "../schemas/partsSchema";
import { BaseRepository } from "./baseRepository";
import { IApiResponse, ServiceResponse } from "../../../../models/response.model";

export class PartsRepository extends BaseRepository<typeof Parts> {
  constructor() {
    super(Parts, "partId");
  }

  async getByCarId(carId: number): Promise<IApiResponse<InferSelectModel<typeof Parts>[]>> {
    try {
      // 2. DEĞİŞİKLİK: drizzleDb yerine useDb()
      const result = await useDb()
        .select()
        .from(Parts)
        .where(eq(Parts.carId, carId));

      return ServiceResponse.success(
        result as unknown as InferSelectModel<typeof Parts>[], 
        "Parts fetched by car successfully."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch parts by car.");
    }
  }

  async getByServiceId(serviceId: number): Promise<IApiResponse<InferSelectModel<typeof Parts>[]>> {
    try {
      // 3. DEĞİŞİKLİK: drizzleDb yerine useDb()
      const result = await useDb()
        .select()
        .from(Parts)
        .where(eq(Parts.serviceId, serviceId));

      return ServiceResponse.success(
        result as unknown as InferSelectModel<typeof Parts>[], 
        "Parts fetched by service successfully."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch parts by service.");
    }
  }

  async getByCarAndService(carId: number, serviceId: number): Promise<IApiResponse<InferSelectModel<typeof Parts>[]>> {
    try {
      // 4. DEĞİŞİKLİK: drizzleDb yerine useDb()
      const result = await useDb()
        .select()
        .from(Parts)
        .where(and(eq(Parts.carId, carId), eq(Parts.serviceId, serviceId)));

      return ServiceResponse.success(
        result as unknown as InferSelectModel<typeof Parts>[], 
        "Parts fetched matching car and service."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch parts by car and service.");
    }
  }
}