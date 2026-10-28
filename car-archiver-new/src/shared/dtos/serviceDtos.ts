import type { Service } from "../types/service";
import type { Part } from "../types/part";

export type CreateServiceRequest = Omit<Service, "serviceId">;

export interface ServicePartInput {
  /** Present only for an existing service part. */
  partId?: number;
  partName: string;
  quantity: number;
  /** Unit cost in kuruş, not the calculated row total. */
  unitPriceKurus: number;
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
