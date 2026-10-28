/** One changed-part entry belonging to one service record; not inventory. */
export interface Part {
  partId?: number;
  carId: number;
  serviceId: number;
  partName: string;
  quantity: number;
  /** Unit price in Turkish kuruş to avoid floating-point accounting errors. */
  unitPriceKurus: number;
}
