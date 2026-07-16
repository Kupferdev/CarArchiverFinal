import { eq, and } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";



// 1. DEĞİŞİKLİK: drizzleDb yerine useDb import edildi
import { useDb } from "../drizzleDb"; 
import { Customers } from "../schemas/customerSchemas/customersSchema";
import { Cars } from '../schemas/carsSchema';
import { Services } from '../schemas/servicesSchema';
import { BaseRepository } from "./baseRepository";
import { IApiResponse, ServiceResponse } from "../../../../models/response.model";

import { PhoneNumbers } from "../schemas/customerSchemas/phoneNumbersSchema";
import { Emails } from "../schemas/customerSchemas/emailsSchema";

export class CustomersRepository extends BaseRepository<typeof Customers> {
  constructor() {
    super(Customers, "customerId");
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

      return { 
        success: true, 
        data: { 
          customer: customerData[0], 
          cars: carsList, 
          services: servicesList,
          phones: phonesList, // Yüklemeye dahil edildi
          emails: emailsList  // Yüklemeye dahil edildi
        } 
      };
    } catch (err) {
      console.error("Profil verisi çekilirken hata oluştu:", err);
      return { success: false, data: null, message: "Profil yüklenemedi." };
    }
  }

// Tüm müşterileri telefon ve e-postalarıyla birlikte liste için çeken metot
  async getAllCustomersWithDetails() {
    try {
      const db = useDb();
      const allCustomers = await db.select().from(Customers);
      
      const result = [];
      for (const c of allCustomers) {
        const phones = await db.select().from(PhoneNumbers).where(eq(PhoneNumbers.customerId, c.customerId));
        const emails = await db.select().from(Emails).where(eq(Emails.customerId, c.customerId));
        
        result.push({
          id: c.customerId,
          fullName: `${c.firstName} ${c.lastName || ''}`.trim(),
          nationalId: c.nationalId || '',
          taxNumber: c.taxNumber || '',
          // Arayüzün (UI) beklediği DTO formatına dönüştürüyoruz
          phones: phones.map((p: any) => ({ countryCode: p.countryCode, number: p.phoneNumber })),
          emails: emails.map((e: any) => ({ address: e.customerEmail }))
        });
      }
      return { success: true, data: result };
    } catch (err: any) {
      console.error("🆘 Detaylı müşteri listesi çekilirken hata:", err);
      return { success: false, message: err.message, data: [] };
    }
  }

  // Formu doldurmak için müşteriyi çeken metot
  async getCustomerForEdit(customerId: number) {
    try {
      const db = useDb();
      const customer = await db.select().from(Customers).where(eq(Customers.customerId, customerId));
      const phones = await db.select().from(PhoneNumbers).where(eq(PhoneNumbers.customerId, customerId));
      const emails = await db.select().from(Emails).where(eq(Emails.customerId, customerId));
      return { success: true, data: { customer: customer[0], phones, emails } };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

// Müşteriyi telefon ve mailleriyle güncelleyen metot (Senkron Transaction ile)
  async updateCustomerFull(customerId: number, data: any) {
    try {
      const db = useDb();
      
      // DİKKAT: better-sqlite3 senkron çalışır. async veya await YOK! İşlemlerin sonuna .run() eklenir.
      db.transaction((tx) => {
        // 1. Ana bilgileri güncelle
        tx.update(Customers).set({
          firstName: data.firstName,
          lastName: data.lastName,
          nationalId: data.nationalId,
          taxNumber: data.taxNumber
        }).where(eq(Customers.customerId, customerId)).run();

        // 2. Eski telefonları sil, yenilerini kaydet
        tx.delete(PhoneNumbers).where(eq(PhoneNumbers.customerId, customerId)).run();
        if (data.phones && data.phones.length > 0) {
          tx.insert(PhoneNumbers).values(data.phones.map((p: any) => ({
            customerId, countryCode: p.countryCode, phoneNumber: p.number
          }))).run();
        }

        // 3. Eski mailleri sil, yenilerini kaydet
        tx.delete(Emails).where(eq(Emails.customerId, customerId)).run();
        if (data.emails && data.emails.length > 0) {
          tx.insert(Emails).values(data.emails.map((e: any) => ({
            customerId, customerEmail: e.address
          }))).run();
        }
      }); // Transaction bloğu bittiğinde veritabanına otomatik commit atılır.

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

}