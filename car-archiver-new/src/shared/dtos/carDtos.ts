import type { Car } from "../types/car";

export type CreateCarRequest = Omit<Car, "carId" | "oldCustomerId">;

export interface UpdateCarRequest {
  id: number;
  data: CreateCarRequest;
  oldCustomerIdToAdd?: number | null;
}
