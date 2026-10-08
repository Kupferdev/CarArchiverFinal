import { Brand } from "../shared/types/brand";
import { BrandsRepository } from "../main/data/drizzle/repositories";
import { ServiceResponse } from "../models/response.model";

export const MAX_BRAND_NAME_LENGTH = 40;

export function normalizeBrandName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => {
      if (!word) return word;

      return word
        .split("-")
        .map((part) => {
          if (!part) return part;

          const lower = part.toLocaleLowerCase("tr-TR");
          return lower.charAt(0).toLocaleUpperCase("tr-TR") + lower.slice(1);
        })
        .join("-");
    })
    .join(" ");
}

export class BrandService {
  private brandsRepository: BrandsRepository;

  constructor(brandsRepository: BrandsRepository) {
    this.brandsRepository = brandsRepository;
  }

  async getAllBrands() {
    return await this.brandsRepository.getAll();
  }

  async createBrand(brand: Brand) {
    const normalizedName = normalizeBrandName(brand.brandName);

    if (!normalizedName) {
      return ServiceResponse.validationError([
        {
          field: "brandName",
          message: "Brand name cannot be empty.",
        },
      ]);
    }

    if (normalizedName.length > MAX_BRAND_NAME_LENGTH) {
      return ServiceResponse.validationError([
        {
          field: "brandName",
          message: `Brand name cannot exceed ${MAX_BRAND_NAME_LENGTH} characters.`,
        },
      ]);
    }

    const existing = await this.brandsRepository.findByName(normalizedName);

    if (!existing.success) {
      return existing;
    }

    if (existing.data) {
      return ServiceResponse.success(existing.data, "Brand already exists.");
    }

    return await this.brandsRepository.create({
      brandName: normalizedName,
    });
  }

  async deleteBrand(brandId: number) {
    const result = await this.brandsRepository.delete(brandId);
    if (!result.success) {
      return ServiceResponse.fail(result.message, result.code);
    }
    return result;
  }
}
