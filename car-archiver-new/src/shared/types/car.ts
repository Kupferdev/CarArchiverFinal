export interface Car {

    carId?: number,

    customerId: number,
    oldCustomerId?: string[] | null,
    brand?: number | null,
    model?: number | null,
    year?: number | null,
    vinNumber?: string | null,
    plateNumber?: string | null,
    km?: number | null ,            //Km-mile convertion

    fuelType?: number | null,
    bodyType?: number | null;

}