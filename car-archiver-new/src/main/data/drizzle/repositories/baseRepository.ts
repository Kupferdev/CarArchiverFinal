import { eq, getTableColumns, desc } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { drizzleDb } from "../drizzleDb";
import { IApiResponse, ServiceResponse, ResponseStatus } from "../../../../models/response.model";

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export class BaseRepository<TTable extends SQLiteTable<any>> {
  protected table: TTable;
  protected idColumn: keyof InferSelectModel<TTable>;

  constructor(table: TTable, idColumn: keyof InferSelectModel<TTable>) {
    this.table = table;
    this.idColumn = idColumn;
  }

  protected handleError<T>(error: any, defaultMessage: string): IApiResponse<T> {
    console.error("Database Error:", error);

    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
       return ServiceResponse.fail("Bu kayıt zaten mevcut.", "UNIQUE_CONSTRAINT") as any;
    }

    return ServiceResponse.error(error, defaultMessage) as any;
  }

  // --- CRUD ---

  async create(data: InferInsertModel<TTable>): Promise<IApiResponse<InferSelectModel<TTable>>> {
    try {
      const result = await drizzleDb.insert(this.table).values(data as any).returning();
      return ServiceResponse.success(result[0] as unknown as InferSelectModel<TTable>, "Created successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to create record");
    }
  }

  async getAll(options?: PaginationParams): Promise<IApiResponse<InferSelectModel<TTable>[]>> {
    try {
      let query = drizzleDb.select().from(this.table);

      // Pagination mantığı
      let totalRecords = 0; 
      // Not: Total count için ayrı bir query gerekebilir ama şimdilik basit tutalım.
      // Drizzle'da count almak için: await drizzleDb.select({ count: sql<number>`count(*)` }).from(this.table);
      
      if (options?.page && options?.pageSize) {
        const limit = options.pageSize;
        const offset = (options.page - 1) * limit;
        query.limit(limit).offset(offset);
      }
      
      // Default sıralama (ID desc)
      const columns = getTableColumns(this.table);
      // @ts-ignore
      const orderByCol = columns[this.idColumn]; 
      if(orderByCol) {
          query.orderBy(desc(orderByCol));
      }

      const result = await query;
      
      // Eğer pagination varsa successPaginated kullanabilirsin, yoksa düz success
      if (options?.page && options?.pageSize) {
         // Not: Gerçek totalRecords için count sorgusu eklenmeli. Şimdilik result.length veriyoruz.
         return ServiceResponse.successPaginated(
             result as unknown as InferSelectModel<TTable>[], 
             result.length, // Buraya gerçek count gelmeli
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
      const idCol = columns[this.idColumn as string];

      if (!idCol) throw new Error("Invalid ID Column definition");

      const result = await drizzleDb.select().from(this.table).where(eq(idCol, id));
      
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
      const idCol = columns[this.idColumn as string];

      const result = await drizzleDb.update(this.table)
        .set(data as any)
        .where(eq(idCol, id))
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
      const idCol = columns[this.idColumn as string];

      const result = await drizzleDb.delete(this.table).where(eq(idCol, id)).returning();
      
      if (result.length > 0) {
         return ServiceResponse.success(undefined, "Deleted successfully.");
      }

      return ServiceResponse.fail("Record not found to delete.", "NOT_FOUND") as any;
    } catch (err) {
      return this.handleError(err, "Failed to delete record");
    }
  }
}