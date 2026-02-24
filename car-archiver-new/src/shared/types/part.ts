export interface Part {

    partId?: number,
    carId: number,
    serviceId: number,
    partName: string,
    partTax?: number | null,
    partPrice?: number | null;

}