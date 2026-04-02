import { eq } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";
// 1. DEĞİŞİKLİK: drizzleDb yerine useDb import edildi
import { useDb } from "../drizzleDb"; 
import { Emails } from "../schemas/customerSchemas/emailsSchema";
import { BaseRepository } from "./baseRepository";
import { IApiResponse, ServiceResponse } from "../../../../models/response.model";

export class EmailsRepository extends BaseRepository<typeof Emails> {
  constructor() {
    super(Emails, "emailId");
  }

  async getByCustomerId(customerId: number): Promise<IApiResponse<InferSelectModel<typeof Emails>[]>> {
    try {
      // 2. DEĞİŞİKLİK: drizzleDb yerine useDb()
      const result = await useDb()
        .select()
        .from(Emails)
        .where(eq(Emails.customerId, customerId));

      return ServiceResponse.success(
        result as unknown as InferSelectModel<typeof Emails>[],
        "Customer emails fetched successfully."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch customer emails.");
    }
  }

  async getByCustomerForEmail(customerEmail: string): Promise<IApiResponse<number | undefined>> {
    try {
      // 3. DEĞİŞİKLİK: drizzleDb yerine useDb()
      const result = await useDb()
        .select({ customerId: Emails.customerId })
        .from(Emails)
        .where(eq(Emails.customerEmail, customerEmail));

      const id = result[0]?.customerId;

      if (id) {
        return ServiceResponse.success(id, "Customer found.");
      }

      return ServiceResponse.fail("No customer found with this email.", "NOT_FOUND") as any;
    } catch (err) {
      return this.handleError(err, "Failed to find customer by email.");
    }
  }

  async isEmailUsed(email: string): Promise<IApiResponse<boolean>> {
    try {
      // 4. DEĞİŞİKLİK: drizzleDb yerine useDb()
      const result = await useDb()
        .select()
        .from(Emails)
        .where(eq(Emails.customerEmail, email))
        .limit(1);

      const isUsed = result.length > 0;

      return ServiceResponse.success(isUsed, isUsed ? "Email is currently in use." : "Email is available.");
    } catch (err) {
      return this.handleError(err, "Failed to check email availability.");
    }
  }
}