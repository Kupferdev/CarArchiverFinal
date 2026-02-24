import { eq, and } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";
import { drizzleDb } from "../drizzleDb";
import { Customers } from "../schemas/customerSchemas/customersSchema";
import { BaseRepository } from "./baseRepository";
import { IApiResponse, ServiceResponse } from "../../../../models/response.model";

export class CustomersRepository extends BaseRepository<typeof Customers> {
  constructor() {
    super(Customers, "customerId");
  }

  async getByNatId(nationalId: string): Promise<IApiResponse<InferSelectModel<typeof Customers> | undefined>> {
    try {
      const result = await drizzleDb
        .select()
        .from(Customers)
        .where(eq(Customers.nationalId, nationalId));

      const customer = result[0];

      if (customer) {
        return ServiceResponse.success(
          customer as unknown as InferSelectModel<typeof Customers>, 
          "Customer found by National ID."
        );
      }

      return ServiceResponse.fail("Customer not found with this National ID.", "NOT_FOUND") as any;
    } catch (err) {
      return this.handleError(err, "Failed to fetch customer by National ID.");
    }
  }

  // İsim ve/veya Soyisime göre dinamik arama
  async getByNameSurname(firstName?: string, lastName?: string): Promise<IApiResponse<InferSelectModel<typeof Customers>[]>> {
    try {
      const filters = [];

      if (firstName) filters.push(eq(Customers.firstName, firstName));
      if (lastName) filters.push(eq(Customers.lastName, lastName));

      // Eğer hiç filtre verilmediyse boş liste dön (Tüm veriyi çekmeyi engellemek için)
      if (filters.length === 0) {
        return ServiceResponse.success([], "No search criteria provided.");
      }

      const result = await drizzleDb
        .select()
        .from(Customers)
        // 'and(...filters)' tüm koşulların sağlanmasını bekler
        .where(and(...filters));

      return ServiceResponse.success(
        result as unknown as InferSelectModel<typeof Customers>[], 
        result.length > 0 ? "Customers found." : "No customers found matching criteria."
      );

    } catch (err) {
      return this.handleError(err, "Failed to search customers.");
    }
  }
}