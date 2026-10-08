import type { Service } from "../types/service";
import type { Part } from "../types/part";

export type CreateServiceRequest = Omit<Service, "serviceId">;

export interface ServicePartInput {
  partName: string;
  partTax?: number | null;
  partPrice?: number | null;
}

export interface CreateServiceWithPartsRequest {
  service: CreateServiceRequest;
  parts: ServicePartInput[];
}

export interface UpdateServiceWithPartsRequest {
  id: number;
  service: CreateServiceRequest;
  parts: ServicePartInput[];
}

export interface ServiceDetailsDto {
  service: Service;
  parts: Part[];
}
