import { eq } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";
import { drizzleDb } from "../drizzleDb";
import { Services } from "../schemas/servicesSchema";
import { BaseRepository } from "./baseRepository";
import { IApiResponse, ServiceResponse } from "../../../../models/response.model";

export class ServicesRepository extends BaseRepository<typeof Services> {
  constructor() {
    super(Services, "serviceId");
  }

  async getByCarId(carId: number): Promise<IApiResponse<InferSelectModel<typeof Services>[]>> {
    try {
      const result = await drizzleDb
        .select()
        .from(Services)
        .where(eq(Services.carId, carId));

      return ServiceResponse.success(
        result as unknown as InferSelectModel<typeof Services>[], 
        "Service history for the car fetched successfully."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch service history by car.");
    }
  }

  async getByCustomerId(customerId: number): Promise<IApiResponse<InferSelectModel<typeof Services>[]>> {
    try {
      const result = await drizzleDb
        .select()
        .from(Services)
        .where(eq(Services.customerId, customerId));

      return ServiceResponse.success(
        result as unknown as InferSelectModel<typeof Services>[], 
        "Service history for the customer fetched successfully."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch service history by customer.");
    }
  }
}