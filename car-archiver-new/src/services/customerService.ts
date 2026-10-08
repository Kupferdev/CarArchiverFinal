import { CustomersRepository, EmailsRepository, PhoneNumbersRepository } from "../main/data/drizzle/repositories";
import { Customer } from "../shared/types/customer/customer";
import { Email } from "../shared/types/customer/email";
import { PhoneNumber } from "../shared/types/customer/phoneNumber";
import { ServiceResponse } from "../models/response.model";

export class CustomerService {
    private customerRepository: CustomersRepository;
    constructor(customerRepository: CustomersRepository, phoneNumberRepository: PhoneNumbersRepository, emailRepository: EmailsRepository) {
        this.customerRepository = customerRepository;
        void phoneNumberRepository;
        void emailRepository;
    }

    async createCustomer(customer: Customer, phoneNumber?: PhoneNumber[], email?: Email[]) {
        const response = await this.customerRepository.createWithContacts(
            customer,
            phoneNumber ?? [],
            email ?? []
        );

        if (!response.success || response.data === undefined) {
            console.error("New customer not created! Message:", response.message);
            return ServiceResponse.fail(response.message || "Customer create failed.");
        }

        return ServiceResponse.success(response.data, "Müşteri başarıyla oluşturuldu.");
    }

    async updateCustomer(customerId: number, customer: Customer) {

        if (!customerId) {
            throw new Error("CustomerId not found");
        }

        const result = await this.customerRepository.update(customerId, customer);
        if (!result.success) {
            return ServiceResponse.fail(result.message, "Customer update failed.");
        }
        return ServiceResponse.success(result, `Customer ${result.message}`);
    }

    async deleteCustomer(customerId: number) {
        if (!customerId) {
            throw new Error("CustomerId value is null");
        }

        const result = await this.customerRepository.delete(customerId);

        if (!result.success) {
            return ServiceResponse.fail(result.message, "Customer delete failed.");
        }
        return ServiceResponse.success(result.message, "Customer deleted.");
    }

    async getAllCustomer() {
        const result = await this.customerRepository.getAll();

        if (!result.success) {
            return ServiceResponse.fail(result.message || "Failed to fetch customers.");
        }

        const customers = result.data as unknown as Customer[];

        if (!customers || customers.length === 0) {
            return ServiceResponse.success([], "No customers found.");
        }

        return ServiceResponse.success(customers, "Customers retrieved successfully.");
    }

    async getByNatId(nationalId: string) {
        const result = await this.customerRepository.getByNatId(nationalId);
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result, result.message);
    }

    async getByNameSurname(firstName?: string, lastName?: string) {
        const result = await this.customerRepository.getByNameSurname(firstName, lastName);
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result, result.message);

    }
} 