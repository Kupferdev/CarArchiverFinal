import { eq, getTableColumns, desc, sql } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { useDb } from "../drizzleDb";
import { IApiResponse, ServiceResponse } from "../../../../models/response.model";

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export class BaseRepository<TTable extends SQLiteTable<any>> {
  protected table: TTable;
  protected idColumn: string;

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

  async create(data: InferInsertModel<TTable>): Promise<IApiResponse<InferSelectModel<TTable>>> {
    try {
      const result = await useDb()
        .insert(this.table)
        .values(data as any)
        .returning();

      return ServiceResponse.success(result[0] as unknown as InferSelectModel<TTable>, "Created successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to create record.");
    }
  }

  async getAll(options?: PaginationParams): Promise<IApiResponse<InferSelectModel<TTable>[]>> {
    try {
      const db = useDb();
      let query = db.select().from(this.table).$dynamic();

      const columns = getTableColumns(this.table);
      const orderByCol = columns[this.idColumn];

      if (orderByCol) {
        query = query.orderBy(desc(orderByCol));
      }

      if (options?.page && options?.pageSize) {
        const limit = options.pageSize;
        const offset = (options.page - 1) * limit;
        query = query.limit(limit).offset(offset);

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(this.table);
        const totalRecords = Number(countResult[0].count);

        const result = await query;
        return ServiceResponse.successPaginated(
          result as unknown as InferSelectModel<TTable>[],
          totalRecords,
          options.page,
          options.pageSize
        );
      }

      const result = await query;
      return ServiceResponse.success(result as unknown as InferSelectModel<TTable>[], "Records fetched.");
    } catch (err) {
      return this.handleError(err, "Failed to fetch records.");
    }
  }

  async getById(id: number): Promise<IApiResponse<InferSelectModel<TTable> | undefined>> {
    try {
      const columns = getTableColumns(this.table);
      const idCol = columns[this.idColumn];

      if (!idCol) throw new Error(`Invalid ID column: ${this.idColumn}`);

      const result = await useDb()
        .select()
        .from(this.table)
        .where(eq(idCol, id as any));

      if (result[0]) {
        return ServiceResponse.success(result[0] as unknown as InferSelectModel<TTable>, "Record found.");
      }

      return ServiceResponse.fail("Record not found.", "NOT_FOUND") as any;
    } catch (err) {
      return this.handleError(err, "Failed to fetch record.");
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

      return ServiceResponse.fail("Record not found.", "NOT_FOUND") as any;
    } catch (err) {
      return this.handleError(err, "Failed to update record.");
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

      return ServiceResponse.fail("Record not found.", "NOT_FOUND") as any;
    } catch (err) {
      return this.handleError(err, "Failed to delete record.");
    }
  }

  async count(): Promise<IApiResponse<number>> {
    try {
      const result = await useDb()
        .select({ count: sql<number>`count(*)` })
        .from(this.table);
        
      const total = Number(result[0].count);
      
      return ServiceResponse.success(total, "Count fetched successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to fetch count.");
    }
  }

}