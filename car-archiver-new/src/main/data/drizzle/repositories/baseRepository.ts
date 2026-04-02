import { eq, getTableColumns, desc, sql } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
// 1. KRİTİK DEĞİŞİKLİK: Doğrudan değişken yerine fonksiyonu alıyoruz
import { useDb } from "../drizzleDb"; 
import { IApiResponse, ServiceResponse } from "../../../../models/response.model";

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export class BaseRepository<TTable extends SQLiteTable<any>> {
  protected table: TTable;
  protected idColumn: string; // Tip güvenliği için string olarak tutmak daha esnek

  constructor(table: TTable, idColumn: string) {
    this.table = table;
    this.idColumn = idColumn;
  }

  protected handleError<T>(error: any, defaultMessage: string): IApiResponse<T> {
    console.error("❌ Database Error:", error);

    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
       return ServiceResponse.fail("This record already exists.", "UNIQUE_CONSTRAINT") as any;
    }

    if (error.message?.includes("not been initialized")) {
        return ServiceResponse.error(error, "Database connection is not ready.") as any;
    }

    return ServiceResponse.error(error, defaultMessage) as any;
  }

  // --- CRUD ---

  async create(data: InferInsertModel<TTable>): Promise<IApiResponse<InferSelectModel<TTable>>> {
    try {
      // useDb() çağrısı burada güvenliği sağlar
      const result = await useDb()
        .insert(this.table)
        .values(data as any)
        .returning();

      return ServiceResponse.success(result[0] as unknown as InferSelectModel<TTable>, "Created successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to create record");
    }
  }

  async getAll(options?: PaginationParams): Promise<IApiResponse<InferSelectModel<TTable>[]>> {
    try {
      const db = useDb();
      // Sorguyu dinamik olarak oluşturabilmek için $dynamic() kullanıyoruz
      let query = db.select().from(this.table).$dynamic();
      
      if (options?.page && options?.pageSize) {
        const limit = options.pageSize;
        const offset = (options.page - 1) * limit;
        query.limit(limit).offset(offset);
      }
      
      const columns = getTableColumns(this.table);
      const orderByCol = columns[this.idColumn]; 
      
      if(orderByCol) {
          query.orderBy(desc(orderByCol));
      }

      const result = await query;
      
      if (options?.page && options?.pageSize) {
         // Buraya ileride gerçek count sorgusu eklenebilir
         return ServiceResponse.successPaginated(
             result as unknown as InferSelectModel<TTable>[], 
             result.length, 
             options.page, 
             options.pageSize
         );
      }

      return ServiceResponse.success(result as unknown as InferSelectModel<TTable>[], "Fetched records.");
    } catch (err) {
      return this.handleError(err, "Failed to fetch records");
    }
  }

  async getById(id: number): Promise<IApiResponse<InferSelectModel<TTable> | undefined>> {
    try {
      const columns = getTableColumns(this.table);
      const idCol = columns[this.idColumn];

      if (!idCol) throw new Error(`Invalid ID Column definition: ${this.idColumn}`);

      const result = await useDb()
        .select()
        .from(this.table)
        .where(eq(idCol, id as any));
      
      if (result[0]) {
        return ServiceResponse.success(result[0] as unknown as InferSelectModel<TTable>, "Record found.");
      }
      
      return ServiceResponse.fail("Record not found.", "NOT_FOUND") as any;
    } catch (err) {
      return this.handleError(err, "Failed to fetch record");
    }
  }

  async update(id: number, data: Partial<InferInsertModel<TTable>>): Promise<IApiResponse<InferSelectModel<TTable> | undefined>> {
    try {
      const columns = getTableColumns(this.table);
      const idCol = columns[this.idColumn];

      const result = await useDb()
        .update(this.table)
        .set(data as any)
        .where(eq(idCol, id as any))
        .returning();

      if (result[0]) {
        return ServiceResponse.success(result[0] as unknown as InferSelectModel<TTable>, "Updated successfully.");
      }

      return ServiceResponse.fail("Record not found to update.", "NOT_FOUND") as any;
    } catch (err) {
      return this.handleError(err, "Failed to update record");
    }
  }

  async delete(id: number): Promise<IApiResponse<void>> {
    try {
      const columns = getTableColumns(this.table);
      const idCol = columns[this.idColumn];

      const result = await useDb()
        .delete(this.table)
        .where(eq(idCol, id as any))
        .returning();
      
      if (result.length > 0) {
         return ServiceResponse.success(undefined, "Deleted successfully.");
      }

      return ServiceResponse.fail("Record not found to delete.", "NOT_FOUND") as any;
    } catch (err) {
      return this.handleError(err, "Failed to delete record");
    }
  }
}