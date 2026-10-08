import { sql } from "drizzle-orm";
import { Brands } from "../schemas/brandsSchema";
import { BaseRepository } from "./baseRepository";
import { useDb } from "../drizzleDb";
import { IApiResponse, ServiceResponse } from "../../../../models/response.model";

export class BrandsRepository extends BaseRepository<typeof Brands> {
  constructor() {
    super(Brands, "brandId");
  }

  async findByName(
    brandName: string
  ): Promise<IApiResponse<typeof Brands.$inferSelect | undefined>> {
    try {
      const normalizedName = brandName.trim();

      const result = await useDb()
        .select()
        .from(Brands)
        .where(
          sql`LOWER(${Brands.brandName}) = LOWER(${normalizedName})`
        )
        .limit(1);

      if (result.length > 0) {
        return ServiceResponse.success(result[0], "Brand found.");
      }

      return ServiceResponse.success(undefined, "Brand not found.");
    } catch (error) {
      return this.handleError(error, "Failed to find brand.");
    }
  }
}
