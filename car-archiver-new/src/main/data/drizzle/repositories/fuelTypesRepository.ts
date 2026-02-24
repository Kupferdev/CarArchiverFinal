import { FuelTypes } from "../schemas/fuelTypesSchema/fuelTypeSchema";
import { BaseRepository } from "./baseRepository";

export class FuelTypesRepository extends BaseRepository<typeof FuelTypes> {
  constructor() {
    super(FuelTypes, "fuelTypeId");
  }
}
