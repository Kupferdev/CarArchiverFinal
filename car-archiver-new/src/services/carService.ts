import { CarsRepository } from "../main/data/drizzle/repositories";
import { ServiceResponse } from "../models/response.model";
import { Car } from "../shared/types/car";

export class CarService {
    private carRepository: CarsRepository;

    constructor(carRepository: CarsRepository) {
        this.carRepository = carRepository;
    }

    async createCar(car: Car) {
        const result = await this.carRepository.create(car);

        if (!result.success) {
            return ServiceResponse.fail("Car log create fail.", result.status);
        }
        return ServiceResponse.success(result);

    }

    async updateCar(carId: number, car: Car) {
        const result = await this.carRepository.update(carId, car);

        if (!result.success) {
            return ServiceResponse.fail("Car update fail.", result.message);
        }
        return ServiceResponse.success(result);
    }

    async deleteCar(carId: number) {
        const result = await this.carRepository.delete(carId);

        if (!result.success) {
            return ServiceResponse.fail("Car delete fail.", result.message);
        }
        return ServiceResponse.success(result);
    }

    async createOldCustomer(carId: number, oldCustomerId: number) {
        const result = await this.carRepository.addOldCustomer(carId, oldCustomerId);
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result.message);
    }

    async getOldCustomers(carId: number) {
        const result = await this.carRepository.getOldCustomers(carId);
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result);
    }

    async getAllCar() {
        const result = await this.carRepository.getAll();
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result);
    }

    async getByCustomerId(customerId: number) {
        const result = await this.carRepository.getByCustomerId(customerId);
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result);
    }

    async getByBrandId(brandId: number) {
        const result = await this.carRepository.getByBrandId(brandId);
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result);
    }

    async getByYear(year: number) {
        const result = await this.carRepository.getByYear(year);
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result);
    }

    async getByFuelType(fuelType: number) {
        const result = await this.carRepository.getByFuelType(fuelType);
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result);
    }

    async getByBodyType(bodyType: number) {
        const result = await this.carRepository.getByBodyType(bodyType);
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result);
    }

    async getByVinNumber(vinNumber: string) {
        const result = await this.carRepository.getByVinNumber(vinNumber);
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result);
    }

    async getByPlateNumber(plateNumber: string) {
        const result = await this.carRepository.getByPlateNumber(plateNumber);
        if (!result.success) {
            return ServiceResponse.fail(result.message);
        }
        return ServiceResponse.success(result);
    }

}