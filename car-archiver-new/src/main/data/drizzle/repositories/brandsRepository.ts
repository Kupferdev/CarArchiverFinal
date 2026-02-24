import { Brands } from "../schemas/brandsSchema";
import { BaseRepository } from "./baseRepository";

export class BrandsRepository extends BaseRepository<typeof Brands> {
  constructor() {
    super(Brands, "brandId");
  }
}
