import type { IApiResponse } from "../models/response.model";
import type { AppConfig } from "./types/appConfig";
import type {
  BulkDeleteCustomersRequest,
  CreateCustomerRequest,
  CustomerViewDto,
  DeleteCustomerRequest,
  UpdateCustomerRequest,
} from "./dtos/customerDtos";
import type { Customer } from "./types/customer/customer";
import type { PhoneNumber } from "./types/customer/phoneNumber";
import type { Email } from "./types/customer/email";
import type { Brand } from "./types/brand";
import type { CreateBrandRequest } from "./dtos/brandDtos";
import type { CreateCarRequest, UpdateCarRequest } from "./dtos/carDtos";
import type { Car } from "./types/car";
import type { Service } from "./types/service";
import type { Part } from "./types/part";
import type { CreateServiceWithPartsRequest, UpdateServiceWithPartsRequest, ServiceDetailsDto } from "./dtos/serviceDtos";

export interface FuelTypeOption { fuelTypeId: number; fuelTypeName: string; }
export interface BodyTypeOption { bodyTypeId: number; bodyTypeName: string; }

export interface DashboardStats {
  customers: number;
  cars: number;
  services: number;
}

export interface CustomerProfileCarDto {
  carId: number;
  customerId: number | null;
  oldCustomerId: string[] | null;
  brandId: number | null;
  model: string | null;
  year: number | null;
  vinNumber: string | null;
  plateNumber: string | null;
  km: number | null;
  fuelType: number | null;
  bodyType: number | null;
  engineVolumeCc: number | null;
  notes: string | null;
}

export interface CustomerProfileServiceDto {
  serviceId: number;
  carId: number;
  customerId: number | null;
  applicationDate: Date | null;
  appointmentDate: Date | null;
  /** Job duration in whole minutes. */
  jobDuration: number | null;
  deliveryDate: Date | null;
  km: number | null;
  complaints: string;
  extraRequests: string | null;
  faults: string[] | null;
  hasDamageOnReceive: boolean;
  damageOnReceive: string[] | null;
  hasDamageDuringRepair: boolean | null;
  damageDuringRepair: string[] | null;
  laborCharge: number | null;
  totalCharge: number | null;
  targetDeliveryDate: Date | null;
  isDelivered: boolean | null;
}

export interface CustomerProfileDto {
  customer: Customer;
  cars: CustomerProfileCarDto[];
  services: CustomerProfileServiceDto[];
  phones: PhoneNumber[];
  emails: Email[];
}

export interface CustomerEditDto {
  customer: Customer;
  phones: PhoneNumber[];
  emails: Email[];
}

export type IpcResponseMap = {
  "check-config": boolean;
  "select-directory": string | null;
  "verify-import-path": string | null;
  "setup-new-data-structure": string | null;
  "setup-imported-data": string | null;
  "save-config": boolean;
  "get-config": AppConfig | null;
  "get-dashboard-stats": DashboardStats;
  "get-all-customers": CustomerViewDto[];
  "add-customer": IApiResponse<number>;
  "get-customer-profile": IApiResponse<CustomerProfileDto | null>;
  "get-customer-edit": IApiResponse<CustomerEditDto | null>;
  "update-customer": IApiResponse<null>;
  "delete-customer": IApiResponse<null>;
  "delete-customers-bulk": IApiResponse<null>;
  "get-all-brands": IApiResponse<Brand[]>;
  "add-brand": IApiResponse<Brand | undefined>;
  "get-all-fuel-types": IApiResponse<FuelTypeOption[]>;
  "get-all-body-types": IApiResponse<BodyTypeOption[]>;
  "get-all-cars": IApiResponse<Car[]>;
  "get-car": IApiResponse<Car | undefined>;
  "add-car": IApiResponse<Car | undefined>;
  "update-car": IApiResponse<Car | undefined>;
  "delete-car": IApiResponse<void>;
  "add-old-customer": IApiResponse<string>;
  "remove-old-customer": IApiResponse<void>;
  "get-all-services": IApiResponse<Service[]>;
  "get-service": IApiResponse<ServiceDetailsDto | undefined>;
  "add-service": IApiResponse<ServiceDetailsDto | undefined>;
  "update-service": IApiResponse<ServiceDetailsDto | undefined>;
  "delete-service": IApiResponse<void>;
  "get-services-by-car": IApiResponse<Service[]>;
  "get-services-by-customer": IApiResponse<Service[]>;
  "get-parts-by-service": IApiResponse<Part[]>;
};

export type IpcRequestMap = {
  "check-config": undefined;
  "select-directory": undefined;
  "verify-import-path": string;
  "setup-new-data-structure": string;
  "setup-imported-data": string;
  "save-config": AppConfig;
  "get-config": undefined;
  "get-dashboard-stats": undefined;
  "get-all-customers": undefined;
  "add-customer": CreateCustomerRequest;
  "get-customer-profile": number;
  "get-customer-edit": number;
  "update-customer": UpdateCustomerRequest;
  "delete-customer": DeleteCustomerRequest;
  "delete-customers-bulk": BulkDeleteCustomersRequest;
  "get-all-brands": undefined;
  "add-brand": CreateBrandRequest;
  "get-all-fuel-types": undefined;
  "get-all-body-types": undefined;
  "get-all-cars": undefined;
  "get-car": number;
  "add-car": CreateCarRequest;
  "update-car": UpdateCarRequest;
  "delete-car": number;
  "add-old-customer": { carId: number; customerId: number };
  "remove-old-customer": { carId: number; customerId: number };
  "get-all-services": undefined;
  "get-service": number;
  "add-service": CreateServiceWithPartsRequest;
  "update-service": UpdateServiceWithPartsRequest;
  "delete-service": number;
  "get-services-by-car": number;
  "get-services-by-customer": number;
  "get-parts-by-service": number;
};

export interface ElectronApi {
  ipcRenderer: {
    invoke<C extends keyof IpcResponseMap>(
      channel: C,
      ...args: IpcRequestMap[C] extends undefined ? [] : [data: IpcRequestMap[C]]
    ): Promise<IpcResponseMap[C]>;
  };
}
