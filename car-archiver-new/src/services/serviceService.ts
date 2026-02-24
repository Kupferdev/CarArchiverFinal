import { Service } from "../shared/types/service";
import { ServicesRepository } from "../main/data/drizzle/repositories";
import { ServiceResponse } from "../models/response.model";

export class ServiceService {
    private servicesRepository: ServicesRepository;

    constructor(servicesRepository: ServicesRepository) {
        this.servicesRepository = servicesRepository;
    }

    async createService(service: Service) {
        const result = await this.servicesRepository.create(service);
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result);
    }

    async updateService(serviceId: number, service: Service) {
        const result = await this.servicesRepository.update(serviceId, service);
        if (!result.success) {
            return ServiceResponse.fail("Service update fail.", result.message);
        }
        return ServiceResponse.success(result);
    }

    async deleteService(serviceId: number) {
        const result = await this.servicesRepository.delete(serviceId);
        if (!result.success) {
            return ServiceResponse.fail("Service delete fail.", result.message);
        }
        return ServiceResponse.success(result);
    }

    async getByCarId(carId: number) {
        const result = await this.servicesRepository.getByCarId(carId);
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result);
    }

    async getByCustomerId(customerId: number) {
        const result = await this.servicesRepository.getByCustomerId(customerId);
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result);
    }
}