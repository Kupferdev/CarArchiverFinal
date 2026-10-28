export interface Car {
  carId?: number;
  customerId: number | null;
  oldCustomerId?: string[] | null;
  brandId?: number | null;
  model?: string | null;
  year?: number | null;
  vinNumber?: string | null;
  plateNumber?: string | null;
  km?: number | null;
  fuelType?: number | null;
  bodyType?: number | null;
  engineVolumeCc?: number | null;
  notes?: string | null;
}
