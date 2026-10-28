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

export interface ServiceMediaItem {
  mediaId: number;
  serviceId: number;
  originalName: string;
  mimeType: string;
  bytes: number;
  caption: string;
  addedAt: string;
}
export interface TrashItem { trashId:number;entityType:"customer"|"car"|"service"|"photo";label:string;deletedAt:string;count:number; }
export interface ArchiveActionResult { success: boolean; canceled?: boolean; message?: string; location?: string; folder?: string; restarting?: boolean; }

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
  complaints: string | null;
  advisorNotes?: string | null;
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
  "set-startup-language": boolean;
  "set-window-theme": boolean;
  "service-document": {success: boolean;canceled?: boolean;message?: string};
  "open-support-email": boolean;
  "list-service-media": ServiceMediaItem[];
  "add-service-media": ServiceMediaItem[];
  "read-service-media": string;
  "remove-service-media": boolean;
  "list-trash": TrashItem[];
  "restore-trash": {success:boolean;message?:string};
  "purge-trash": {success:boolean;message?:string};
  "restore-trash-batch": {success:boolean;message?:string};
  "purge-trash-batch": {success:boolean;message?:string};
  "backup-data": ArchiveActionResult;
  "restore-data": ArchiveActionResult;
  "cancel-restore-data": ArchiveActionResult;
  "confirm-restore-data": ArchiveActionResult;
  "export-data-csv": ArchiveActionResult;
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
  "delete-cars-bulk": IApiResponse<void>;
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
  "set-startup-language": string;
  "set-window-theme": "navy" | "dark" | "light" | "dim";
  "service-document": {html:string;filename:string;action:"pdf"|"print"};
  "open-support-email": {subject:string;body:string};
  "list-service-media": number;
  "add-service-media": number;
  "read-service-media": number;
  "remove-service-media": number;
  "list-trash": undefined;
  "restore-trash": number;
  "purge-trash": number;
  "restore-trash-batch": number[];
  "purge-trash-batch": number[];
  "backup-data": undefined;
  "restore-data": undefined;
  "cancel-restore-data": undefined;
  "confirm-restore-data": undefined;
  "export-data-csv": undefined;
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
  "get-all-fuel-types": string | undefined;
  "get-all-body-types": string | undefined;
  "get-all-cars": undefined;
  "get-car": number;
  "add-car": CreateCarRequest;
  "update-car": UpdateCarRequest;
  "delete-car": { id: number; deleteRelated: boolean };
  "delete-cars-bulk": { ids: number[]; deleteRelated: boolean };
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
