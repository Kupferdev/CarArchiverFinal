import { CustomersRepository, EmailsRepository, PhoneNumbersRepository } from "../../main/data/drizzle/repositories";
import { CustomerService } from "../../services/customerService";
import { faker } from "@faker-js/faker";
import type { Customer } from "../../shared/types/customer/customer";
import type { PhoneNumber } from "../../shared/types/customer/phoneNumber";
import type { Email } from "../../shared/types/customer/email";


async function populateCustomers(count = 100) {
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

    const phoneNumbers: PhoneNumber[] = Array.from(
      { length: faker.number.int({ min: 1, max: 2 }) },
      () => ({
        countryCode: "+90",
        phoneNumber: faker.phone.number() // artık mask parametresi yok
      })
    );

    const emails: Email[] = Array.from(
      { length: faker.number.int({ min: 1, max: 2 }) },
      () => ({
        customerEmail: faker.internet.email({
          firstName: customer.firstName,
          lastName: customer.lastName,
        })
      })
    );

    await service.createCustomer(customer, phoneNumbers, emails);
    console.log(`✅ ${i + 1}. müşteri eklendi: ${customer.firstName} ${customer.lastName}`);
  }

  console.log(`\n🔥 ${count} müşteri başarıyla eklendi!`);
}

populateCustomers().catch((err) => {
  console.error("Populate hata:", err);
  process.exit(1);
});
