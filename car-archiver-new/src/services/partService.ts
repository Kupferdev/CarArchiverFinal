import { PartsRepository } from "../main/data/drizzle/repositories";
import { ServiceResponse } from "../models/response.model";
import { Part } from "../shared/types/part";

export class PartService {
    private partsRepository: PartsRepository;

    constructor(partsRepository: PartsRepository) {
        this.partsRepository = partsRepository;
    }

    /*
    async createParts(parts: Part[]) {
        let addedParts: Part[] = [];
        let errorParts: Part[] = [];
        try {
            if (!parts) throw new Error("Parts list not null");

            for (const part of parts) {
                const result = await this.partsRepository.create(part);

                if (result.success) {
                    addedParts.push(result.data as unknown as Part);
                } else { errorParts.push(result.data as unknown as Part); }
            }

        } catch (error) {
            return ServiceResponse.error(error);
        }

        if(addedParts.length === parts.length){
            return ServiceResponse.success(addedParts, "Parts added successfully.");
        }

    } */

    async createParts(parts: Part[]) {
        let addedParts: Part[] = [];
        let errorParts: Part[] = [];

        try {
            if (!parts || parts.length === 0) throw new Error("Parts list cannot be empty");

            for (const part of parts) {
                const result = await this.partsRepository.create(part);

                if (result.success && result.data) {
                    addedParts.push(result.data as unknown as Part);
                } else {
                    errorParts.push(part);
                }
            }
        } catch (error) {
            return ServiceResponse.error(error, "System error while creating parts.");
        }


        if (addedParts.length === parts.length) {
            return ServiceResponse.success(addedParts, "All parts added successfully.");
        }

        if (addedParts.length === 0) {
            return ServiceResponse.fail("No parts could be added.");
        }

        return ServiceResponse.success(
            addedParts,
            `Process completed with warnings. ${addedParts.length} added, ${errorParts.length} failed.`
        );
    }

    async updatePart(part: Part) {

        if (!part.partId) {
            return ServiceResponse.fail("PartId not found.");
        }

        const result = await this.partsRepository.update(part.partId, part)

        if (!result.success) {
            return ServiceResponse.error("Part update fail.")

        }
        return ServiceResponse.success(result.data, "Part updated.");
    }

    async deletePart(partId: number) {
        const result = await this.partsRepository.delete(partId);
        if (!result.success) {
            return ServiceResponse.error("Part delete error.")
        }
        return ServiceResponse.success((await result).message)
    }

    async getByCarId(carId: number) {
        const result = await this.partsRepository.getByCarId(carId);
        if (!result.success) {
            return ServiceResponse.fail(result.message)
        }
        return ServiceResponse.success(result.data, result.message);
    }

    async getByServiceId(serviceId: number) {
        const result = await this.partsRepository.getByServiceId(serviceId);
        if (!result.success) {
            return ServiceResponse.fail(result.message)
        }
        return ServiceResponse.success(result.data, result.message);
    }

    async getByCarAndService(carId: number, serviceId: number) {
        const result = await this.partsRepository.getByCarAndService(carId, serviceId);
        if (!result.success) {
            return ServiceResponse.fail(result.message)
        }
        return ServiceResponse.success(result.data, result.message);

    }

}
