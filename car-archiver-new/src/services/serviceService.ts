import { Service } from "../shared/types/service";
import { Part } from "../shared/types/part";
import { PartsRepository, ServicesRepository } from "../main/data/drizzle/repositories";
import { ServiceResponse } from "../models/response.model";

export class ServiceService {
  private servicesRepository: ServicesRepository;
  private partsRepository: PartsRepository;

  constructor(servicesRepository: ServicesRepository, partsRepository: PartsRepository) {
    this.servicesRepository = servicesRepository;
    this.partsRepository = partsRepository;
  }

  async createService(service: Service, parts: Part[] = []) {
    const serviceResult = await this.servicesRepository.create(service);
    if (!serviceResult.success || !serviceResult.data) return serviceResult;

    const createdParts: Part[] = [];
    for (const part of parts) {
      const result = await this.partsRepository.create({ ...part, serviceId: serviceResult.data.serviceId });
      if (!result.success || !result.data) {
        for (const created of createdParts) {
          if (created.partId) await this.partsRepository.delete(created.partId);
        }
        await this.servicesRepository.delete(serviceResult.data.serviceId);
        return ServiceResponse.error(new Error(result.message), "Service and parts could not be created together.");
      }
      createdParts.push(result.data as Part);
    }

    return ServiceResponse.success({ service: serviceResult.data as Service, parts: createdParts }, "Service created successfully.");
  }

  async updateService(serviceId: number, service: Service, parts: Part[] = []) {
    const serviceResult = await this.servicesRepository.update(serviceId, service);
    if (!serviceResult.success || !serviceResult.data) return serviceResult;

    const oldParts = await this.partsRepository.getByServiceId(serviceId);
    if (!oldParts.success) return ServiceResponse.error(new Error(oldParts.message), "Service parts could not be loaded.");

    const deletedParts = await this.partsRepository.deleteByServiceId(serviceId);
    if (!deletedParts.success) return ServiceResponse.error(new Error(deletedParts.message), "Service parts could not be replaced.");

    const createdParts: Part[] = [];
    for (const part of parts) {
      const result = await this.partsRepository.create(part);
      if (!result.success || !result.data) {
        for (const created of createdParts) if (created.partId) await this.partsRepository.delete(created.partId);
        for (const old of oldParts.data ?? []) {
          await this.partsRepository.create({
            carId: old.carId,
            serviceId: old.serviceId,
            partName: old.partName,
            partTax: old.partTax,
            partPrice: old.partPrice,
          });
        }
        return ServiceResponse.error(new Error(result.message), "Service parts could not be updated.");
      }
      createdParts.push(result.data as Part);
    }

    return ServiceResponse.success({ service: serviceResult.data as Service, parts: createdParts }, "Service updated successfully.");
  }

  async deleteService(serviceId: number) {
    const partsResult = await this.partsRepository.deleteByServiceId(serviceId);
    if (!partsResult.success) return partsResult;
    return this.servicesRepository.delete(serviceId);
  }

  async getDetails(serviceId: number) {
    const serviceResult = await this.servicesRepository.getById(serviceId);
    if (!serviceResult.success || !serviceResult.data) return serviceResult;
    const partsResult = await this.partsRepository.getByServiceId(serviceId);
    if (!partsResult.success) return ServiceResponse.error(new Error(partsResult.message), "Service parts could not be loaded.");
    return ServiceResponse.success({ service: serviceResult.data as Service, parts: (partsResult.data ?? []) as Part[] }, "Service details fetched successfully.");
  }

  async getAll() { return this.servicesRepository.getAll(); }
  async getByCarId(carId: number) { return this.servicesRepository.getByCarId(carId); }
  async getByCustomerId(customerId: number) { return this.servicesRepository.getByCustomerId(customerId); }
  async getPartsByService(serviceId: number) { return this.partsRepository.getByServiceId(serviceId); }
}
