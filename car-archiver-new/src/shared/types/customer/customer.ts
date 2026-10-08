export interface Customer {
  customerId?: number;
  nationalId?: string | null;
  firstName: string;
  lastName?: string | null;
  taxNumber?: string | null;
}
