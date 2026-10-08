export interface Service {
  serviceId?: number;
  carId: number;
  customerId?: number | null;

  applicationDate?: Date | null;
  appointmentDate?: Date | null;
  /** Job duration in whole minutes. */
  jobDuration?: number | null;
  deliveryDate?: Date | null;
  km?: number | null;
  complaints: string;
  extraRequests?: string | null;
  faults?: string[] | null;
  hasDamageOnReceive: boolean;
  damageOnReceive?: string[] | null;
  hasDamageDuringRepair?: boolean | null;
  damageDuringRepair?: string[] | null;

  laborCharge?: number | null;
  totalCharge?: number | null;
  targetDeliveryDate?: Date | null;
  isDelivered?: boolean | null;
}
