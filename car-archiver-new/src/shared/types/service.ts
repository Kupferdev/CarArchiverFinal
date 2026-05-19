export interface Service {

    serviceId?: number,
    carId: number,
    customerId?: number,

    applicationDate?: Date, //basvuru tarihi
    appointmentDate?: Date, //randevu tarihi
    jobDuration?: Date,
    deliveryDate?: Date,
    km? : number,
    complaints: string, //sikayetler
    extraRequests?: string,
    faults?: string[],   //arızalar
    hasDamageOnReceive: boolean,
    damageOnReceive?: string[],
    hasDamageDuringRepair?: boolean,
    damageDuringRepair?: string[],
    laborCharge?: number, //iscilik
    totalCharge?: number;

    targetDeliveryDate? : Date; //hedeflenen teslim tarihi
    isDelivered? : boolean; //teslim edildi mi
}