import { CustomersRepository } from "../../main/data/drizzle/repositories/customersRepository";
import { EmailsRepository } from "../../main/data/drizzle/repositories/emailsRepository";
import { PhoneNumbersRepository } from "../../main/data/drizzle/repositories/phoneNumbersRepository";
import { CustomerService } from "../../services/customerService";
import { faker } from "@faker-js/faker";
import type { Customer } from "../../shared/types/customer/customer";
import type { PhoneNumber } from "../../shared/types/customer/phoneNumber";
import type { Email } from "../../shared/types/customer/email";

// Artık doğrudan Electron'un içinden çağrılacak saf fonksiyon
export async function seedCustomers(count = 20) { // Test için 20 idealdir, istersen 100 yap
  console.log(`⏳ Electron üzerinden ${count} adet müşteri basılıyor...`);
  
  const service = new CustomerService(
    new CustomersRepository(),
    new PhoneNumbersRepository(),
    new EmailsRepository()
  );

  for (let i = 0; i < count; i++) {
    const customer: Customer = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      nationalId: faker.string.numeric({ length: 11 }),
      taxNumber: faker.string.numeric({ length: 10 })
    };

    const phoneNumbers: PhoneNumber[] = [{
      countryCode: "+90",
      phoneNumber: faker.phone.number() 
    }];

    const emails: Email[] = [{
      customerEmail: faker.internet.email({
        firstName: customer.firstName,
        lastName: customer.lastName,
      })
    }];

    await service.createCustomer(customer, phoneNumbers, emails);
    console.log(`✅ Müşteri Eklendi: ${customer.firstName} ${customer.lastName}`);
  }

  console.log(`\n🔥 Veri basma işlemi tamamlandı!`);
}