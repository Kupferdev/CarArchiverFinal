import { Brand } from "../shared/types/brand";
import { BrandsRepository } from "../main/data/drizzle/repositories";
import { ServiceResponse } from "../models/response.model";

export class BrandService {
    private brandsRepository: BrandsRepository;

    constructor(brandsRepository: BrandsRepository) {
        this.brandsRepository = brandsRepository;
    }

    async createBrand(brand: Brand) {
        const result = await this.brandsRepository.create(brand);
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result);
    }

    async deleteBrand(brandId: number) {
        const result = await this.brandsRepository.delete(brandId);
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result);
    }
}