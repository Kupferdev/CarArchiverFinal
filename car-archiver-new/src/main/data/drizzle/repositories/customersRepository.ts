import { eq, and } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";



// 1. DEĞİŞİKLİK: drizzleDb yerine useDb import edildi
import { useDb } from "../drizzleDb"; 
import { Customers } from "../schemas/customerSchemas/customersSchema";
import { Cars } from '../schemas/carsSchema';
import { Services } from '../schemas/servicesSchema';
import { BaseRepository } from "./baseRepository";
import { IApiResponse, ServiceResponse } from "../../../../models/response.model";
import { inArray } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';
import type { CreateCustomerRequest } from "../../../../shared/dtos/customerDtos";

import { PhoneNumbers } from "../schemas/customerSchemas/phoneNumbersSchema";
import { Emails } from "../schemas/customerSchemas/emailsSchema";

export class CustomersRepository extends BaseRepository<typeof Customers> {
  constructor() {
    super(Customers, "customerId");
  }

  /** Creates a customer and all contact records atomically. */
  async createWithContacts(
    customer: InferInsertModel<typeof Customers>,
    phones: Omit<InferInsertModel<typeof PhoneNumbers>, "customerId">[] = [],
    emails: Omit<InferInsertModel<typeof Emails>, "customerId">[] = []
  ): Promise<IApiResponse<number>> {
    try {
      const db = useDb();

      const customerId = db.transaction((tx) => {
        const inserted = tx
          .insert(Customers)
          .values(customer)
          .returning({ customerId: Customers.customerId })
          .get();

        if (!inserted) throw new Error("Customer could not be created.");

        if (phones.length > 0) {
          tx.insert(PhoneNumbers)
            .values(phones.map((phone) => ({ ...phone, customerId: inserted.customerId })))
            .run();
        }

        if (emails.length > 0) {
          tx.insert(Emails)
            .values(emails.map((email) => ({ ...email, customerId: inserted.customerId })))
            .run();
        }

        return inserted.customerId;
      });

      return ServiceResponse.success(customerId, "Customer created successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to create customer and contacts.");
    }
  }

  async getByNatId(nationalId: string): Promise<IApiResponse<InferSelectModel<typeof Customers> | undefined>> {
    try {
      // 2. DEĞİŞİKLİK: drizzleDb.select() yerine useDb().select()
      const result = await useDb()
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

      return ServiceResponse.fail("Customer not found with this National ID.", "NOT_FOUND");
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

      // 3. DEĞİŞİKLİK: drizzleDb.select() yerine useDb().select()
      const result = await useDb()
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

// Müşteri Profili (Müşteri Bilgisi + Arabalar + Servisler + İletişim)
  async getFullProfile(customerId: number) {
    try {
      const db = useDb();

      const customerData = await db.select().from(Customers).where(eq(Customers.customerId, customerId));
      const carsList = await db.select().from(Cars).where(eq(Cars.customerId, customerId));
      const servicesList = await db.select().from(Services).where(eq(Services.customerId, customerId));
      
      // EKSİK OLAN KISIM: Telefon ve E-postaları çekiyoruz
      const phonesList = await db.select().from(PhoneNumbers).where(eq(PhoneNumbers.customerId, customerId));
      const emailsList = await db.select().from(Emails).where(eq(Emails.customerId, customerId));

      const customer = customerData[0];
      if (!customer) {
        return ServiceResponse.fail("Customer not found.", "NOT_FOUND");
      }

      return ServiceResponse.success(
        { customer, cars: carsList, services: servicesList, phones: phonesList, emails: emailsList },
        "Customer profile retrieved successfully."
      );
    } catch (err) {
      return this.handleError(err, "Failed to load customer profile.");
    }
  }

// Tüm müşterileri telefon ve e-postalarıyla birlikte liste için çeken metot
  async getAllCustomersWithDetails() {
    try {
      const db = useDb();
      const [allCustomers, allPhones, allEmails] = await Promise.all([
        db.select().from(Customers),
        db.select().from(PhoneNumbers),
        db.select().from(Emails),
      ]);

      const phonesByCustomer = new Map<number, typeof allPhones>();
      for (const phone of allPhones) {
        const list = phonesByCustomer.get(phone.customerId) ?? [];
        list.push(phone);
        phonesByCustomer.set(phone.customerId, list);
      }

      const emailsByCustomer = new Map<number, typeof allEmails>();
      for (const email of allEmails) {
        const list = emailsByCustomer.get(email.customerId) ?? [];
        list.push(email);
        emailsByCustomer.set(email.customerId, list);
      }

      const result = allCustomers.map((customer) => ({
        id: customer.customerId,
        fullName: `${customer.firstName} ${customer.lastName || ''}`.trim(),
        nationalId: customer.nationalId || '',
        taxNumber: customer.taxNumber || '',
        address: customer.address || '',
        phones: (phonesByCustomer.get(customer.customerId) ?? []).map((phone) => ({
          countryCode: phone.countryCode,
          number: phone.phoneNumber,
        })),
        emails: (emailsByCustomer.get(customer.customerId) ?? []).map((email) => ({
          address: email.customerEmail,
        })),
      }));

      return ServiceResponse.success(result, "Customers with contact details retrieved successfully.");
    } catch (err) {
      console.error("🆘 Detaylı müşteri listesi çekilirken hata:", err);
      return this.handleError(err, "Failed to fetch customers with contact details.");
    }
  }

  // Formu doldurmak için müşteriyi çeken metot
  async getCustomerForEdit(customerId: number) {
    try {
      const db = useDb();
      const customer = await db.select().from(Customers).where(eq(Customers.customerId, customerId));
      const phones = await db.select().from(PhoneNumbers).where(eq(PhoneNumbers.customerId, customerId));
      const emails = await db.select().from(Emails).where(eq(Emails.customerId, customerId));
      if (!customer[0]) {
        return ServiceResponse.fail("Customer not found.", "NOT_FOUND");
      }
      return ServiceResponse.success(
        { customer: customer[0], phones, emails },
        "Customer edit data retrieved successfully."
      );
    } catch (err) {
      return this.handleError(err, "Failed to load customer edit data.");
    }
  }

// Müşteriyi telefon ve mailleriyle güncelleyen metot (Senkron Transaction ile)
  async updateCustomerFull(customerId: number, data: CreateCustomerRequest): Promise<IApiResponse<null>> {
    try {
      const db = useDb();
      
      // DİKKAT: better-sqlite3 senkron çalışır. async veya await YOK! İşlemlerin sonuna .run() eklenir.
      db.transaction((tx) => {
        // 1. Ana bilgileri güncelle
        const updatedCustomer = tx.update(Customers).set({
          firstName: data.firstName,
          lastName: data.lastName,
          nationalId: data.nationalId,
          taxNumber: data.taxNumber,
          address: data.address ?? null
        }).where(eq(Customers.customerId, customerId)).returning({ customerId: Customers.customerId }).get();

        if (!updatedCustomer) {
          throw new Error("Customer not found.");
        }

        // 2. Eski telefonları sil, yenilerini kaydet
        tx.delete(PhoneNumbers).where(eq(PhoneNumbers.customerId, customerId)).run();
        if (data.phones && data.phones.length > 0) {
          tx.insert(PhoneNumbers).values(data.phones.map((p) => ({
            customerId, countryCode: p.countryCode, phoneNumber: p.number
          }))).run();
        }

        // 3. Eski mailleri sil, yenilerini kaydet
        tx.delete(Emails).where(eq(Emails.customerId, customerId)).run();
        if (data.emails && data.emails.length > 0) {
          tx.insert(Emails).values(data.emails.map((e) => ({
            customerId, customerEmail: e.address
          }))).run();
        }
      }); // Transaction bloğu bittiğinde veritabanına otomatik commit atılır.

      return ServiceResponse.success(null, "Customer updated successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to update customer.");
    }
  }

  // Müşteriyi ve (istenirse) bağlı kayıtları tek transaction içinde siler.
  async deleteCustomer(customerId: number, deleteRelated: boolean) {
    try {
      const db = useDb();

      db.transaction((tx) => {
        tx.delete(PhoneNumbers).where(eq(PhoneNumbers.customerId, customerId)).run();
        tx.delete(Emails).where(eq(Emails.customerId, customerId)).run();

        if (deleteRelated) {
          // Services reference cars, so delete services before cars.
          tx.delete(Services).where(eq(Services.customerId, customerId)).run();
          tx.delete(Cars).where(eq(Cars.customerId, customerId)).run();
        } else {
          // Preserve cars/services while removing the customer relationship.
          tx.update(Cars)
            .set({ customerId: null })
            .where(eq(Cars.customerId, customerId))
            .run();
          tx.update(Services)
            .set({ customerId: null })
            .where(eq(Services.customerId, customerId))
            .run();
        }

        const deleted = tx
          .delete(Customers)
          .where(eq(Customers.customerId, customerId))
          .returning({ customerId: Customers.customerId })
          .get();

        if (!deleted) throw new Error("Customer not found.");
      });

      return ServiceResponse.success(null, "Customer deleted.");
    } catch (err) {
      return this.handleError(err, "Failed to delete customer.");
    }
  }

// TOPLU SİLME METODU
  async deleteCustomersBulk(customerIds: number[], deleteRelated: boolean) {
    try {
      if (customerIds.length === 0) {
        return ServiceResponse.success(null, "No customers selected.");
      }

      const db = useDb();

      db.transaction((tx) => {
        tx.delete(PhoneNumbers).where(inArray(PhoneNumbers.customerId, customerIds)).run();
        tx.delete(Emails).where(inArray(Emails.customerId, customerIds)).run();

        if (deleteRelated) {
          tx.delete(Services).where(inArray(Services.customerId, customerIds)).run();
          tx.delete(Cars).where(inArray(Cars.customerId, customerIds)).run();
        } else {
          tx.update(Cars)
            .set({ customerId: null })
            .where(inArray(Cars.customerId, customerIds))
            .run();
          tx.update(Services)
            .set({ customerId: null })
            .where(inArray(Services.customerId, customerIds))
            .run();
        }

        tx.delete(Customers)
          .where(inArray(Customers.customerId, customerIds))
          .run();
      });

      return ServiceResponse.success(null, "Customers deleted.");
    } catch (err) {
      return this.handleError(err, "Failed to delete customers.");
    }
  }

}
