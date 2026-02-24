import { BodyTypes } from "../schemas/bodyTypesSchema/bodyTypeSchema";
import { BaseRepository } from "./baseRepository";

export class BodyTypesRepository extends BaseRepository<typeof BodyTypes> {
  constructor() {
    super(BodyTypes, "bodyTypeId");
  }
}
