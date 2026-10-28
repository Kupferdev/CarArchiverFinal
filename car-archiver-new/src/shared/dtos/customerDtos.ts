export interface EmailInput {
  address: string;
  type?: string;
}

export interface PhoneInput {
  number: string;
  countryCode: string;
  type?: string;
}

export interface CreateCustomerRequest {
  firstName: string;
  lastName?: string;
  nationalId?: string;
  taxNumber?: string;
  address?: string;
  emails?: EmailInput[];
  phones?: PhoneInput[];
}

export interface UpdateCustomerRequest {
  id: number;
  data: CreateCustomerRequest;
}

export interface DeleteCustomerRequest {
  id: number;
  deleteRelated: boolean;
}

export interface BulkDeleteCustomersRequest {
  ids: number[];
  deleteRelated: boolean;
}

export interface CustomerViewDto {
  id: number;
  fullName: string;
  nationalId?: string;
  taxNumber?: string;
  address?: string;
  phones?: { countryCode: string; number: string }[];
  emails?: { address: string }[];
}
