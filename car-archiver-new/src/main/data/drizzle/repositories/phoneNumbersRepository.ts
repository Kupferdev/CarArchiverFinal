import { eq } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";
import { drizzleDb } from "../drizzleDb";
import { PhoneNumbers } from "../schemas/customerSchemas/phoneNumbersSchema";
import { BaseRepository } from "./baseRepository";
import { IApiResponse, ServiceResponse } from "../../../../models/response.model";

export class PhoneNumbersRepository extends BaseRepository<typeof PhoneNumbers> {
  constructor() {
    super(PhoneNumbers, "phoneNumberId");
  }

  // Bir müşteriye ait telefonları listele
  async getByCustomerId(customerId: number): Promise<IApiResponse<InferSelectModel<typeof PhoneNumbers>[]>> {
    try {
      const result = await drizzleDb
        .select()
        .from(PhoneNumbers)
        .where(eq(PhoneNumbers.customerId, customerId));

      return ServiceResponse.success(
        result as unknown as InferSelectModel<typeof PhoneNumbers>[], 
        "Customer phone numbers fetched successfully."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch phone numbers by customer.");
    }
  }

  // Telefon numarasına göre tekil arama
  // limit(1) kullandığın için tek bir obje veya undefined döneriz
  async getByPhoneNumber(phoneNumber: string): Promise<IApiResponse<InferSelectModel<typeof PhoneNumbers> | undefined>> {
    try {
      const result = await drizzleDb
        .select()
        .from(PhoneNumbers)
        .where(eq(PhoneNumbers.phoneNumber, phoneNumber))
        .limit(1);

      const phoneRecord = result[0];

      if (phoneRecord) {
        return ServiceResponse.success(
            phoneRecord as unknown as InferSelectModel<typeof PhoneNumbers>, 
            "Phone number found."
        );
      }

      return ServiceResponse.fail("Phone number not found.", "NOT_FOUND") as any;
    } catch (err) {
      return this.handleError(err, "Failed to search by phone number.");
    }
  }

  // Ülke koduna göre listeleme (Örn: +90 olanları getir)
  async getByCountryCode(countryCode: string): Promise<IApiResponse<InferSelectModel<typeof PhoneNumbers>[]>> {
    try {
      const result = await drizzleDb
        .select()
        .from(PhoneNumbers)
        .where(eq(PhoneNumbers.countryCode, countryCode));

      return ServiceResponse.success(
        result as unknown as InferSelectModel<typeof PhoneNumbers>[], 
        `Phone numbers fetched for country code ${countryCode}.`
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch phone numbers by country code.");
    }
  }
}