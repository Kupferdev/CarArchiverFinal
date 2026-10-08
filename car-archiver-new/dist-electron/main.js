var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S, _T, _U, _V, _W, _X, _Y, _Z, __, _$, _aa, _ba, _ca, _da, _ea, _fa, _ga, _ha, _ia, _ja, _ka, _la, _ma, _na, _oa, _pa, _qa, _ra, _sa, _ta, _ua, _va, _wa, _xa, _ya, _za, _Aa, _Ba, _Ca, _Da, _Ea, _Fa, _Ga, _Ha, _Ia, _Ja, _Ka, _La, _Ma, _Na, _Oa, _Pa, _Qa, _Ra, _Sa, _Ta, _Ua, _Va, _Wa, _Xa, _Ya, _Za, __a, _$a, _ab, _bb, _cb, _db, _eb, _fb, _gb, _hb, _ib, _jb, _kb, _lb, _mb, _nb, _ob, _pb, _qb, _rb, _sb, _tb, _ub, _vb, _wb, _xb, _yb, _zb, _Ab, _Bb, _Cb, _Db, _Eb, _Fb, _Gb, _Hb, _Ib, _Jb, _Kb, _Lb, _Mb, _Nb, _Ob, _Pb, _Qb, _Rb, _Sb, _Tb, _Ub, _Vb, _Wb, _Xb, _Yb, _Zb, __b, _$b, _ac, _bc, _cc;
import { app, ipcMain, dialog, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import fs$1 from "node:fs";
import fs from "fs";
import path from "path";
import Client from "better-sqlite3";
import { execFile } from "child_process";
let dbInstance = null;
let activeDbPath = null;
function normalizeDbPath(dbPath) {
  return path.normalize(path.resolve(dbPath));
}
function CreateDefaultDb(dbPath) {
  const dbPathFinal = normalizeDbPath(dbPath);
  if (dbInstance) {
    if (activeDbPath === dbPathFinal) {
      return dbInstance;
    }
    throw new Error("A different database is already open. Close the current database before switching.");
  }
  try {
    const folder = path.dirname(dbPathFinal);
    fs.mkdirSync(folder, { recursive: true });
    const instance = new Client(dbPathFinal);
    instance.pragma("journal_mode = WAL");
    instance.pragma("synchronous = NORMAL");
    instance.pragma("foreign_keys = ON");
    dbInstance = instance;
    activeDbPath = dbPathFinal;
    console.log("❇️ DB Started:", dbPathFinal);
    return instance;
  } catch (err) {
    console.error("🆘 DB Error:", err);
    throw err;
  }
}
function closeDb() {
  if (!dbInstance) return;
  dbInstance.close();
  dbInstance = null;
  activeDbPath = null;
  console.log("🔒 DB connection closed.");
}
function getDb() {
  if (!dbInstance) {
    throw new Error("SQLite engine has not been initialized yet! Please call CreateDefaultDb() first.");
  }
  return dbInstance;
}
const entityKind = Symbol.for("drizzle:entityKind");
function is(value, type) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (value instanceof type) {
    return true;
  }
  if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
    throw new Error(
      `Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`
    );
  }
  let cls = Object.getPrototypeOf(value).constructor;
  if (cls) {
    while (cls) {
      if (entityKind in cls && cls[entityKind] === type[entityKind]) {
        return true;
      }
      cls = Object.getPrototypeOf(cls);
    }
  }
  return false;
}
_a = entityKind;
class ConsoleLogWriter {
  write(message) {
    console.log(message);
  }
}
__publicField(ConsoleLogWriter, _a, "ConsoleLogWriter");
_b = entityKind;
class DefaultLogger {
  constructor(config) {
    __publicField(this, "writer");
    this.writer = (config == null ? void 0 : config.writer) ?? new ConsoleLogWriter();
  }
  logQuery(query, params) {
    const stringifiedParams = params.map((p) => {
      try {
        return JSON.stringify(p);
      } catch {
        return String(p);
      }
    });
    const paramsStr = stringifiedParams.length ? ` -- params: [${stringifiedParams.join(", ")}]` : "";
    this.writer.write(`Query: ${query}${paramsStr}`);
  }
}
__publicField(DefaultLogger, _b, "DefaultLogger");
_c = entityKind;
class NoopLogger {
  logQuery() {
  }
}
__publicField(NoopLogger, _c, "NoopLogger");
const TableName = Symbol.for("drizzle:Name");
const Schema = Symbol.for("drizzle:Schema");
const Columns = Symbol.for("drizzle:Columns");
const ExtraConfigColumns = Symbol.for("drizzle:ExtraConfigColumns");
const OriginalName = Symbol.for("drizzle:OriginalName");
const BaseName = Symbol.for("drizzle:BaseName");
const IsAlias = Symbol.for("drizzle:IsAlias");
const ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder");
const IsDrizzleTable = Symbol.for("drizzle:IsDrizzleTable");
_m = entityKind, _l = TableName, _k = OriginalName, _j = Schema, _i = Columns, _h = ExtraConfigColumns, _g = BaseName, _f = IsAlias, _e = IsDrizzleTable, _d = ExtraConfigBuilder;
class Table {
  constructor(name, schema, baseName) {
    /**
     * @internal
     * Can be changed if the table is aliased.
     */
    __publicField(this, _l);
    /**
     * @internal
     * Used to store the original name of the table, before any aliasing.
     */
    __publicField(this, _k);
    /** @internal */
    __publicField(this, _j);
    /** @internal */
    __publicField(this, _i);
    /** @internal */
    __publicField(this, _h);
    /**
     *  @internal
     * Used to store the table name before the transformation via the `tableCreator` functions.
     */
    __publicField(this, _g);
    /** @internal */
    __publicField(this, _f, false);
    /** @internal */
    __publicField(this, _e, true);
    /** @internal */
    __publicField(this, _d);
    this[TableName] = this[OriginalName] = name;
    this[Schema] = schema;
    this[BaseName] = baseName;
  }
}
__publicField(Table, _m, "Table");
/** @internal */
__publicField(Table, "Symbol", {
  Name: TableName,
  Schema,
  OriginalName,
  Columns,
  ExtraConfigColumns,
  BaseName,
  IsAlias,
  ExtraConfigBuilder
});
function getTableName(table) {
  return table[TableName];
}
function getTableUniqueName(table) {
  return `${table[Schema] ?? "public"}.${table[TableName]}`;
}
_n = entityKind;
class Column {
  constructor(table, config) {
    __publicField(this, "name");
    __publicField(this, "keyAsName");
    __publicField(this, "primary");
    __publicField(this, "notNull");
    __publicField(this, "default");
    __publicField(this, "defaultFn");
    __publicField(this, "onUpdateFn");
    __publicField(this, "hasDefault");
    __publicField(this, "isUnique");
    __publicField(this, "uniqueName");
    __publicField(this, "uniqueType");
    __publicField(this, "dataType");
    __publicField(this, "columnType");
    __publicField(this, "enumValues");
    __publicField(this, "generated");
    __publicField(this, "generatedIdentity");
    __publicField(this, "config");
    this.table = table;
    this.config = config;
    this.name = config.name;
    this.keyAsName = config.keyAsName;
    this.notNull = config.notNull;
    this.default = config.default;
    this.defaultFn = config.defaultFn;
    this.onUpdateFn = config.onUpdateFn;
    this.hasDefault = config.hasDefault;
    this.primary = config.primaryKey;
    this.isUnique = config.isUnique;
    this.uniqueName = config.uniqueName;
    this.uniqueType = config.uniqueType;
    this.dataType = config.dataType;
    this.columnType = config.columnType;
    this.generated = config.generated;
    this.generatedIdentity = config.generatedIdentity;
  }
  mapFromDriverValue(value) {
    return value;
  }
  mapToDriverValue(value) {
    return value;
  }
  // ** @internal */
  shouldDisableInsert() {
    return this.config.generated !== void 0 && this.config.generated.type !== "byDefault";
  }
}
__publicField(Column, _n, "Column");
_o = entityKind;
class ColumnBuilder {
  constructor(name, dataType, columnType) {
    __publicField(this, "config");
    /**
     * Alias for {@link $defaultFn}.
     */
    __publicField(this, "$default", this.$defaultFn);
    /**
     * Alias for {@link $onUpdateFn}.
     */
    __publicField(this, "$onUpdate", this.$onUpdateFn);
    this.config = {
      name,
      keyAsName: name === "",
      notNull: false,
      default: void 0,
      hasDefault: false,
      primaryKey: false,
      isUnique: false,
      uniqueName: void 0,
      uniqueType: void 0,
      dataType,
      columnType,
      generated: void 0
    };
  }
  /**
   * Changes the data type of the column. Commonly used with `json` columns. Also, useful for branded types.
   *
   * @example
   * ```ts
   * const users = pgTable('users', {
   * 	id: integer('id').$type<UserId>().primaryKey(),
   * 	details: json('details').$type<UserDetails>().notNull(),
   * });
   * ```
   */
  $type() {
    return this;
  }
  /**
   * Adds a `not null` clause to the column definition.
   *
   * Affects the `select` model of the table - columns *without* `not null` will be nullable on select.
   */
  notNull() {
    this.config.notNull = true;
    return this;
  }
  /**
   * Adds a `default <value>` clause to the column definition.
   *
   * Affects the `insert` model of the table - columns *with* `default` are optional on insert.
   *
   * If you need to set a dynamic default value, use {@link $defaultFn} instead.
   */
  default(value) {
    this.config.default = value;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Adds a dynamic default value to the column.
   * The function will be called when the row is inserted, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $defaultFn(fn) {
    this.config.defaultFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Adds a dynamic update value to the column.
   * The function will be called when the row is updated, and the returned value will be used as the column value if none is provided.
   * If no `default` (or `$defaultFn`) value is provided, the function will be called when the row is inserted as well, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $onUpdateFn(fn) {
    this.config.onUpdateFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Adds a `primary key` clause to the column definition. This implicitly makes the column `not null`.
   *
   * In SQLite, `integer primary key` implicitly makes the column auto-incrementing.
   */
  primaryKey() {
    this.config.primaryKey = true;
    this.config.notNull = true;
    return this;
  }
  /** @internal Sets the name of the column to the key within the table definition if a name was not given. */
  setName(name) {
    if (this.config.name !== "") return;
    this.config.name = name;
  }
}
__publicField(ColumnBuilder, _o, "ColumnBuilder");
const isPgEnumSym = Symbol.for("drizzle:isPgEnum");
function isPgEnum(obj) {
  return !!obj && typeof obj === "function" && isPgEnumSym in obj && obj[isPgEnumSym] === true;
}
_p = entityKind;
class Subquery {
  constructor(sql2, fields, alias, isWith = false, usedTables = []) {
    this._ = {
      brand: "Subquery",
      sql: sql2,
      selectedFields: fields,
      alias,
      isWith,
      usedTables
    };
  }
  // getSQL(): SQL<unknown> {
  // 	return new SQL([this]);
  // }
}
__publicField(Subquery, _p, "Subquery");
class WithSubquery extends (_r = Subquery, _q = entityKind, _r) {
}
__publicField(WithSubquery, _q, "WithSubquery");
const tracer = {
  startActiveSpan(name, fn) {
    {
      return fn();
    }
  }
};
const ViewBaseConfig = Symbol.for("drizzle:ViewBaseConfig");
function isSQLWrapper(value) {
  return value !== null && value !== void 0 && typeof value.getSQL === "function";
}
function mergeQueries(queries) {
  var _a2;
  const result = { sql: "", params: [] };
  for (const query of queries) {
    result.sql += query.sql;
    result.params.push(...query.params);
    if ((_a2 = query.typings) == null ? void 0 : _a2.length) {
      if (!result.typings) {
        result.typings = [];
      }
      result.typings.push(...query.typings);
    }
  }
  return result;
}
_s = entityKind;
class StringChunk {
  constructor(value) {
    __publicField(this, "value");
    this.value = Array.isArray(value) ? value : [value];
  }
  getSQL() {
    return new SQL([this]);
  }
}
__publicField(StringChunk, _s, "StringChunk");
_t = entityKind;
const _SQL = class _SQL {
  constructor(queryChunks) {
    /** @internal */
    __publicField(this, "decoder", noopDecoder);
    __publicField(this, "shouldInlineParams", false);
    /** @internal */
    __publicField(this, "usedTables", []);
    this.queryChunks = queryChunks;
    for (const chunk of queryChunks) {
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        this.usedTables.push(
          schemaName === void 0 ? chunk[Table.Symbol.Name] : schemaName + "." + chunk[Table.Symbol.Name]
        );
      }
    }
  }
  append(query) {
    this.queryChunks.push(...query.queryChunks);
    return this;
  }
  toQuery(config) {
    return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
      const query = this.buildQueryFromSourceParams(this.queryChunks, config);
      span == null ? void 0 : span.setAttributes({
        "drizzle.query.text": query.sql,
        "drizzle.query.params": JSON.stringify(query.params)
      });
      return query;
    });
  }
  buildQueryFromSourceParams(chunks, _config) {
    const config = Object.assign({}, _config, {
      inlineParams: _config.inlineParams || this.shouldInlineParams,
      paramStartIndex: _config.paramStartIndex || { value: 0 }
    });
    const {
      casing,
      escapeName,
      escapeParam,
      prepareTyping,
      inlineParams,
      paramStartIndex
    } = config;
    return mergeQueries(chunks.map((chunk) => {
      var _a2;
      if (is(chunk, StringChunk)) {
        return { sql: chunk.value.join(""), params: [] };
      }
      if (is(chunk, Name)) {
        return { sql: escapeName(chunk.value), params: [] };
      }
      if (chunk === void 0) {
        return { sql: "", params: [] };
      }
      if (Array.isArray(chunk)) {
        const result = [new StringChunk("(")];
        for (const [i, p] of chunk.entries()) {
          result.push(p);
          if (i < chunk.length - 1) {
            result.push(new StringChunk(", "));
          }
        }
        result.push(new StringChunk(")"));
        return this.buildQueryFromSourceParams(result, config);
      }
      if (is(chunk, _SQL)) {
        return this.buildQueryFromSourceParams(chunk.queryChunks, {
          ...config,
          inlineParams: inlineParams || chunk.shouldInlineParams
        });
      }
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        const tableName = chunk[Table.Symbol.Name];
        return {
          sql: schemaName === void 0 || chunk[IsAlias] ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
          params: []
        };
      }
      if (is(chunk, Column)) {
        const columnName = casing.getColumnCasing(chunk);
        if (_config.invokeSource === "indexes") {
          return { sql: escapeName(columnName), params: [] };
        }
        const schemaName = chunk.table[Table.Symbol.Schema];
        return {
          sql: chunk.table[IsAlias] || schemaName === void 0 ? escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName) : escapeName(schemaName) + "." + escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName),
          params: []
        };
      }
      if (is(chunk, View)) {
        const schemaName = chunk[ViewBaseConfig].schema;
        const viewName = chunk[ViewBaseConfig].name;
        return {
          sql: schemaName === void 0 || chunk[ViewBaseConfig].isAlias ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
          params: []
        };
      }
      if (is(chunk, Param)) {
        if (is(chunk.value, Placeholder)) {
          return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
        }
        const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
        if (is(mappedValue, _SQL)) {
          return this.buildQueryFromSourceParams([mappedValue], config);
        }
        if (inlineParams) {
          return { sql: this.mapInlineParam(mappedValue, config), params: [] };
        }
        let typings = ["none"];
        if (prepareTyping) {
          typings = [prepareTyping(chunk.encoder)];
        }
        return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
      }
      if (is(chunk, Placeholder)) {
        return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
      }
      if (is(chunk, _SQL.Aliased) && chunk.fieldAlias !== void 0) {
        return { sql: escapeName(chunk.fieldAlias), params: [] };
      }
      if (is(chunk, Subquery)) {
        if (chunk._.isWith) {
          return { sql: escapeName(chunk._.alias), params: [] };
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk._.sql,
          new StringChunk(") "),
          new Name(chunk._.alias)
        ], config);
      }
      if (isPgEnum(chunk)) {
        if (chunk.schema) {
          return { sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName), params: [] };
        }
        return { sql: escapeName(chunk.enumName), params: [] };
      }
      if (isSQLWrapper(chunk)) {
        if ((_a2 = chunk.shouldOmitSQLParens) == null ? void 0 : _a2.call(chunk)) {
          return this.buildQueryFromSourceParams([chunk.getSQL()], config);
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk.getSQL(),
          new StringChunk(")")
        ], config);
      }
      if (inlineParams) {
        return { sql: this.mapInlineParam(chunk, config), params: [] };
      }
      return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
    }));
  }
  mapInlineParam(chunk, { escapeString }) {
    if (chunk === null) {
      return "null";
    }
    if (typeof chunk === "number" || typeof chunk === "boolean") {
      return chunk.toString();
    }
    if (typeof chunk === "string") {
      return escapeString(chunk);
    }
    if (typeof chunk === "object") {
      const mappedValueAsString = chunk.toString();
      if (mappedValueAsString === "[object Object]") {
        return escapeString(JSON.stringify(chunk));
      }
      return escapeString(mappedValueAsString);
    }
    throw new Error("Unexpected param value: " + chunk);
  }
  getSQL() {
    return this;
  }
  as(alias) {
    if (alias === void 0) {
      return this;
    }
    return new _SQL.Aliased(this, alias);
  }
  mapWith(decoder) {
    this.decoder = typeof decoder === "function" ? { mapFromDriverValue: decoder } : decoder;
    return this;
  }
  inlineParams() {
    this.shouldInlineParams = true;
    return this;
  }
  /**
   * This method is used to conditionally include a part of the query.
   *
   * @param condition - Condition to check
   * @returns itself if the condition is `true`, otherwise `undefined`
   */
  if(condition) {
    return condition ? this : void 0;
  }
};
__publicField(_SQL, _t, "SQL");
let SQL = _SQL;
_u = entityKind;
class Name {
  constructor(value) {
    __publicField(this, "brand");
    this.value = value;
  }
  getSQL() {
    return new SQL([this]);
  }
}
__publicField(Name, _u, "Name");
function isDriverValueEncoder(value) {
  return typeof value === "object" && value !== null && "mapToDriverValue" in value && typeof value.mapToDriverValue === "function";
}
const noopDecoder = {
  mapFromDriverValue: (value) => value
};
const noopEncoder = {
  mapToDriverValue: (value) => value
};
({
  ...noopDecoder,
  ...noopEncoder
});
_v = entityKind;
class Param {
  /**
   * @param value - Parameter value
   * @param encoder - Encoder to convert the value to a driver parameter
   */
  constructor(value, encoder = noopEncoder) {
    __publicField(this, "brand");
    this.value = value;
    this.encoder = encoder;
  }
  getSQL() {
    return new SQL([this]);
  }
}
__publicField(Param, _v, "Param");
function sql(strings, ...params) {
  const queryChunks = [];
  if (params.length > 0 || strings.length > 0 && strings[0] !== "") {
    queryChunks.push(new StringChunk(strings[0]));
  }
  for (const [paramIndex, param2] of params.entries()) {
    queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
  }
  return new SQL(queryChunks);
}
((sql2) => {
  function empty() {
    return new SQL([]);
  }
  sql2.empty = empty;
  function fromList(list) {
    return new SQL(list);
  }
  sql2.fromList = fromList;
  function raw(str) {
    return new SQL([new StringChunk(str)]);
  }
  sql2.raw = raw;
  function join(chunks, separator) {
    const result = [];
    for (const [i, chunk] of chunks.entries()) {
      if (i > 0 && separator !== void 0) {
        result.push(separator);
      }
      result.push(chunk);
    }
    return new SQL(result);
  }
  sql2.join = join;
  function identifier(value) {
    return new Name(value);
  }
  sql2.identifier = identifier;
  function placeholder2(name2) {
    return new Placeholder(name2);
  }
  sql2.placeholder = placeholder2;
  function param2(value, encoder) {
    return new Param(value, encoder);
  }
  sql2.param = param2;
})(sql || (sql = {}));
((SQL2) => {
  var _a2;
  _a2 = entityKind;
  const _Aliased = class _Aliased {
    constructor(sql2, fieldAlias) {
      /** @internal */
      __publicField(this, "isSelectionField", false);
      this.sql = sql2;
      this.fieldAlias = fieldAlias;
    }
    getSQL() {
      return this.sql;
    }
    /** @internal */
    clone() {
      return new _Aliased(this.sql, this.fieldAlias);
    }
  };
  __publicField(_Aliased, _a2, "SQL.Aliased");
  let Aliased = _Aliased;
  SQL2.Aliased = Aliased;
})(SQL || (SQL = {}));
_w = entityKind;
class Placeholder {
  constructor(name2) {
    this.name = name2;
  }
  getSQL() {
    return new SQL([this]);
  }
}
__publicField(Placeholder, _w, "Placeholder");
function fillPlaceholders(params, values) {
  return params.map((p) => {
    if (is(p, Placeholder)) {
      if (!(p.name in values)) {
        throw new Error(`No value for placeholder "${p.name}" was provided`);
      }
      return values[p.name];
    }
    if (is(p, Param) && is(p.value, Placeholder)) {
      if (!(p.value.name in values)) {
        throw new Error(`No value for placeholder "${p.value.name}" was provided`);
      }
      return p.encoder.mapToDriverValue(values[p.value.name]);
    }
    return p;
  });
}
const IsDrizzleView = Symbol.for("drizzle:IsDrizzleView");
_z = entityKind, _y = ViewBaseConfig, _x = IsDrizzleView;
class View {
  constructor({ name: name2, schema, selectedFields, query }) {
    /** @internal */
    __publicField(this, _y);
    /** @internal */
    __publicField(this, _x, true);
    this[ViewBaseConfig] = {
      name: name2,
      originalName: name2,
      schema,
      selectedFields,
      query,
      isExisting: !query,
      isAlias: false
    };
  }
  getSQL() {
    return new SQL([this]);
  }
}
__publicField(View, _z, "View");
Column.prototype.getSQL = function() {
  return new SQL([this]);
};
Table.prototype.getSQL = function() {
  return new SQL([this]);
};
Subquery.prototype.getSQL = function() {
  return new SQL([this]);
};
function mapResultRow(columns, row, joinsNotNullableMap) {
  const nullifyMap = {};
  const result = columns.reduce(
    (result2, { path: path2, field }, columnIndex) => {
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else if (is(field, Subquery)) {
        decoder = field._.sql.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      let node = result2;
      for (const [pathChunkIndex, pathChunk] of path2.entries()) {
        if (pathChunkIndex < path2.length - 1) {
          if (!(pathChunk in node)) {
            node[pathChunk] = {};
          }
          node = node[pathChunk];
        } else {
          const rawValue = row[columnIndex];
          const value = node[pathChunk] = rawValue === null ? null : decoder.mapFromDriverValue(rawValue);
          if (joinsNotNullableMap && is(field, Column) && path2.length === 2) {
            const objectName = path2[0];
            if (!(objectName in nullifyMap)) {
              nullifyMap[objectName] = value === null ? getTableName(field.table) : false;
            } else if (typeof nullifyMap[objectName] === "string" && nullifyMap[objectName] !== getTableName(field.table)) {
              nullifyMap[objectName] = false;
            }
          }
        }
      }
      return result2;
    },
    {}
  );
  if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
    for (const [objectName, tableName] of Object.entries(nullifyMap)) {
      if (typeof tableName === "string" && !joinsNotNullableMap[tableName]) {
        result[objectName] = null;
      }
    }
  }
  return result;
}
function orderSelectedFields(fields, pathPrefix) {
  return Object.entries(fields).reduce((result, [name, field]) => {
    if (typeof name !== "string") {
      return result;
    }
    const newPath = pathPrefix ? [...pathPrefix, name] : [name];
    if (is(field, Column) || is(field, SQL) || is(field, SQL.Aliased) || is(field, Subquery)) {
      result.push({ path: newPath, field });
    } else if (is(field, Table)) {
      result.push(...orderSelectedFields(field[Table.Symbol.Columns], newPath));
    } else {
      result.push(...orderSelectedFields(field, newPath));
    }
    return result;
  }, []);
}
function haveSameKeys(left, right) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  for (const [index, key] of leftKeys.entries()) {
    if (key !== rightKeys[index]) {
      return false;
    }
  }
  return true;
}
function mapUpdateSet(table, values) {
  const entries = Object.entries(values).filter(([, value]) => value !== void 0).map(([key, value]) => {
    if (is(value, SQL) || is(value, Column)) {
      return [key, value];
    } else {
      return [key, new Param(value, table[Table.Symbol.Columns][key])];
    }
  });
  if (entries.length === 0) {
    throw new Error("No values to set");
  }
  return Object.fromEntries(entries);
}
function applyMixins(baseClass, extendedClasses) {
  for (const extendedClass of extendedClasses) {
    for (const name of Object.getOwnPropertyNames(extendedClass.prototype)) {
      if (name === "constructor") continue;
      Object.defineProperty(
        baseClass.prototype,
        name,
        Object.getOwnPropertyDescriptor(extendedClass.prototype, name) || /* @__PURE__ */ Object.create(null)
      );
    }
  }
}
function getTableColumns(table) {
  return table[Table.Symbol.Columns];
}
function getTableLikeName(table) {
  return is(table, Subquery) ? table._.alias : is(table, View) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : table[Table.Symbol.IsAlias] ? table[Table.Symbol.Name] : table[Table.Symbol.BaseName];
}
function getColumnNameAndConfig(a, b) {
  return {
    name: typeof a === "string" && a.length > 0 ? a : "",
    config: typeof a === "object" ? a : b
  };
}
function isConfig(data) {
  if (typeof data !== "object" || data === null) return false;
  if (data.constructor.name !== "Object") return false;
  if ("logger" in data) {
    const type = typeof data["logger"];
    if (type !== "boolean" && (type !== "object" || typeof data["logger"]["logQuery"] !== "function") && type !== "undefined") return false;
    return true;
  }
  if ("schema" in data) {
    const type = typeof data["schema"];
    if (type !== "object" && type !== "undefined") return false;
    return true;
  }
  if ("casing" in data) {
    const type = typeof data["casing"];
    if (type !== "string" && type !== "undefined") return false;
    return true;
  }
  if ("mode" in data) {
    if (data["mode"] !== "default" || data["mode"] !== "planetscale" || data["mode"] !== void 0) return false;
    return true;
  }
  if ("connection" in data) {
    const type = typeof data["connection"];
    if (type !== "string" && type !== "object" && type !== "undefined") return false;
    return true;
  }
  if ("client" in data) {
    const type = typeof data["client"];
    if (type !== "object" && type !== "function" && type !== "undefined") return false;
    return true;
  }
  if (Object.keys(data).length === 0) return true;
  return false;
}
const textDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder();
const InlineForeignKeys$1 = Symbol.for("drizzle:PgInlineForeignKeys");
const EnableRLS = Symbol.for("drizzle:EnableRLS");
class PgTable extends (_F = Table, _E = entityKind, _D = InlineForeignKeys$1, _C = EnableRLS, _B = Table.Symbol.ExtraConfigBuilder, _A = Table.Symbol.ExtraConfigColumns, _F) {
  constructor() {
    super(...arguments);
    /**@internal */
    __publicField(this, _D, []);
    /** @internal */
    __publicField(this, _C, false);
    /** @internal */
    __publicField(this, _B);
    /** @internal */
    __publicField(this, _A, {});
  }
}
__publicField(PgTable, _E, "PgTable");
/** @internal */
__publicField(PgTable, "Symbol", Object.assign({}, Table.Symbol, {
  InlineForeignKeys: InlineForeignKeys$1,
  EnableRLS
}));
_G = entityKind;
class PrimaryKeyBuilder {
  constructor(columns, name) {
    /** @internal */
    __publicField(this, "columns");
    /** @internal */
    __publicField(this, "name");
    this.columns = columns;
    this.name = name;
  }
  /** @internal */
  build(table) {
    return new PrimaryKey(table, this.columns, this.name);
  }
}
__publicField(PrimaryKeyBuilder, _G, "PgPrimaryKeyBuilder");
_H = entityKind;
class PrimaryKey {
  constructor(table, columns, name) {
    __publicField(this, "columns");
    __publicField(this, "name");
    this.table = table;
    this.columns = columns;
    this.name = name;
  }
  getName() {
    return this.name ?? `${this.table[PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
  }
}
__publicField(PrimaryKey, _H, "PgPrimaryKey");
function bindIfParam(value, column) {
  if (isDriverValueEncoder(column) && !isSQLWrapper(value) && !is(value, Param) && !is(value, Placeholder) && !is(value, Column) && !is(value, Table) && !is(value, View)) {
    return new Param(value, column);
  }
  return value;
}
const eq = (left, right) => {
  return sql`${left} = ${bindIfParam(right, left)}`;
};
const ne = (left, right) => {
  return sql`${left} <> ${bindIfParam(right, left)}`;
};
function and(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" and ")),
    new StringChunk(")")
  ]);
}
function or(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" or ")),
    new StringChunk(")")
  ]);
}
function not(condition) {
  return sql`not ${condition}`;
}
const gt = (left, right) => {
  return sql`${left} > ${bindIfParam(right, left)}`;
};
const gte = (left, right) => {
  return sql`${left} >= ${bindIfParam(right, left)}`;
};
const lt = (left, right) => {
  return sql`${left} < ${bindIfParam(right, left)}`;
};
const lte = (left, right) => {
  return sql`${left} <= ${bindIfParam(right, left)}`;
};
function inArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`false`;
    }
    return sql`${column} in ${values.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} in ${bindIfParam(values, column)}`;
}
function notInArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`true`;
    }
    return sql`${column} not in ${values.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} not in ${bindIfParam(values, column)}`;
}
function isNull(value) {
  return sql`${value} is null`;
}
function isNotNull(value) {
  return sql`${value} is not null`;
}
function exists(subquery) {
  return sql`exists ${subquery}`;
}
function notExists(subquery) {
  return sql`not exists ${subquery}`;
}
function between(column, min, max) {
  return sql`${column} between ${bindIfParam(min, column)} and ${bindIfParam(
    max,
    column
  )}`;
}
function notBetween(column, min, max) {
  return sql`${column} not between ${bindIfParam(
    min,
    column
  )} and ${bindIfParam(max, column)}`;
}
function like(column, value) {
  return sql`${column} like ${value}`;
}
function notLike(column, value) {
  return sql`${column} not like ${value}`;
}
function ilike(column, value) {
  return sql`${column} ilike ${value}`;
}
function notIlike(column, value) {
  return sql`${column} not ilike ${value}`;
}
function asc(column) {
  return sql`${column} asc`;
}
function desc(column) {
  return sql`${column} desc`;
}
_I = entityKind;
class Relation {
  constructor(sourceTable, referencedTable, relationName) {
    __publicField(this, "referencedTableName");
    __publicField(this, "fieldName");
    this.sourceTable = sourceTable;
    this.referencedTable = referencedTable;
    this.relationName = relationName;
    this.referencedTableName = referencedTable[Table.Symbol.Name];
  }
}
__publicField(Relation, _I, "Relation");
_J = entityKind;
class Relations {
  constructor(table, config) {
    this.table = table;
    this.config = config;
  }
}
__publicField(Relations, _J, "Relations");
const _One = class _One extends (_L = Relation, _K = entityKind, _L) {
  constructor(sourceTable, referencedTable, config, isNullable) {
    super(sourceTable, referencedTable, config == null ? void 0 : config.relationName);
    this.config = config;
    this.isNullable = isNullable;
  }
  withFieldName(fieldName) {
    const relation = new _One(
      this.sourceTable,
      this.referencedTable,
      this.config,
      this.isNullable
    );
    relation.fieldName = fieldName;
    return relation;
  }
};
__publicField(_One, _K, "One");
let One = _One;
const _Many = class _Many extends (_N = Relation, _M = entityKind, _N) {
  constructor(sourceTable, referencedTable, config) {
    super(sourceTable, referencedTable, config == null ? void 0 : config.relationName);
    this.config = config;
  }
  withFieldName(fieldName) {
    const relation = new _Many(
      this.sourceTable,
      this.referencedTable,
      this.config
    );
    relation.fieldName = fieldName;
    return relation;
  }
};
__publicField(_Many, _M, "Many");
let Many = _Many;
function getOperators() {
  return {
    and,
    between,
    eq,
    exists,
    gt,
    gte,
    ilike,
    inArray,
    isNull,
    isNotNull,
    like,
    lt,
    lte,
    ne,
    not,
    notBetween,
    notExists,
    notLike,
    notIlike,
    notInArray,
    or,
    sql
  };
}
function getOrderByOperators() {
  return {
    sql,
    asc,
    desc
  };
}
function extractTablesRelationalConfig(schema, configHelpers) {
  var _a2;
  if (Object.keys(schema).length === 1 && "default" in schema && !is(schema["default"], Table)) {
    schema = schema["default"];
  }
  const tableNamesMap = {};
  const relationsBuffer = {};
  const tablesConfig = {};
  for (const [key, value] of Object.entries(schema)) {
    if (is(value, Table)) {
      const dbName = getTableUniqueName(value);
      const bufferedRelations = relationsBuffer[dbName];
      tableNamesMap[dbName] = key;
      tablesConfig[key] = {
        tsName: key,
        dbName: value[Table.Symbol.Name],
        schema: value[Table.Symbol.Schema],
        columns: value[Table.Symbol.Columns],
        relations: (bufferedRelations == null ? void 0 : bufferedRelations.relations) ?? {},
        primaryKey: (bufferedRelations == null ? void 0 : bufferedRelations.primaryKey) ?? []
      };
      for (const column of Object.values(
        value[Table.Symbol.Columns]
      )) {
        if (column.primary) {
          tablesConfig[key].primaryKey.push(column);
        }
      }
      const extraConfig = (_a2 = value[Table.Symbol.ExtraConfigBuilder]) == null ? void 0 : _a2.call(value, value[Table.Symbol.ExtraConfigColumns]);
      if (extraConfig) {
        for (const configEntry of Object.values(extraConfig)) {
          if (is(configEntry, PrimaryKeyBuilder)) {
            tablesConfig[key].primaryKey.push(...configEntry.columns);
          }
        }
      }
    } else if (is(value, Relations)) {
      const dbName = getTableUniqueName(value.table);
      const tableName = tableNamesMap[dbName];
      const relations2 = value.config(
        configHelpers(value.table)
      );
      let primaryKey;
      for (const [relationName, relation] of Object.entries(relations2)) {
        if (tableName) {
          const tableConfig = tablesConfig[tableName];
          tableConfig.relations[relationName] = relation;
        } else {
          if (!(dbName in relationsBuffer)) {
            relationsBuffer[dbName] = {
              relations: {},
              primaryKey
            };
          }
          relationsBuffer[dbName].relations[relationName] = relation;
        }
      }
    }
  }
  return { tables: tablesConfig, tableNamesMap };
}
function createOne(sourceTable) {
  return function one(table, config) {
    return new One(
      sourceTable,
      table,
      config,
      (config == null ? void 0 : config.fields.reduce((res, f) => res && f.notNull, true)) ?? false
    );
  };
}
function createMany(sourceTable) {
  return function many(referencedTable, config) {
    return new Many(sourceTable, referencedTable, config);
  };
}
function normalizeRelation(schema, tableNamesMap, relation) {
  if (is(relation, One) && relation.config) {
    return {
      fields: relation.config.fields,
      references: relation.config.references
    };
  }
  const referencedTableTsName = tableNamesMap[getTableUniqueName(relation.referencedTable)];
  if (!referencedTableTsName) {
    throw new Error(
      `Table "${relation.referencedTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const referencedTableConfig = schema[referencedTableTsName];
  if (!referencedTableConfig) {
    throw new Error(`Table "${referencedTableTsName}" not found in schema`);
  }
  const sourceTable = relation.sourceTable;
  const sourceTableTsName = tableNamesMap[getTableUniqueName(sourceTable)];
  if (!sourceTableTsName) {
    throw new Error(
      `Table "${sourceTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const reverseRelations = [];
  for (const referencedTableRelation of Object.values(
    referencedTableConfig.relations
  )) {
    if (relation.relationName && relation !== referencedTableRelation && referencedTableRelation.relationName === relation.relationName || !relation.relationName && referencedTableRelation.referencedTable === relation.sourceTable) {
      reverseRelations.push(referencedTableRelation);
    }
  }
  if (reverseRelations.length > 1) {
    throw relation.relationName ? new Error(
      `There are multiple relations with name "${relation.relationName}" in table "${referencedTableTsName}"`
    ) : new Error(
      `There are multiple relations between "${referencedTableTsName}" and "${relation.sourceTable[Table.Symbol.Name]}". Please specify relation name`
    );
  }
  if (reverseRelations[0] && is(reverseRelations[0], One) && reverseRelations[0].config) {
    return {
      fields: reverseRelations[0].config.references,
      references: reverseRelations[0].config.fields
    };
  }
  throw new Error(
    `There is not enough information to infer relation "${sourceTableTsName}.${relation.fieldName}"`
  );
}
function createTableRelationsHelpers(sourceTable) {
  return {
    one: createOne(sourceTable),
    many: createMany(sourceTable)
  };
}
function mapRelationalRow(tablesConfig, tableConfig, row, buildQueryResultSelection, mapColumnValue = (value) => value) {
  const result = {};
  for (const [
    selectionItemIndex,
    selectionItem
  ] of buildQueryResultSelection.entries()) {
    if (selectionItem.isJson) {
      const relation = tableConfig.relations[selectionItem.tsKey];
      const rawSubRows = row[selectionItemIndex];
      const subRows = typeof rawSubRows === "string" ? JSON.parse(rawSubRows) : rawSubRows;
      result[selectionItem.tsKey] = is(relation, One) ? subRows && mapRelationalRow(
        tablesConfig,
        tablesConfig[selectionItem.relationTableTsKey],
        subRows,
        selectionItem.selection,
        mapColumnValue
      ) : subRows.map(
        (subRow) => mapRelationalRow(
          tablesConfig,
          tablesConfig[selectionItem.relationTableTsKey],
          subRow,
          selectionItem.selection,
          mapColumnValue
        )
      );
    } else {
      const value = mapColumnValue(row[selectionItemIndex]);
      const field = selectionItem.field;
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      result[selectionItem.tsKey] = value === null ? null : decoder.mapFromDriverValue(value);
    }
  }
  return result;
}
_O = entityKind;
class ColumnAliasProxyHandler {
  constructor(table) {
    this.table = table;
  }
  get(columnObj, prop) {
    if (prop === "table") {
      return this.table;
    }
    return columnObj[prop];
  }
}
__publicField(ColumnAliasProxyHandler, _O, "ColumnAliasProxyHandler");
_P = entityKind;
class TableAliasProxyHandler {
  constructor(alias, replaceOriginalName) {
    this.alias = alias;
    this.replaceOriginalName = replaceOriginalName;
  }
  get(target, prop) {
    if (prop === Table.Symbol.IsAlias) {
      return true;
    }
    if (prop === Table.Symbol.Name) {
      return this.alias;
    }
    if (this.replaceOriginalName && prop === Table.Symbol.OriginalName) {
      return this.alias;
    }
    if (prop === ViewBaseConfig) {
      return {
        ...target[ViewBaseConfig],
        name: this.alias,
        isAlias: true
      };
    }
    if (prop === Table.Symbol.Columns) {
      const columns = target[Table.Symbol.Columns];
      if (!columns) {
        return columns;
      }
      const proxiedColumns = {};
      Object.keys(columns).map((key) => {
        proxiedColumns[key] = new Proxy(
          columns[key],
          new ColumnAliasProxyHandler(new Proxy(target, this))
        );
      });
      return proxiedColumns;
    }
    const value = target[prop];
    if (is(value, Column)) {
      return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(target, this)));
    }
    return value;
  }
}
__publicField(TableAliasProxyHandler, _P, "TableAliasProxyHandler");
function aliasedTable(table, tableAlias) {
  return new Proxy(table, new TableAliasProxyHandler(tableAlias, false));
}
function aliasedTableColumn(column, tableAlias) {
  return new Proxy(
    column,
    new ColumnAliasProxyHandler(new Proxy(column.table, new TableAliasProxyHandler(tableAlias, false)))
  );
}
function mapColumnsInAliasedSQLToAlias(query, alias) {
  return new SQL.Aliased(mapColumnsInSQLToAlias(query.sql, alias), query.fieldAlias);
}
function mapColumnsInSQLToAlias(query, alias) {
  return sql.join(query.queryChunks.map((c) => {
    if (is(c, Column)) {
      return aliasedTableColumn(c, alias);
    }
    if (is(c, SQL)) {
      return mapColumnsInSQLToAlias(c, alias);
    }
    if (is(c, SQL.Aliased)) {
      return mapColumnsInAliasedSQLToAlias(c, alias);
    }
    return c;
  }));
}
_Q = entityKind;
const _SelectionProxyHandler = class _SelectionProxyHandler {
  constructor(config) {
    __publicField(this, "config");
    this.config = { ...config };
  }
  get(subquery, prop) {
    if (prop === "_") {
      return {
        ...subquery["_"],
        selectedFields: new Proxy(
          subquery._.selectedFields,
          this
        )
      };
    }
    if (prop === ViewBaseConfig) {
      return {
        ...subquery[ViewBaseConfig],
        selectedFields: new Proxy(
          subquery[ViewBaseConfig].selectedFields,
          this
        )
      };
    }
    if (typeof prop === "symbol") {
      return subquery[prop];
    }
    const columns = is(subquery, Subquery) ? subquery._.selectedFields : is(subquery, View) ? subquery[ViewBaseConfig].selectedFields : subquery;
    const value = columns[prop];
    if (is(value, SQL.Aliased)) {
      if (this.config.sqlAliasedBehavior === "sql" && !value.isSelectionField) {
        return value.sql;
      }
      const newValue = value.clone();
      newValue.isSelectionField = true;
      return newValue;
    }
    if (is(value, SQL)) {
      if (this.config.sqlBehavior === "sql") {
        return value;
      }
      throw new Error(
        `You tried to reference "${prop}" field from a subquery, which is a raw SQL field, but it doesn't have an alias declared. Please add an alias to the field using ".as('alias')" method.`
      );
    }
    if (is(value, Column)) {
      if (this.config.alias) {
        return new Proxy(
          value,
          new ColumnAliasProxyHandler(
            new Proxy(
              value.table,
              new TableAliasProxyHandler(this.config.alias, this.config.replaceOriginalName ?? false)
            )
          )
        );
      }
      return value;
    }
    if (typeof value !== "object" || value === null) {
      return value;
    }
    return new Proxy(value, new _SelectionProxyHandler(this.config));
  }
};
__publicField(_SelectionProxyHandler, _Q, "SelectionProxyHandler");
let SelectionProxyHandler = _SelectionProxyHandler;
_S = entityKind, _R = Symbol.toStringTag;
class QueryPromise {
  constructor() {
    __publicField(this, _R, "QueryPromise");
  }
  catch(onRejected) {
    return this.then(void 0, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally == null ? void 0 : onFinally();
        return value;
      },
      (reason) => {
        onFinally == null ? void 0 : onFinally();
        throw reason;
      }
    );
  }
  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }
}
__publicField(QueryPromise, _S, "QueryPromise");
_T = entityKind;
class ForeignKeyBuilder {
  constructor(config, actions) {
    /** @internal */
    __publicField(this, "reference");
    /** @internal */
    __publicField(this, "_onUpdate");
    /** @internal */
    __publicField(this, "_onDelete");
    this.reference = () => {
      const { name, columns, foreignColumns } = config();
      return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
    };
    if (actions) {
      this._onUpdate = actions.onUpdate;
      this._onDelete = actions.onDelete;
    }
  }
  onUpdate(action) {
    this._onUpdate = action;
    return this;
  }
  onDelete(action) {
    this._onDelete = action;
    return this;
  }
  /** @internal */
  build(table) {
    return new ForeignKey(table, this);
  }
}
__publicField(ForeignKeyBuilder, _T, "SQLiteForeignKeyBuilder");
_U = entityKind;
class ForeignKey {
  constructor(table, builder) {
    __publicField(this, "reference");
    __publicField(this, "onUpdate");
    __publicField(this, "onDelete");
    this.table = table;
    this.reference = builder.reference;
    this.onUpdate = builder._onUpdate;
    this.onDelete = builder._onDelete;
  }
  getName() {
    const { name, columns, foreignColumns } = this.reference();
    const columnNames = columns.map((column) => column.name);
    const foreignColumnNames = foreignColumns.map((column) => column.name);
    const chunks = [
      this.table[TableName],
      ...columnNames,
      foreignColumns[0].table[TableName],
      ...foreignColumnNames
    ];
    return name ?? `${chunks.join("_")}_fk`;
  }
}
__publicField(ForeignKey, _U, "SQLiteForeignKey");
function uniqueKeyName(table, columns) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}
class SQLiteColumnBuilder extends (_W = ColumnBuilder, _V = entityKind, _W) {
  constructor() {
    super(...arguments);
    __publicField(this, "foreignKeyConfigs", []);
  }
  references(ref, actions = {}) {
    this.foreignKeyConfigs.push({ ref, actions });
    return this;
  }
  unique(name) {
    this.config.isUnique = true;
    this.config.uniqueName = name;
    return this;
  }
  generatedAlwaysAs(as, config) {
    this.config.generated = {
      as,
      type: "always",
      mode: (config == null ? void 0 : config.mode) ?? "virtual"
    };
    return this;
  }
  /** @internal */
  buildForeignKeys(column, table) {
    return this.foreignKeyConfigs.map(({ ref, actions }) => {
      return ((ref2, actions2) => {
        const builder = new ForeignKeyBuilder(() => {
          const foreignColumn = ref2();
          return { columns: [column], foreignColumns: [foreignColumn] };
        });
        if (actions2.onUpdate) {
          builder.onUpdate(actions2.onUpdate);
        }
        if (actions2.onDelete) {
          builder.onDelete(actions2.onDelete);
        }
        return builder.build(table);
      })(ref, actions);
    });
  }
}
__publicField(SQLiteColumnBuilder, _V, "SQLiteColumnBuilder");
class SQLiteColumn extends (_Y = Column, _X = entityKind, _Y) {
  constructor(table, config) {
    if (!config.uniqueName) {
      config.uniqueName = uniqueKeyName(table, [config.name]);
    }
    super(table, config);
    this.table = table;
  }
}
__publicField(SQLiteColumn, _X, "SQLiteColumn");
class SQLiteBigIntBuilder extends (__ = SQLiteColumnBuilder, _Z = entityKind, __) {
  constructor(name) {
    super(name, "bigint", "SQLiteBigInt");
  }
  /** @internal */
  build(table) {
    return new SQLiteBigInt(table, this.config);
  }
}
__publicField(SQLiteBigIntBuilder, _Z, "SQLiteBigIntBuilder");
class SQLiteBigInt extends (_aa = SQLiteColumn, _$ = entityKind, _aa) {
  getSQLType() {
    return "blob";
  }
  mapFromDriverValue(value) {
    if (typeof Buffer !== "undefined" && Buffer.from) {
      const buf = Buffer.isBuffer(value) ? value : value instanceof ArrayBuffer ? Buffer.from(value) : value.buffer ? Buffer.from(value.buffer, value.byteOffset, value.byteLength) : Buffer.from(value);
      return BigInt(buf.toString("utf8"));
    }
    return BigInt(textDecoder.decode(value));
  }
  mapToDriverValue(value) {
    return Buffer.from(value.toString());
  }
}
__publicField(SQLiteBigInt, _$, "SQLiteBigInt");
class SQLiteBlobJsonBuilder extends (_ca = SQLiteColumnBuilder, _ba = entityKind, _ca) {
  constructor(name) {
    super(name, "json", "SQLiteBlobJson");
  }
  /** @internal */
  build(table) {
    return new SQLiteBlobJson(
      table,
      this.config
    );
  }
}
__publicField(SQLiteBlobJsonBuilder, _ba, "SQLiteBlobJsonBuilder");
class SQLiteBlobJson extends (_ea = SQLiteColumn, _da = entityKind, _ea) {
  getSQLType() {
    return "blob";
  }
  mapFromDriverValue(value) {
    if (typeof Buffer !== "undefined" && Buffer.from) {
      const buf = Buffer.isBuffer(value) ? value : value instanceof ArrayBuffer ? Buffer.from(value) : value.buffer ? Buffer.from(value.buffer, value.byteOffset, value.byteLength) : Buffer.from(value);
      return JSON.parse(buf.toString("utf8"));
    }
    return JSON.parse(textDecoder.decode(value));
  }
  mapToDriverValue(value) {
    return Buffer.from(JSON.stringify(value));
  }
}
__publicField(SQLiteBlobJson, _da, "SQLiteBlobJson");
class SQLiteBlobBufferBuilder extends (_ga = SQLiteColumnBuilder, _fa = entityKind, _ga) {
  constructor(name) {
    super(name, "buffer", "SQLiteBlobBuffer");
  }
  /** @internal */
  build(table) {
    return new SQLiteBlobBuffer(table, this.config);
  }
}
__publicField(SQLiteBlobBufferBuilder, _fa, "SQLiteBlobBufferBuilder");
class SQLiteBlobBuffer extends (_ia = SQLiteColumn, _ha = entityKind, _ia) {
  mapFromDriverValue(value) {
    if (Buffer.isBuffer(value)) {
      return value;
    }
    return Buffer.from(value);
  }
  getSQLType() {
    return "blob";
  }
}
__publicField(SQLiteBlobBuffer, _ha, "SQLiteBlobBuffer");
function blob(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if ((config == null ? void 0 : config.mode) === "json") {
    return new SQLiteBlobJsonBuilder(name);
  }
  if ((config == null ? void 0 : config.mode) === "bigint") {
    return new SQLiteBigIntBuilder(name);
  }
  return new SQLiteBlobBufferBuilder(name);
}
class SQLiteCustomColumnBuilder extends (_ka = SQLiteColumnBuilder, _ja = entityKind, _ka) {
  constructor(name, fieldConfig, customTypeParams) {
    super(name, "custom", "SQLiteCustomColumn");
    this.config.fieldConfig = fieldConfig;
    this.config.customTypeParams = customTypeParams;
  }
  /** @internal */
  build(table) {
    return new SQLiteCustomColumn(
      table,
      this.config
    );
  }
}
__publicField(SQLiteCustomColumnBuilder, _ja, "SQLiteCustomColumnBuilder");
class SQLiteCustomColumn extends (_ma = SQLiteColumn, _la = entityKind, _ma) {
  constructor(table, config) {
    super(table, config);
    __publicField(this, "sqlName");
    __publicField(this, "mapTo");
    __publicField(this, "mapFrom");
    this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
    this.mapTo = config.customTypeParams.toDriver;
    this.mapFrom = config.customTypeParams.fromDriver;
  }
  getSQLType() {
    return this.sqlName;
  }
  mapFromDriverValue(value) {
    return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
  }
  mapToDriverValue(value) {
    return typeof this.mapTo === "function" ? this.mapTo(value) : value;
  }
}
__publicField(SQLiteCustomColumn, _la, "SQLiteCustomColumn");
function customType(customTypeParams) {
  return (a, b) => {
    const { name, config } = getColumnNameAndConfig(a, b);
    return new SQLiteCustomColumnBuilder(
      name,
      config,
      customTypeParams
    );
  };
}
class SQLiteBaseIntegerBuilder extends (_oa = SQLiteColumnBuilder, _na = entityKind, _oa) {
  constructor(name, dataType, columnType) {
    super(name, dataType, columnType);
    this.config.autoIncrement = false;
  }
  primaryKey(config) {
    if (config == null ? void 0 : config.autoIncrement) {
      this.config.autoIncrement = true;
    }
    this.config.hasDefault = true;
    return super.primaryKey();
  }
}
__publicField(SQLiteBaseIntegerBuilder, _na, "SQLiteBaseIntegerBuilder");
class SQLiteBaseInteger extends (_qa = SQLiteColumn, _pa = entityKind, _qa) {
  constructor() {
    super(...arguments);
    __publicField(this, "autoIncrement", this.config.autoIncrement);
  }
  getSQLType() {
    return "integer";
  }
}
__publicField(SQLiteBaseInteger, _pa, "SQLiteBaseInteger");
class SQLiteIntegerBuilder extends (_sa = SQLiteBaseIntegerBuilder, _ra = entityKind, _sa) {
  constructor(name) {
    super(name, "number", "SQLiteInteger");
  }
  build(table) {
    return new SQLiteInteger(
      table,
      this.config
    );
  }
}
__publicField(SQLiteIntegerBuilder, _ra, "SQLiteIntegerBuilder");
class SQLiteInteger extends (_ua = SQLiteBaseInteger, _ta = entityKind, _ua) {
}
__publicField(SQLiteInteger, _ta, "SQLiteInteger");
class SQLiteTimestampBuilder extends (_wa = SQLiteBaseIntegerBuilder, _va = entityKind, _wa) {
  constructor(name, mode) {
    super(name, "date", "SQLiteTimestamp");
    this.config.mode = mode;
  }
  /**
   * @deprecated Use `default()` with your own expression instead.
   *
   * Adds `DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))` to the column, which is the current epoch timestamp in milliseconds.
   */
  defaultNow() {
    return this.default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`);
  }
  build(table) {
    return new SQLiteTimestamp(
      table,
      this.config
    );
  }
}
__publicField(SQLiteTimestampBuilder, _va, "SQLiteTimestampBuilder");
class SQLiteTimestamp extends (_ya = SQLiteBaseInteger, _xa = entityKind, _ya) {
  constructor() {
    super(...arguments);
    __publicField(this, "mode", this.config.mode);
  }
  mapFromDriverValue(value) {
    if (this.config.mode === "timestamp") {
      return new Date(value * 1e3);
    }
    return new Date(value);
  }
  mapToDriverValue(value) {
    const unix = value.getTime();
    if (this.config.mode === "timestamp") {
      return Math.floor(unix / 1e3);
    }
    return unix;
  }
}
__publicField(SQLiteTimestamp, _xa, "SQLiteTimestamp");
class SQLiteBooleanBuilder extends (_Aa = SQLiteBaseIntegerBuilder, _za = entityKind, _Aa) {
  constructor(name, mode) {
    super(name, "boolean", "SQLiteBoolean");
    this.config.mode = mode;
  }
  build(table) {
    return new SQLiteBoolean(
      table,
      this.config
    );
  }
}
__publicField(SQLiteBooleanBuilder, _za, "SQLiteBooleanBuilder");
class SQLiteBoolean extends (_Ca = SQLiteBaseInteger, _Ba = entityKind, _Ca) {
  constructor() {
    super(...arguments);
    __publicField(this, "mode", this.config.mode);
  }
  mapFromDriverValue(value) {
    return Number(value) === 1;
  }
  mapToDriverValue(value) {
    return value ? 1 : 0;
  }
}
__publicField(SQLiteBoolean, _Ba, "SQLiteBoolean");
function integer(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if ((config == null ? void 0 : config.mode) === "timestamp" || (config == null ? void 0 : config.mode) === "timestamp_ms") {
    return new SQLiteTimestampBuilder(name, config.mode);
  }
  if ((config == null ? void 0 : config.mode) === "boolean") {
    return new SQLiteBooleanBuilder(name, config.mode);
  }
  return new SQLiteIntegerBuilder(name);
}
class SQLiteNumericBuilder extends (_Ea = SQLiteColumnBuilder, _Da = entityKind, _Ea) {
  constructor(name) {
    super(name, "string", "SQLiteNumeric");
  }
  /** @internal */
  build(table) {
    return new SQLiteNumeric(
      table,
      this.config
    );
  }
}
__publicField(SQLiteNumericBuilder, _Da, "SQLiteNumericBuilder");
class SQLiteNumeric extends (_Ga = SQLiteColumn, _Fa = entityKind, _Ga) {
  mapFromDriverValue(value) {
    if (typeof value === "string") return value;
    return String(value);
  }
  getSQLType() {
    return "numeric";
  }
}
__publicField(SQLiteNumeric, _Fa, "SQLiteNumeric");
class SQLiteNumericNumberBuilder extends (_Ia = SQLiteColumnBuilder, _Ha = entityKind, _Ia) {
  constructor(name) {
    super(name, "number", "SQLiteNumericNumber");
  }
  /** @internal */
  build(table) {
    return new SQLiteNumericNumber(
      table,
      this.config
    );
  }
}
__publicField(SQLiteNumericNumberBuilder, _Ha, "SQLiteNumericNumberBuilder");
class SQLiteNumericNumber extends (_Ka = SQLiteColumn, _Ja = entityKind, _Ka) {
  constructor() {
    super(...arguments);
    __publicField(this, "mapToDriverValue", String);
  }
  mapFromDriverValue(value) {
    if (typeof value === "number") return value;
    return Number(value);
  }
  getSQLType() {
    return "numeric";
  }
}
__publicField(SQLiteNumericNumber, _Ja, "SQLiteNumericNumber");
class SQLiteNumericBigIntBuilder extends (_Ma = SQLiteColumnBuilder, _La = entityKind, _Ma) {
  constructor(name) {
    super(name, "bigint", "SQLiteNumericBigInt");
  }
  /** @internal */
  build(table) {
    return new SQLiteNumericBigInt(
      table,
      this.config
    );
  }
}
__publicField(SQLiteNumericBigIntBuilder, _La, "SQLiteNumericBigIntBuilder");
class SQLiteNumericBigInt extends (_Oa = SQLiteColumn, _Na = entityKind, _Oa) {
  constructor() {
    super(...arguments);
    __publicField(this, "mapFromDriverValue", BigInt);
    __publicField(this, "mapToDriverValue", String);
  }
  getSQLType() {
    return "numeric";
  }
}
__publicField(SQLiteNumericBigInt, _Na, "SQLiteNumericBigInt");
function numeric(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  const mode = config == null ? void 0 : config.mode;
  return mode === "number" ? new SQLiteNumericNumberBuilder(name) : mode === "bigint" ? new SQLiteNumericBigIntBuilder(name) : new SQLiteNumericBuilder(name);
}
class SQLiteRealBuilder extends (_Qa = SQLiteColumnBuilder, _Pa = entityKind, _Qa) {
  constructor(name) {
    super(name, "number", "SQLiteReal");
  }
  /** @internal */
  build(table) {
    return new SQLiteReal(table, this.config);
  }
}
__publicField(SQLiteRealBuilder, _Pa, "SQLiteRealBuilder");
class SQLiteReal extends (_Sa = SQLiteColumn, _Ra = entityKind, _Sa) {
  getSQLType() {
    return "real";
  }
}
__publicField(SQLiteReal, _Ra, "SQLiteReal");
function real(name) {
  return new SQLiteRealBuilder(name ?? "");
}
class SQLiteTextBuilder extends (_Ua = SQLiteColumnBuilder, _Ta = entityKind, _Ua) {
  constructor(name, config) {
    super(name, "string", "SQLiteText");
    this.config.enumValues = config.enum;
    this.config.length = config.length;
  }
  /** @internal */
  build(table) {
    return new SQLiteText(
      table,
      this.config
    );
  }
}
__publicField(SQLiteTextBuilder, _Ta, "SQLiteTextBuilder");
class SQLiteText extends (_Wa = SQLiteColumn, _Va = entityKind, _Wa) {
  constructor(table, config) {
    super(table, config);
    __publicField(this, "enumValues", this.config.enumValues);
    __publicField(this, "length", this.config.length);
  }
  getSQLType() {
    return `text${this.config.length ? `(${this.config.length})` : ""}`;
  }
}
__publicField(SQLiteText, _Va, "SQLiteText");
class SQLiteTextJsonBuilder extends (_Ya = SQLiteColumnBuilder, _Xa = entityKind, _Ya) {
  constructor(name) {
    super(name, "json", "SQLiteTextJson");
  }
  /** @internal */
  build(table) {
    return new SQLiteTextJson(
      table,
      this.config
    );
  }
}
__publicField(SQLiteTextJsonBuilder, _Xa, "SQLiteTextJsonBuilder");
class SQLiteTextJson extends (__a = SQLiteColumn, _Za = entityKind, __a) {
  getSQLType() {
    return "text";
  }
  mapFromDriverValue(value) {
    return JSON.parse(value);
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
}
__publicField(SQLiteTextJson, _Za, "SQLiteTextJson");
function text(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config.mode === "json") {
    return new SQLiteTextJsonBuilder(name);
  }
  return new SQLiteTextBuilder(name, config);
}
function getSQLiteColumnBuilders() {
  return {
    blob,
    customType,
    integer,
    numeric,
    real,
    text
  };
}
const InlineForeignKeys = Symbol.for("drizzle:SQLiteInlineForeignKeys");
class SQLiteTable extends (_db = Table, _cb = entityKind, _bb = Table.Symbol.Columns, _ab = InlineForeignKeys, _$a = Table.Symbol.ExtraConfigBuilder, _db) {
  constructor() {
    super(...arguments);
    /** @internal */
    __publicField(this, _bb);
    /** @internal */
    __publicField(this, _ab, []);
    /** @internal */
    __publicField(this, _$a);
  }
}
__publicField(SQLiteTable, _cb, "SQLiteTable");
/** @internal */
__publicField(SQLiteTable, "Symbol", Object.assign({}, Table.Symbol, {
  InlineForeignKeys
}));
function sqliteTableBase(name, columns, extraConfig, schema, baseName = name) {
  const rawTable = new SQLiteTable(name, schema, baseName);
  const parsedColumns = typeof columns === "function" ? columns(getSQLiteColumnBuilders()) : columns;
  const builtColumns = Object.fromEntries(
    Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
      const colBuilder = colBuilderBase;
      colBuilder.setName(name2);
      const column = colBuilder.build(rawTable);
      rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
      return [name2, column];
    })
  );
  const table = Object.assign(rawTable, builtColumns);
  table[Table.Symbol.Columns] = builtColumns;
  table[Table.Symbol.ExtraConfigColumns] = builtColumns;
  return table;
}
const sqliteTable = (name, columns, extraConfig) => {
  return sqliteTableBase(name, columns);
};
function extractUsedTable(table) {
  if (is(table, SQLiteTable)) {
    return [`${table[Table.Symbol.BaseName]}`];
  }
  if (is(table, Subquery)) {
    return table._.usedTables ?? [];
  }
  if (is(table, SQL)) {
    return table.usedTables ?? [];
  }
  return [];
}
class SQLiteDeleteBase extends (_fb = QueryPromise, _eb = entityKind, _fb) {
  constructor(table, session, dialect, withList) {
    super();
    /** @internal */
    __publicField(this, "config");
    __publicField(this, "run", (placeholderValues) => {
      return this._prepare().run(placeholderValues);
    });
    __publicField(this, "all", (placeholderValues) => {
      return this._prepare().all(placeholderValues);
    });
    __publicField(this, "get", (placeholderValues) => {
      return this._prepare().get(placeholderValues);
    });
    __publicField(this, "values", (placeholderValues) => {
      return this._prepare().values(placeholderValues);
    });
    this.table = table;
    this.session = session;
    this.dialect = dialect;
    this.config = { table, withList };
  }
  /**
   * Adds a `where` clause to the query.
   *
   * Calling this method will delete only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/delete}
   *
   * @param where the `where` clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be deleted.
   *
   * ```ts
   * // Delete all cars with green color
   * db.delete(cars).where(eq(cars.color, 'green'));
   * // or
   * db.delete(cars).where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Delete all BMW cars with a green color
   * db.delete(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Delete all cars with the green or blue color
   * db.delete(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    this.config.where = where;
    return this;
  }
  orderBy(...columns) {
    if (typeof columns[0] === "function") {
      const orderBy = columns[0](
        new Proxy(
          this.config.table[Table.Symbol.Columns],
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      this.config.orderBy = orderByArray;
    } else {
      const orderByArray = columns;
      this.config.orderBy = orderByArray;
    }
    return this;
  }
  limit(limit) {
    this.config.limit = limit;
    return this;
  }
  returning(fields = this.table[SQLiteTable.Symbol.Columns]) {
    this.config.returning = orderSelectedFields(fields);
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildDeleteQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(isOneTimeQuery = true) {
    return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
      this.dialect.sqlToQuery(this.getSQL()),
      this.config.returning,
      this.config.returning ? "all" : "run",
      true,
      void 0,
      {
        type: "delete",
        tables: extractUsedTable(this.config.table)
      }
    );
  }
  prepare() {
    return this._prepare(false);
  }
  async execute(placeholderValues) {
    return this._prepare().execute(placeholderValues);
  }
  $dynamic() {
    return this;
  }
}
__publicField(SQLiteDeleteBase, _eb, "SQLiteDelete");
function toSnakeCase(input) {
  const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
  return words.map((word) => word.toLowerCase()).join("_");
}
function toCamelCase(input) {
  const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
  return words.reduce((acc, word, i) => {
    const formattedWord = i === 0 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1)}`;
    return acc + formattedWord;
  }, "");
}
function noopCase(input) {
  return input;
}
_gb = entityKind;
class CasingCache {
  constructor(casing) {
    /** @internal */
    __publicField(this, "cache", {});
    __publicField(this, "cachedTables", {});
    __publicField(this, "convert");
    this.convert = casing === "snake_case" ? toSnakeCase : casing === "camelCase" ? toCamelCase : noopCase;
  }
  getColumnCasing(column) {
    if (!column.keyAsName) return column.name;
    const schema = column.table[Table.Symbol.Schema] ?? "public";
    const tableName = column.table[Table.Symbol.OriginalName];
    const key = `${schema}.${tableName}.${column.name}`;
    if (!this.cache[key]) {
      this.cacheTable(column.table);
    }
    return this.cache[key];
  }
  cacheTable(table) {
    const schema = table[Table.Symbol.Schema] ?? "public";
    const tableName = table[Table.Symbol.OriginalName];
    const tableKey = `${schema}.${tableName}`;
    if (!this.cachedTables[tableKey]) {
      for (const column of Object.values(table[Table.Symbol.Columns])) {
        const columnKey = `${tableKey}.${column.name}`;
        this.cache[columnKey] = this.convert(column.name);
      }
      this.cachedTables[tableKey] = true;
    }
  }
  clearCache() {
    this.cache = {};
    this.cachedTables = {};
  }
}
__publicField(CasingCache, _gb, "CasingCache");
class DrizzleError extends (_ib = Error, _hb = entityKind, _ib) {
  constructor({ message, cause }) {
    super(message);
    this.name = "DrizzleError";
    this.cause = cause;
  }
}
__publicField(DrizzleError, _hb, "DrizzleError");
class DrizzleQueryError extends Error {
  constructor(query, params, cause) {
    super(`Failed query: ${query}
params: ${params}`);
    this.query = query;
    this.params = params;
    this.cause = cause;
    Error.captureStackTrace(this, DrizzleQueryError);
    if (cause) this.cause = cause;
  }
}
class TransactionRollbackError extends (_kb = DrizzleError, _jb = entityKind, _kb) {
  constructor() {
    super({ message: "Rollback" });
  }
}
__publicField(TransactionRollbackError, _jb, "TransactionRollbackError");
class SQLiteViewBase extends (_mb = View, _lb = entityKind, _mb) {
}
__publicField(SQLiteViewBase, _lb, "SQLiteViewBase");
_nb = entityKind;
class SQLiteDialect {
  constructor(config) {
    /** @internal */
    __publicField(this, "casing");
    this.casing = new CasingCache(config == null ? void 0 : config.casing);
  }
  escapeName(name) {
    return `"${name}"`;
  }
  escapeParam(_num) {
    return "?";
  }
  escapeString(str) {
    return `'${str.replace(/'/g, "''")}'`;
  }
  buildWithCTE(queries) {
    if (!(queries == null ? void 0 : queries.length)) return void 0;
    const withSqlChunks = [sql`with `];
    for (const [i, w] of queries.entries()) {
      withSqlChunks.push(sql`${sql.identifier(w._.alias)} as (${w._.sql})`);
      if (i < queries.length - 1) {
        withSqlChunks.push(sql`, `);
      }
    }
    withSqlChunks.push(sql` `);
    return sql.join(withSqlChunks);
  }
  buildDeleteQuery({ table, where, returning, withList, limit, orderBy }) {
    const withSql = this.buildWithCTE(withList);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
    const whereSql = where ? sql` where ${where}` : void 0;
    const orderBySql = this.buildOrderBy(orderBy);
    const limitSql = this.buildLimit(limit);
    return sql`${withSql}delete from ${table}${whereSql}${returningSql}${orderBySql}${limitSql}`;
  }
  buildUpdateSet(table, set) {
    const tableColumns = table[Table.Symbol.Columns];
    const columnNames = Object.keys(tableColumns).filter(
      (colName) => {
        var _a2;
        return set[colName] !== void 0 || ((_a2 = tableColumns[colName]) == null ? void 0 : _a2.onUpdateFn) !== void 0;
      }
    );
    const setSize = columnNames.length;
    return sql.join(columnNames.flatMap((colName, i) => {
      var _a2;
      const col = tableColumns[colName];
      const onUpdateFnResult = (_a2 = col.onUpdateFn) == null ? void 0 : _a2.call(col);
      const value = set[colName] ?? (is(onUpdateFnResult, SQL) ? onUpdateFnResult : sql.param(onUpdateFnResult, col));
      const res = sql`${sql.identifier(this.casing.getColumnCasing(col))} = ${value}`;
      if (i < setSize - 1) {
        return [res, sql.raw(", ")];
      }
      return [res];
    }));
  }
  buildUpdateQuery({ table, set, where, returning, withList, joins, from, limit, orderBy }) {
    const withSql = this.buildWithCTE(withList);
    const setSql = this.buildUpdateSet(table, set);
    const fromSql = from && sql.join([sql.raw(" from "), this.buildFromTable(from)]);
    const joinsSql = this.buildJoins(joins);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
    const whereSql = where ? sql` where ${where}` : void 0;
    const orderBySql = this.buildOrderBy(orderBy);
    const limitSql = this.buildLimit(limit);
    return sql`${withSql}update ${table} set ${setSql}${fromSql}${joinsSql}${whereSql}${returningSql}${orderBySql}${limitSql}`;
  }
  /**
   * Builds selection SQL with provided fields/expressions
   *
   * Examples:
   *
   * `select <selection> from`
   *
   * `insert ... returning <selection>`
   *
   * If `isSingleTable` is true, then columns won't be prefixed with table name
   */
  buildSelection(fields, { isSingleTable = false } = {}) {
    const columnsLen = fields.length;
    const chunks = fields.flatMap(({ field }, i) => {
      const chunk = [];
      if (is(field, SQL.Aliased) && field.isSelectionField) {
        chunk.push(sql.identifier(field.fieldAlias));
      } else if (is(field, SQL.Aliased) || is(field, SQL)) {
        const query = is(field, SQL.Aliased) ? field.sql : field;
        if (isSingleTable) {
          chunk.push(
            new SQL(
              query.queryChunks.map((c) => {
                if (is(c, Column)) {
                  return sql.identifier(this.casing.getColumnCasing(c));
                }
                return c;
              })
            )
          );
        } else {
          chunk.push(query);
        }
        if (is(field, SQL.Aliased)) {
          chunk.push(sql` as ${sql.identifier(field.fieldAlias)}`);
        }
      } else if (is(field, Column)) {
        const tableName = field.table[Table.Symbol.Name];
        if (field.columnType === "SQLiteNumericBigInt") {
          if (isSingleTable) {
            chunk.push(sql`cast(${sql.identifier(this.casing.getColumnCasing(field))} as text)`);
          } else {
            chunk.push(
              sql`cast(${sql.identifier(tableName)}.${sql.identifier(this.casing.getColumnCasing(field))} as text)`
            );
          }
        } else {
          if (isSingleTable) {
            chunk.push(sql.identifier(this.casing.getColumnCasing(field)));
          } else {
            chunk.push(sql`${sql.identifier(tableName)}.${sql.identifier(this.casing.getColumnCasing(field))}`);
          }
        }
      } else if (is(field, Subquery)) {
        const entries = Object.entries(field._.selectedFields);
        if (entries.length === 1) {
          const entry = entries[0][1];
          const fieldDecoder = is(entry, SQL) ? entry.decoder : is(entry, Column) ? { mapFromDriverValue: (v) => entry.mapFromDriverValue(v) } : entry.sql.decoder;
          if (fieldDecoder) field._.sql.decoder = fieldDecoder;
        }
        chunk.push(field);
      }
      if (i < columnsLen - 1) {
        chunk.push(sql`, `);
      }
      return chunk;
    });
    return sql.join(chunks);
  }
  buildJoins(joins) {
    if (!joins || joins.length === 0) {
      return void 0;
    }
    const joinsArray = [];
    if (joins) {
      for (const [index, joinMeta] of joins.entries()) {
        if (index === 0) {
          joinsArray.push(sql` `);
        }
        const table = joinMeta.table;
        const onSql = joinMeta.on ? sql` on ${joinMeta.on}` : void 0;
        if (is(table, SQLiteTable)) {
          const tableName = table[SQLiteTable.Symbol.Name];
          const tableSchema = table[SQLiteTable.Symbol.Schema];
          const origTableName = table[SQLiteTable.Symbol.OriginalName];
          const alias = tableName === origTableName ? void 0 : joinMeta.alias;
          joinsArray.push(
            sql`${sql.raw(joinMeta.joinType)} join ${tableSchema ? sql`${sql.identifier(tableSchema)}.` : void 0}${sql.identifier(origTableName)}${alias && sql` ${sql.identifier(alias)}`}${onSql}`
          );
        } else {
          joinsArray.push(
            sql`${sql.raw(joinMeta.joinType)} join ${table}${onSql}`
          );
        }
        if (index < joins.length - 1) {
          joinsArray.push(sql` `);
        }
      }
    }
    return sql.join(joinsArray);
  }
  buildLimit(limit) {
    return typeof limit === "object" || typeof limit === "number" && limit >= 0 ? sql` limit ${limit}` : void 0;
  }
  buildOrderBy(orderBy) {
    const orderByList = [];
    if (orderBy) {
      for (const [index, orderByValue] of orderBy.entries()) {
        orderByList.push(orderByValue);
        if (index < orderBy.length - 1) {
          orderByList.push(sql`, `);
        }
      }
    }
    return orderByList.length > 0 ? sql` order by ${sql.join(orderByList)}` : void 0;
  }
  buildFromTable(table) {
    if (is(table, Table) && table[Table.Symbol.IsAlias]) {
      return sql`${sql`${sql.identifier(table[Table.Symbol.Schema] ?? "")}.`.if(table[Table.Symbol.Schema])}${sql.identifier(table[Table.Symbol.OriginalName])} ${sql.identifier(table[Table.Symbol.Name])}`;
    }
    return table;
  }
  buildSelectQuery({
    withList,
    fields,
    fieldsFlat,
    where,
    having,
    table,
    joins,
    orderBy,
    groupBy,
    limit,
    offset,
    distinct,
    setOperators
  }) {
    const fieldsList = fieldsFlat ?? orderSelectedFields(fields);
    for (const f of fieldsList) {
      if (is(f.field, Column) && getTableName(f.field.table) !== (is(table, Subquery) ? table._.alias : is(table, SQLiteViewBase) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : getTableName(table)) && !((table2) => joins == null ? void 0 : joins.some(
        ({ alias }) => alias === (table2[Table.Symbol.IsAlias] ? getTableName(table2) : table2[Table.Symbol.BaseName])
      ))(f.field.table)) {
        const tableName = getTableName(f.field.table);
        throw new Error(
          `Your "${f.path.join("->")}" field references a column "${tableName}"."${f.field.name}", but the table "${tableName}" is not part of the query! Did you forget to join it?`
        );
      }
    }
    const isSingleTable = !joins || joins.length === 0;
    const withSql = this.buildWithCTE(withList);
    const distinctSql = distinct ? sql` distinct` : void 0;
    const selection = this.buildSelection(fieldsList, { isSingleTable });
    const tableSql = this.buildFromTable(table);
    const joinsSql = this.buildJoins(joins);
    const whereSql = where ? sql` where ${where}` : void 0;
    const havingSql = having ? sql` having ${having}` : void 0;
    const groupByList = [];
    if (groupBy) {
      for (const [index, groupByValue] of groupBy.entries()) {
        groupByList.push(groupByValue);
        if (index < groupBy.length - 1) {
          groupByList.push(sql`, `);
        }
      }
    }
    const groupBySql = groupByList.length > 0 ? sql` group by ${sql.join(groupByList)}` : void 0;
    const orderBySql = this.buildOrderBy(orderBy);
    const limitSql = this.buildLimit(limit);
    const offsetSql = offset ? sql` offset ${offset}` : void 0;
    const finalQuery = sql`${withSql}select${distinctSql} ${selection} from ${tableSql}${joinsSql}${whereSql}${groupBySql}${havingSql}${orderBySql}${limitSql}${offsetSql}`;
    if (setOperators.length > 0) {
      return this.buildSetOperations(finalQuery, setOperators);
    }
    return finalQuery;
  }
  buildSetOperations(leftSelect, setOperators) {
    const [setOperator, ...rest] = setOperators;
    if (!setOperator) {
      throw new Error("Cannot pass undefined values to any set operator");
    }
    if (rest.length === 0) {
      return this.buildSetOperationQuery({ leftSelect, setOperator });
    }
    return this.buildSetOperations(
      this.buildSetOperationQuery({ leftSelect, setOperator }),
      rest
    );
  }
  buildSetOperationQuery({
    leftSelect,
    setOperator: { type, isAll, rightSelect, limit, orderBy, offset }
  }) {
    const leftChunk = sql`${leftSelect.getSQL()} `;
    const rightChunk = sql`${rightSelect.getSQL()}`;
    let orderBySql;
    if (orderBy && orderBy.length > 0) {
      const orderByValues = [];
      for (const singleOrderBy of orderBy) {
        if (is(singleOrderBy, SQLiteColumn)) {
          orderByValues.push(sql.identifier(singleOrderBy.name));
        } else if (is(singleOrderBy, SQL)) {
          for (let i = 0; i < singleOrderBy.queryChunks.length; i++) {
            const chunk = singleOrderBy.queryChunks[i];
            if (is(chunk, SQLiteColumn)) {
              singleOrderBy.queryChunks[i] = sql.identifier(this.casing.getColumnCasing(chunk));
            }
          }
          orderByValues.push(sql`${singleOrderBy}`);
        } else {
          orderByValues.push(sql`${singleOrderBy}`);
        }
      }
      orderBySql = sql` order by ${sql.join(orderByValues, sql`, `)}`;
    }
    const limitSql = typeof limit === "object" || typeof limit === "number" && limit >= 0 ? sql` limit ${limit}` : void 0;
    const operatorChunk = sql.raw(`${type} ${isAll ? "all " : ""}`);
    const offsetSql = offset ? sql` offset ${offset}` : void 0;
    return sql`${leftChunk}${operatorChunk}${rightChunk}${orderBySql}${limitSql}${offsetSql}`;
  }
  buildInsertQuery({ table, values: valuesOrSelect, onConflict, returning, withList, select }) {
    const valuesSqlList = [];
    const columns = table[Table.Symbol.Columns];
    const colEntries = Object.entries(columns).filter(
      ([_, col]) => !col.shouldDisableInsert()
    );
    const insertOrder = colEntries.map(([, column]) => sql.identifier(this.casing.getColumnCasing(column)));
    if (select) {
      const select2 = valuesOrSelect;
      if (is(select2, SQL)) {
        valuesSqlList.push(select2);
      } else {
        valuesSqlList.push(select2.getSQL());
      }
    } else {
      const values = valuesOrSelect;
      valuesSqlList.push(sql.raw("values "));
      for (const [valueIndex, value] of values.entries()) {
        const valueList = [];
        for (const [fieldName, col] of colEntries) {
          const colValue = value[fieldName];
          if (colValue === void 0 || is(colValue, Param) && colValue.value === void 0) {
            let defaultValue;
            if (col.default !== null && col.default !== void 0) {
              defaultValue = is(col.default, SQL) ? col.default : sql.param(col.default, col);
            } else if (col.defaultFn !== void 0) {
              const defaultFnResult = col.defaultFn();
              defaultValue = is(defaultFnResult, SQL) ? defaultFnResult : sql.param(defaultFnResult, col);
            } else if (!col.default && col.onUpdateFn !== void 0) {
              const onUpdateFnResult = col.onUpdateFn();
              defaultValue = is(onUpdateFnResult, SQL) ? onUpdateFnResult : sql.param(onUpdateFnResult, col);
            } else {
              defaultValue = sql`null`;
            }
            valueList.push(defaultValue);
          } else {
            valueList.push(colValue);
          }
        }
        valuesSqlList.push(valueList);
        if (valueIndex < values.length - 1) {
          valuesSqlList.push(sql`, `);
        }
      }
    }
    const withSql = this.buildWithCTE(withList);
    const valuesSql = sql.join(valuesSqlList);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
    const onConflictSql = (onConflict == null ? void 0 : onConflict.length) ? sql.join(onConflict) : void 0;
    return sql`${withSql}insert into ${table} ${insertOrder} ${valuesSql}${onConflictSql}${returningSql}`;
  }
  sqlToQuery(sql2, invokeSource) {
    return sql2.toQuery({
      casing: this.casing,
      escapeName: this.escapeName,
      escapeParam: this.escapeParam,
      escapeString: this.escapeString,
      invokeSource
    });
  }
  buildRelationalQuery({
    fullSchema,
    schema,
    tableNamesMap,
    table,
    tableConfig,
    queryConfig: config,
    tableAlias,
    nestedQueryRelation,
    joinOn
  }) {
    let selection = [];
    let limit, offset, orderBy = [], where;
    const joins = [];
    if (config === true) {
      const selectionEntries = Object.entries(tableConfig.columns);
      selection = selectionEntries.map(([key, value]) => ({
        dbKey: value.name,
        tsKey: key,
        field: aliasedTableColumn(value, tableAlias),
        relationTableTsKey: void 0,
        isJson: false,
        selection: []
      }));
    } else {
      const aliasedColumns = Object.fromEntries(
        Object.entries(tableConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)])
      );
      if (config.where) {
        const whereSql = typeof config.where === "function" ? config.where(aliasedColumns, getOperators()) : config.where;
        where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
      }
      const fieldsSelection = [];
      let selectedColumns = [];
      if (config.columns) {
        let isIncludeMode = false;
        for (const [field, value] of Object.entries(config.columns)) {
          if (value === void 0) {
            continue;
          }
          if (field in tableConfig.columns) {
            if (!isIncludeMode && value === true) {
              isIncludeMode = true;
            }
            selectedColumns.push(field);
          }
        }
        if (selectedColumns.length > 0) {
          selectedColumns = isIncludeMode ? selectedColumns.filter((c) => {
            var _a2;
            return ((_a2 = config.columns) == null ? void 0 : _a2[c]) === true;
          }) : Object.keys(tableConfig.columns).filter((key) => !selectedColumns.includes(key));
        }
      } else {
        selectedColumns = Object.keys(tableConfig.columns);
      }
      for (const field of selectedColumns) {
        const column = tableConfig.columns[field];
        fieldsSelection.push({ tsKey: field, value: column });
      }
      let selectedRelations = [];
      if (config.with) {
        selectedRelations = Object.entries(config.with).filter((entry) => !!entry[1]).map(([tsKey, queryConfig]) => ({ tsKey, queryConfig, relation: tableConfig.relations[tsKey] }));
      }
      let extras;
      if (config.extras) {
        extras = typeof config.extras === "function" ? config.extras(aliasedColumns, { sql }) : config.extras;
        for (const [tsKey, value] of Object.entries(extras)) {
          fieldsSelection.push({
            tsKey,
            value: mapColumnsInAliasedSQLToAlias(value, tableAlias)
          });
        }
      }
      for (const { tsKey, value } of fieldsSelection) {
        selection.push({
          dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey].name,
          tsKey,
          field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
          relationTableTsKey: void 0,
          isJson: false,
          selection: []
        });
      }
      let orderByOrig = typeof config.orderBy === "function" ? config.orderBy(aliasedColumns, getOrderByOperators()) : config.orderBy ?? [];
      if (!Array.isArray(orderByOrig)) {
        orderByOrig = [orderByOrig];
      }
      orderBy = orderByOrig.map((orderByValue) => {
        if (is(orderByValue, Column)) {
          return aliasedTableColumn(orderByValue, tableAlias);
        }
        return mapColumnsInSQLToAlias(orderByValue, tableAlias);
      });
      limit = config.limit;
      offset = config.offset;
      for (const {
        tsKey: selectedRelationTsKey,
        queryConfig: selectedRelationConfigValue,
        relation
      } of selectedRelations) {
        const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
        const relationTableName = getTableUniqueName(relation.referencedTable);
        const relationTableTsName = tableNamesMap[relationTableName];
        const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
        const joinOn2 = and(
          ...normalizedRelation.fields.map(
            (field2, i) => eq(
              aliasedTableColumn(normalizedRelation.references[i], relationTableAlias),
              aliasedTableColumn(field2, tableAlias)
            )
          )
        );
        const builtRelation = this.buildRelationalQuery({
          fullSchema,
          schema,
          tableNamesMap,
          table: fullSchema[relationTableTsName],
          tableConfig: schema[relationTableTsName],
          queryConfig: is(relation, One) ? selectedRelationConfigValue === true ? { limit: 1 } : { ...selectedRelationConfigValue, limit: 1 } : selectedRelationConfigValue,
          tableAlias: relationTableAlias,
          joinOn: joinOn2,
          nestedQueryRelation: relation
        });
        const field = sql`(${builtRelation.sql})`.as(selectedRelationTsKey);
        selection.push({
          dbKey: selectedRelationTsKey,
          tsKey: selectedRelationTsKey,
          field,
          relationTableTsKey: relationTableTsName,
          isJson: true,
          selection: builtRelation.selection
        });
      }
    }
    if (selection.length === 0) {
      throw new DrizzleError({
        message: `No fields selected for table "${tableConfig.tsName}" ("${tableAlias}"). You need to have at least one item in "columns", "with" or "extras". If you need to select all columns, omit the "columns" key or set it to undefined.`
      });
    }
    let result;
    where = and(joinOn, where);
    if (nestedQueryRelation) {
      let field = sql`json_array(${sql.join(
        selection.map(
          ({ field: field2 }) => is(field2, SQLiteColumn) ? sql.identifier(this.casing.getColumnCasing(field2)) : is(field2, SQL.Aliased) ? field2.sql : field2
        ),
        sql`, `
      )})`;
      if (is(nestedQueryRelation, Many)) {
        field = sql`coalesce(json_group_array(${field}), json_array())`;
      }
      const nestedSelection = [{
        dbKey: "data",
        tsKey: "data",
        field: field.as("data"),
        isJson: true,
        relationTableTsKey: tableConfig.tsName,
        selection
      }];
      const needsSubquery = limit !== void 0 || offset !== void 0 || orderBy.length > 0;
      if (needsSubquery) {
        result = this.buildSelectQuery({
          table: aliasedTable(table, tableAlias),
          fields: {},
          fieldsFlat: [
            {
              path: [],
              field: sql.raw("*")
            }
          ],
          where,
          limit,
          offset,
          orderBy,
          setOperators: []
        });
        where = void 0;
        limit = void 0;
        offset = void 0;
        orderBy = void 0;
      } else {
        result = aliasedTable(table, tableAlias);
      }
      result = this.buildSelectQuery({
        table: is(result, SQLiteTable) ? result : new Subquery(result, {}, tableAlias),
        fields: {},
        fieldsFlat: nestedSelection.map(({ field: field2 }) => ({
          path: [],
          field: is(field2, Column) ? aliasedTableColumn(field2, tableAlias) : field2
        })),
        joins,
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    } else {
      result = this.buildSelectQuery({
        table: aliasedTable(table, tableAlias),
        fields: {},
        fieldsFlat: selection.map(({ field }) => ({
          path: [],
          field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field
        })),
        joins,
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    }
    return {
      tableTsKey: tableConfig.tsName,
      sql: result,
      selection
    };
  }
}
__publicField(SQLiteDialect, _nb, "SQLiteDialect");
class SQLiteSyncDialect extends (_pb = SQLiteDialect, _ob = entityKind, _pb) {
  migrate(migrations, session, config) {
    const migrationsTable = config === void 0 ? "__drizzle_migrations" : typeof config === "string" ? "__drizzle_migrations" : config.migrationsTable ?? "__drizzle_migrations";
    const migrationTableCreate = sql`
			CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			)
		`;
    session.run(migrationTableCreate);
    const dbMigrations = session.values(
      sql`SELECT id, hash, created_at FROM ${sql.identifier(migrationsTable)} ORDER BY created_at DESC LIMIT 1`
    );
    const lastDbMigration = dbMigrations[0] ?? void 0;
    session.run(sql`BEGIN`);
    try {
      for (const migration of migrations) {
        if (!lastDbMigration || Number(lastDbMigration[2]) < migration.folderMillis) {
          for (const stmt of migration.sql) {
            session.run(sql.raw(stmt));
          }
          session.run(
            sql`INSERT INTO ${sql.identifier(migrationsTable)} ("hash", "created_at") VALUES(${migration.hash}, ${migration.folderMillis})`
          );
        }
      }
      session.run(sql`COMMIT`);
    } catch (e) {
      session.run(sql`ROLLBACK`);
      throw e;
    }
  }
}
__publicField(SQLiteSyncDialect, _ob, "SQLiteSyncDialect");
_qb = entityKind;
class TypedQueryBuilder {
  /** @internal */
  getSelectedFields() {
    return this._.selectedFields;
  }
}
__publicField(TypedQueryBuilder, _qb, "TypedQueryBuilder");
_rb = entityKind;
class SQLiteSelectBuilder {
  constructor(config) {
    __publicField(this, "fields");
    __publicField(this, "session");
    __publicField(this, "dialect");
    __publicField(this, "withList");
    __publicField(this, "distinct");
    this.fields = config.fields;
    this.session = config.session;
    this.dialect = config.dialect;
    this.withList = config.withList;
    this.distinct = config.distinct;
  }
  from(source) {
    const isPartialSelect = !!this.fields;
    let fields;
    if (this.fields) {
      fields = this.fields;
    } else if (is(source, Subquery)) {
      fields = Object.fromEntries(
        Object.keys(source._.selectedFields).map((key) => [key, source[key]])
      );
    } else if (is(source, SQLiteViewBase)) {
      fields = source[ViewBaseConfig].selectedFields;
    } else if (is(source, SQL)) {
      fields = {};
    } else {
      fields = getTableColumns(source);
    }
    return new SQLiteSelectBase({
      table: source,
      fields,
      isPartialSelect,
      session: this.session,
      dialect: this.dialect,
      withList: this.withList,
      distinct: this.distinct
    });
  }
}
__publicField(SQLiteSelectBuilder, _rb, "SQLiteSelectBuilder");
class SQLiteSelectQueryBuilderBase extends (_tb = TypedQueryBuilder, _sb = entityKind, _tb) {
  constructor({ table, fields, isPartialSelect, session, dialect, withList, distinct }) {
    super();
    __publicField(this, "_");
    /** @internal */
    __publicField(this, "config");
    __publicField(this, "joinsNotNullableMap");
    __publicField(this, "tableName");
    __publicField(this, "isPartialSelect");
    __publicField(this, "session");
    __publicField(this, "dialect");
    __publicField(this, "cacheConfig");
    __publicField(this, "usedTables", /* @__PURE__ */ new Set());
    /**
     * Executes a `left join` operation by adding another table to the current query.
     *
     * Calling this method associates each row of the table with the corresponding row from the joined table, if a match is found. If no matching row exists, it sets all columns of the joined table to null.
     *
     * See docs: {@link https://orm.drizzle.team/docs/joins#left-join}
     *
     * @param table the table to join.
     * @param on the `on` clause.
     *
     * @example
     *
     * ```ts
     * // Select all users and their pets
     * const usersWithPets: { user: User; pets: Pet | null; }[] = await db.select()
     *   .from(users)
     *   .leftJoin(pets, eq(users.id, pets.ownerId))
     *
     * // Select userId and petId
     * const usersIdsAndPetIds: { userId: number; petId: number | null; }[] = await db.select({
     *   userId: users.id,
     *   petId: pets.id,
     * })
     *   .from(users)
     *   .leftJoin(pets, eq(users.id, pets.ownerId))
     * ```
     */
    __publicField(this, "leftJoin", this.createJoin("left"));
    /**
     * Executes a `right join` operation by adding another table to the current query.
     *
     * Calling this method associates each row of the joined table with the corresponding row from the main table, if a match is found. If no matching row exists, it sets all columns of the main table to null.
     *
     * See docs: {@link https://orm.drizzle.team/docs/joins#right-join}
     *
     * @param table the table to join.
     * @param on the `on` clause.
     *
     * @example
     *
     * ```ts
     * // Select all users and their pets
     * const usersWithPets: { user: User | null; pets: Pet; }[] = await db.select()
     *   .from(users)
     *   .rightJoin(pets, eq(users.id, pets.ownerId))
     *
     * // Select userId and petId
     * const usersIdsAndPetIds: { userId: number | null; petId: number; }[] = await db.select({
     *   userId: users.id,
     *   petId: pets.id,
     * })
     *   .from(users)
     *   .rightJoin(pets, eq(users.id, pets.ownerId))
     * ```
     */
    __publicField(this, "rightJoin", this.createJoin("right"));
    /**
     * Executes an `inner join` operation, creating a new table by combining rows from two tables that have matching values.
     *
     * Calling this method retrieves rows that have corresponding entries in both joined tables. Rows without matching entries in either table are excluded, resulting in a table that includes only matching pairs.
     *
     * See docs: {@link https://orm.drizzle.team/docs/joins#inner-join}
     *
     * @param table the table to join.
     * @param on the `on` clause.
     *
     * @example
     *
     * ```ts
     * // Select all users and their pets
     * const usersWithPets: { user: User; pets: Pet; }[] = await db.select()
     *   .from(users)
     *   .innerJoin(pets, eq(users.id, pets.ownerId))
     *
     * // Select userId and petId
     * const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
     *   userId: users.id,
     *   petId: pets.id,
     * })
     *   .from(users)
     *   .innerJoin(pets, eq(users.id, pets.ownerId))
     * ```
     */
    __publicField(this, "innerJoin", this.createJoin("inner"));
    /**
     * Executes a `full join` operation by combining rows from two tables into a new table.
     *
     * Calling this method retrieves all rows from both main and joined tables, merging rows with matching values and filling in `null` for non-matching columns.
     *
     * See docs: {@link https://orm.drizzle.team/docs/joins#full-join}
     *
     * @param table the table to join.
     * @param on the `on` clause.
     *
     * @example
     *
     * ```ts
     * // Select all users and their pets
     * const usersWithPets: { user: User | null; pets: Pet | null; }[] = await db.select()
     *   .from(users)
     *   .fullJoin(pets, eq(users.id, pets.ownerId))
     *
     * // Select userId and petId
     * const usersIdsAndPetIds: { userId: number | null; petId: number | null; }[] = await db.select({
     *   userId: users.id,
     *   petId: pets.id,
     * })
     *   .from(users)
     *   .fullJoin(pets, eq(users.id, pets.ownerId))
     * ```
     */
    __publicField(this, "fullJoin", this.createJoin("full"));
    /**
     * Executes a `cross join` operation by combining rows from two tables into a new table.
     *
     * Calling this method retrieves all rows from both main and joined tables, merging all rows from each table.
     *
     * See docs: {@link https://orm.drizzle.team/docs/joins#cross-join}
     *
     * @param table the table to join.
     *
     * @example
     *
     * ```ts
     * // Select all users, each user with every pet
     * const usersWithPets: { user: User; pets: Pet; }[] = await db.select()
     *   .from(users)
     *   .crossJoin(pets)
     *
     * // Select userId and petId
     * const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
     *   userId: users.id,
     *   petId: pets.id,
     * })
     *   .from(users)
     *   .crossJoin(pets)
     * ```
     */
    __publicField(this, "crossJoin", this.createJoin("cross"));
    /**
     * Adds `union` set operator to the query.
     *
     * Calling this method will combine the result sets of the `select` statements and remove any duplicate rows that appear across them.
     *
     * See docs: {@link https://orm.drizzle.team/docs/set-operations#union}
     *
     * @example
     *
     * ```ts
     * // Select all unique names from customers and users tables
     * await db.select({ name: users.name })
     *   .from(users)
     *   .union(
     *     db.select({ name: customers.name }).from(customers)
     *   );
     * // or
     * import { union } from 'drizzle-orm/sqlite-core'
     *
     * await union(
     *   db.select({ name: users.name }).from(users),
     *   db.select({ name: customers.name }).from(customers)
     * );
     * ```
     */
    __publicField(this, "union", this.createSetOperator("union", false));
    /**
     * Adds `union all` set operator to the query.
     *
     * Calling this method will combine the result-set of the `select` statements and keep all duplicate rows that appear across them.
     *
     * See docs: {@link https://orm.drizzle.team/docs/set-operations#union-all}
     *
     * @example
     *
     * ```ts
     * // Select all transaction ids from both online and in-store sales
     * await db.select({ transaction: onlineSales.transactionId })
     *   .from(onlineSales)
     *   .unionAll(
     *     db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
     *   );
     * // or
     * import { unionAll } from 'drizzle-orm/sqlite-core'
     *
     * await unionAll(
     *   db.select({ transaction: onlineSales.transactionId }).from(onlineSales),
     *   db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
     * );
     * ```
     */
    __publicField(this, "unionAll", this.createSetOperator("union", true));
    /**
     * Adds `intersect` set operator to the query.
     *
     * Calling this method will retain only the rows that are present in both result sets and eliminate duplicates.
     *
     * See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect}
     *
     * @example
     *
     * ```ts
     * // Select course names that are offered in both departments A and B
     * await db.select({ courseName: depA.courseName })
     *   .from(depA)
     *   .intersect(
     *     db.select({ courseName: depB.courseName }).from(depB)
     *   );
     * // or
     * import { intersect } from 'drizzle-orm/sqlite-core'
     *
     * await intersect(
     *   db.select({ courseName: depA.courseName }).from(depA),
     *   db.select({ courseName: depB.courseName }).from(depB)
     * );
     * ```
     */
    __publicField(this, "intersect", this.createSetOperator("intersect", false));
    /**
     * Adds `except` set operator to the query.
     *
     * Calling this method will retrieve all unique rows from the left query, except for the rows that are present in the result set of the right query.
     *
     * See docs: {@link https://orm.drizzle.team/docs/set-operations#except}
     *
     * @example
     *
     * ```ts
     * // Select all courses offered in department A but not in department B
     * await db.select({ courseName: depA.courseName })
     *   .from(depA)
     *   .except(
     *     db.select({ courseName: depB.courseName }).from(depB)
     *   );
     * // or
     * import { except } from 'drizzle-orm/sqlite-core'
     *
     * await except(
     *   db.select({ courseName: depA.courseName }).from(depA),
     *   db.select({ courseName: depB.courseName }).from(depB)
     * );
     * ```
     */
    __publicField(this, "except", this.createSetOperator("except", false));
    this.config = {
      withList,
      table,
      fields: { ...fields },
      distinct,
      setOperators: []
    };
    this.isPartialSelect = isPartialSelect;
    this.session = session;
    this.dialect = dialect;
    this._ = {
      selectedFields: fields,
      config: this.config
    };
    this.tableName = getTableLikeName(table);
    this.joinsNotNullableMap = typeof this.tableName === "string" ? { [this.tableName]: true } : {};
    for (const item of extractUsedTable(table)) this.usedTables.add(item);
  }
  /** @internal */
  getUsedTables() {
    return [...this.usedTables];
  }
  createJoin(joinType) {
    return (table, on) => {
      var _a2;
      const baseTableName = this.tableName;
      const tableName = getTableLikeName(table);
      for (const item of extractUsedTable(table)) this.usedTables.add(item);
      if (typeof tableName === "string" && ((_a2 = this.config.joins) == null ? void 0 : _a2.some((join) => join.alias === tableName))) {
        throw new Error(`Alias "${tableName}" is already used in this query`);
      }
      if (!this.isPartialSelect) {
        if (Object.keys(this.joinsNotNullableMap).length === 1 && typeof baseTableName === "string") {
          this.config.fields = {
            [baseTableName]: this.config.fields
          };
        }
        if (typeof tableName === "string" && !is(table, SQL)) {
          const selection = is(table, Subquery) ? table._.selectedFields : is(table, View) ? table[ViewBaseConfig].selectedFields : table[Table.Symbol.Columns];
          this.config.fields[tableName] = selection;
        }
      }
      if (typeof on === "function") {
        on = on(
          new Proxy(
            this.config.fields,
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          )
        );
      }
      if (!this.config.joins) {
        this.config.joins = [];
      }
      this.config.joins.push({ on, table, joinType, alias: tableName });
      if (typeof tableName === "string") {
        switch (joinType) {
          case "left": {
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
          case "right": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "cross":
          case "inner": {
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "full": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
        }
      }
      return this;
    };
  }
  createSetOperator(type, isAll) {
    return (rightSelection) => {
      const rightSelect = typeof rightSelection === "function" ? rightSelection(getSQLiteSetOperators()) : rightSelection;
      if (!haveSameKeys(this.getSelectedFields(), rightSelect.getSelectedFields())) {
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
      }
      this.config.setOperators.push({ type, isAll, rightSelect });
      return this;
    };
  }
  /** @internal */
  addSetOperators(setOperators) {
    this.config.setOperators.push(...setOperators);
    return this;
  }
  /**
   * Adds a `where` clause to the query.
   *
   * Calling this method will select only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#filtering}
   *
   * @param where the `where` clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be selected.
   *
   * ```ts
   * // Select all cars with green color
   * await db.select().from(cars).where(eq(cars.color, 'green'));
   * // or
   * await db.select().from(cars).where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Select all BMW cars with a green color
   * await db.select().from(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Select all cars with the green or blue color
   * await db.select().from(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    if (typeof where === "function") {
      where = where(
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
        )
      );
    }
    this.config.where = where;
    return this;
  }
  /**
   * Adds a `having` clause to the query.
   *
   * Calling this method will select only those rows that fulfill a specified condition. It is typically used with aggregate functions to filter the aggregated data based on a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#aggregations}
   *
   * @param having the `having` clause.
   *
   * @example
   *
   * ```ts
   * // Select all brands with more than one car
   * await db.select({
   * 	brand: cars.brand,
   * 	count: sql<number>`cast(count(${cars.id}) as int)`,
   * })
   *   .from(cars)
   *   .groupBy(cars.brand)
   *   .having(({ count }) => gt(count, 1));
   * ```
   */
  having(having) {
    if (typeof having === "function") {
      having = having(
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
        )
      );
    }
    this.config.having = having;
    return this;
  }
  groupBy(...columns) {
    if (typeof columns[0] === "function") {
      const groupBy = columns[0](
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      this.config.groupBy = Array.isArray(groupBy) ? groupBy : [groupBy];
    } else {
      this.config.groupBy = columns;
    }
    return this;
  }
  orderBy(...columns) {
    if (typeof columns[0] === "function") {
      const orderBy = columns[0](
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      if (this.config.setOperators.length > 0) {
        this.config.setOperators.at(-1).orderBy = orderByArray;
      } else {
        this.config.orderBy = orderByArray;
      }
    } else {
      const orderByArray = columns;
      if (this.config.setOperators.length > 0) {
        this.config.setOperators.at(-1).orderBy = orderByArray;
      } else {
        this.config.orderBy = orderByArray;
      }
    }
    return this;
  }
  /**
   * Adds a `limit` clause to the query.
   *
   * Calling this method will set the maximum number of rows that will be returned by this query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
   *
   * @param limit the `limit` clause.
   *
   * @example
   *
   * ```ts
   * // Get the first 10 people from this query.
   * await db.select().from(people).limit(10);
   * ```
   */
  limit(limit) {
    if (this.config.setOperators.length > 0) {
      this.config.setOperators.at(-1).limit = limit;
    } else {
      this.config.limit = limit;
    }
    return this;
  }
  /**
   * Adds an `offset` clause to the query.
   *
   * Calling this method will skip a number of rows when returning results from this query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
   *
   * @param offset the `offset` clause.
   *
   * @example
   *
   * ```ts
   * // Get the 10th-20th people from this query.
   * await db.select().from(people).offset(10).limit(10);
   * ```
   */
  offset(offset) {
    if (this.config.setOperators.length > 0) {
      this.config.setOperators.at(-1).offset = offset;
    } else {
      this.config.offset = offset;
    }
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildSelectQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  as(alias) {
    const usedTables = [];
    usedTables.push(...extractUsedTable(this.config.table));
    if (this.config.joins) {
      for (const it of this.config.joins) usedTables.push(...extractUsedTable(it.table));
    }
    return new Proxy(
      new Subquery(this.getSQL(), this.config.fields, alias, false, [...new Set(usedTables)]),
      new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    );
  }
  /** @internal */
  getSelectedFields() {
    return new Proxy(
      this.config.fields,
      new SelectionProxyHandler({ alias: this.tableName, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    );
  }
  $dynamic() {
    return this;
  }
}
__publicField(SQLiteSelectQueryBuilderBase, _sb, "SQLiteSelectQueryBuilder");
class SQLiteSelectBase extends (_vb = SQLiteSelectQueryBuilderBase, _ub = entityKind, _vb) {
  constructor() {
    super(...arguments);
    __publicField(this, "run", (placeholderValues) => {
      return this._prepare().run(placeholderValues);
    });
    __publicField(this, "all", (placeholderValues) => {
      return this._prepare().all(placeholderValues);
    });
    __publicField(this, "get", (placeholderValues) => {
      return this._prepare().get(placeholderValues);
    });
    __publicField(this, "values", (placeholderValues) => {
      return this._prepare().values(placeholderValues);
    });
  }
  /** @internal */
  _prepare(isOneTimeQuery = true) {
    if (!this.session) {
      throw new Error("Cannot execute a query on a query builder. Please use a database instance instead.");
    }
    const fieldsList = orderSelectedFields(this.config.fields);
    const query = this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
      this.dialect.sqlToQuery(this.getSQL()),
      fieldsList,
      "all",
      true,
      void 0,
      {
        type: "select",
        tables: [...this.usedTables]
      },
      this.cacheConfig
    );
    query.joinsNotNullableMap = this.joinsNotNullableMap;
    return query;
  }
  $withCache(config) {
    this.cacheConfig = config === void 0 ? { config: {}, enable: true, autoInvalidate: true } : config === false ? { enable: false } : { enable: true, autoInvalidate: true, ...config };
    return this;
  }
  prepare() {
    return this._prepare(false);
  }
  async execute() {
    return this.all();
  }
}
__publicField(SQLiteSelectBase, _ub, "SQLiteSelect");
applyMixins(SQLiteSelectBase, [QueryPromise]);
function createSetOperator(type, isAll) {
  return (leftSelect, rightSelect, ...restSelects) => {
    const setOperators = [rightSelect, ...restSelects].map((select) => ({
      type,
      isAll,
      rightSelect: select
    }));
    for (const setOperator of setOperators) {
      if (!haveSameKeys(leftSelect.getSelectedFields(), setOperator.rightSelect.getSelectedFields())) {
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
      }
    }
    return leftSelect.addSetOperators(setOperators);
  };
}
const getSQLiteSetOperators = () => ({
  union,
  unionAll,
  intersect,
  except
});
const union = createSetOperator("union", false);
const unionAll = createSetOperator("union", true);
const intersect = createSetOperator("intersect", false);
const except = createSetOperator("except", false);
_wb = entityKind;
class QueryBuilder {
  constructor(dialect) {
    __publicField(this, "dialect");
    __publicField(this, "dialectConfig");
    __publicField(this, "$with", (alias, selection) => {
      const queryBuilder = this;
      const as = (qb) => {
        if (typeof qb === "function") {
          qb = qb(queryBuilder);
        }
        return new Proxy(
          new WithSubquery(
            qb.getSQL(),
            selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}),
            alias,
            true
          ),
          new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
        );
      };
      return { as };
    });
    this.dialect = is(dialect, SQLiteDialect) ? dialect : void 0;
    this.dialectConfig = is(dialect, SQLiteDialect) ? void 0 : dialect;
  }
  with(...queries) {
    const self = this;
    function select(fields) {
      return new SQLiteSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self.getDialect(),
        withList: queries
      });
    }
    function selectDistinct(fields) {
      return new SQLiteSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self.getDialect(),
        withList: queries,
        distinct: true
      });
    }
    return { select, selectDistinct };
  }
  select(fields) {
    return new SQLiteSelectBuilder({ fields: fields ?? void 0, session: void 0, dialect: this.getDialect() });
  }
  selectDistinct(fields) {
    return new SQLiteSelectBuilder({
      fields: fields ?? void 0,
      session: void 0,
      dialect: this.getDialect(),
      distinct: true
    });
  }
  // Lazy load dialect to avoid circular dependency
  getDialect() {
    if (!this.dialect) {
      this.dialect = new SQLiteSyncDialect(this.dialectConfig);
    }
    return this.dialect;
  }
}
__publicField(QueryBuilder, _wb, "SQLiteQueryBuilder");
_xb = entityKind;
class SQLiteInsertBuilder {
  constructor(table, session, dialect, withList) {
    this.table = table;
    this.session = session;
    this.dialect = dialect;
    this.withList = withList;
  }
  values(values) {
    values = Array.isArray(values) ? values : [values];
    if (values.length === 0) {
      throw new Error("values() must be called with at least one value");
    }
    const mappedValues = values.map((entry) => {
      const result = {};
      const cols = this.table[Table.Symbol.Columns];
      for (const colKey of Object.keys(entry)) {
        const colValue = entry[colKey];
        result[colKey] = is(colValue, SQL) ? colValue : new Param(colValue, cols[colKey]);
      }
      return result;
    });
    return new SQLiteInsertBase(this.table, mappedValues, this.session, this.dialect, this.withList);
  }
  select(selectQuery) {
    const select = typeof selectQuery === "function" ? selectQuery(new QueryBuilder()) : selectQuery;
    if (!is(select, SQL) && !haveSameKeys(this.table[Columns], select._.selectedFields)) {
      throw new Error(
        "Insert select error: selected fields are not the same or are in a different order compared to the table definition"
      );
    }
    return new SQLiteInsertBase(this.table, select, this.session, this.dialect, this.withList, true);
  }
}
__publicField(SQLiteInsertBuilder, _xb, "SQLiteInsertBuilder");
class SQLiteInsertBase extends (_zb = QueryPromise, _yb = entityKind, _zb) {
  constructor(table, values, session, dialect, withList, select) {
    super();
    /** @internal */
    __publicField(this, "config");
    __publicField(this, "run", (placeholderValues) => {
      return this._prepare().run(placeholderValues);
    });
    __publicField(this, "all", (placeholderValues) => {
      return this._prepare().all(placeholderValues);
    });
    __publicField(this, "get", (placeholderValues) => {
      return this._prepare().get(placeholderValues);
    });
    __publicField(this, "values", (placeholderValues) => {
      return this._prepare().values(placeholderValues);
    });
    this.session = session;
    this.dialect = dialect;
    this.config = { table, values, withList, select };
  }
  returning(fields = this.config.table[SQLiteTable.Symbol.Columns]) {
    this.config.returning = orderSelectedFields(fields);
    return this;
  }
  /**
   * Adds an `on conflict do nothing` clause to the query.
   *
   * Calling this method simply avoids inserting a row as its alternative action.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#on-conflict-do-nothing}
   *
   * @param config The `target` and `where` clauses.
   *
   * @example
   * ```ts
   * // Insert one row and cancel the insert if there's a conflict
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoNothing();
   *
   * // Explicitly specify conflict target
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoNothing({ target: cars.id });
   * ```
   */
  onConflictDoNothing(config = {}) {
    if (!this.config.onConflict) this.config.onConflict = [];
    if (config.target === void 0) {
      this.config.onConflict.push(sql` on conflict do nothing`);
    } else {
      const targetSql = Array.isArray(config.target) ? sql`${config.target}` : sql`${[config.target]}`;
      const whereSql = config.where ? sql` where ${config.where}` : sql``;
      this.config.onConflict.push(sql` on conflict ${targetSql} do nothing${whereSql}`);
    }
    return this;
  }
  /**
   * Adds an `on conflict do update` clause to the query.
   *
   * Calling this method will update the existing row that conflicts with the row proposed for insertion as its alternative action.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#upserts-and-conflicts}
   *
   * @param config The `target`, `set` and `where` clauses.
   *
   * @example
   * ```ts
   * // Update the row if there's a conflict
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoUpdate({
   *     target: cars.id,
   *     set: { brand: 'Porsche' }
   *   });
   *
   * // Upsert with 'where' clause
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoUpdate({
   *     target: cars.id,
   *     set: { brand: 'newBMW' },
   *     where: sql`${cars.createdAt} > '2023-01-01'::date`,
   *   });
   * ```
   */
  onConflictDoUpdate(config) {
    if (config.where && (config.targetWhere || config.setWhere)) {
      throw new Error(
        'You cannot use both "where" and "targetWhere"/"setWhere" at the same time - "where" is deprecated, use "targetWhere" or "setWhere" instead.'
      );
    }
    if (!this.config.onConflict) this.config.onConflict = [];
    const whereSql = config.where ? sql` where ${config.where}` : void 0;
    const targetWhereSql = config.targetWhere ? sql` where ${config.targetWhere}` : void 0;
    const setWhereSql = config.setWhere ? sql` where ${config.setWhere}` : void 0;
    const targetSql = Array.isArray(config.target) ? sql`${config.target}` : sql`${[config.target]}`;
    const setSql = this.dialect.buildUpdateSet(this.config.table, mapUpdateSet(this.config.table, config.set));
    this.config.onConflict.push(
      sql` on conflict ${targetSql}${targetWhereSql} do update set ${setSql}${whereSql}${setWhereSql}`
    );
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildInsertQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(isOneTimeQuery = true) {
    return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
      this.dialect.sqlToQuery(this.getSQL()),
      this.config.returning,
      this.config.returning ? "all" : "run",
      true,
      void 0,
      {
        type: "insert",
        tables: extractUsedTable(this.config.table)
      }
    );
  }
  prepare() {
    return this._prepare(false);
  }
  async execute() {
    return this.config.returning ? this.all() : this.run();
  }
  $dynamic() {
    return this;
  }
}
__publicField(SQLiteInsertBase, _yb, "SQLiteInsert");
_Ab = entityKind;
class SQLiteUpdateBuilder {
  constructor(table, session, dialect, withList) {
    this.table = table;
    this.session = session;
    this.dialect = dialect;
    this.withList = withList;
  }
  set(values) {
    return new SQLiteUpdateBase(
      this.table,
      mapUpdateSet(this.table, values),
      this.session,
      this.dialect,
      this.withList
    );
  }
}
__publicField(SQLiteUpdateBuilder, _Ab, "SQLiteUpdateBuilder");
class SQLiteUpdateBase extends (_Cb = QueryPromise, _Bb = entityKind, _Cb) {
  constructor(table, set, session, dialect, withList) {
    super();
    /** @internal */
    __publicField(this, "config");
    __publicField(this, "leftJoin", this.createJoin("left"));
    __publicField(this, "rightJoin", this.createJoin("right"));
    __publicField(this, "innerJoin", this.createJoin("inner"));
    __publicField(this, "fullJoin", this.createJoin("full"));
    __publicField(this, "run", (placeholderValues) => {
      return this._prepare().run(placeholderValues);
    });
    __publicField(this, "all", (placeholderValues) => {
      return this._prepare().all(placeholderValues);
    });
    __publicField(this, "get", (placeholderValues) => {
      return this._prepare().get(placeholderValues);
    });
    __publicField(this, "values", (placeholderValues) => {
      return this._prepare().values(placeholderValues);
    });
    this.session = session;
    this.dialect = dialect;
    this.config = { set, table, withList, joins: [] };
  }
  from(source) {
    this.config.from = source;
    return this;
  }
  createJoin(joinType) {
    return (table, on) => {
      const tableName = getTableLikeName(table);
      if (typeof tableName === "string" && this.config.joins.some((join) => join.alias === tableName)) {
        throw new Error(`Alias "${tableName}" is already used in this query`);
      }
      if (typeof on === "function") {
        const from = this.config.from ? is(table, SQLiteTable) ? table[Table.Symbol.Columns] : is(table, Subquery) ? table._.selectedFields : is(table, SQLiteViewBase) ? table[ViewBaseConfig].selectedFields : void 0 : void 0;
        on = on(
          new Proxy(
            this.config.table[Table.Symbol.Columns],
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          ),
          from && new Proxy(
            from,
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          )
        );
      }
      this.config.joins.push({ on, table, joinType, alias: tableName });
      return this;
    };
  }
  /**
   * Adds a 'where' clause to the query.
   *
   * Calling this method will update only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/update}
   *
   * @param where the 'where' clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be updated.
   *
   * ```ts
   * // Update all cars with green color
   * db.update(cars).set({ color: 'red' })
   *   .where(eq(cars.color, 'green'));
   * // or
   * db.update(cars).set({ color: 'red' })
   *   .where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Update all BMW cars with a green color
   * db.update(cars).set({ color: 'red' })
   *   .where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Update all cars with the green or blue color
   * db.update(cars).set({ color: 'red' })
   *   .where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    this.config.where = where;
    return this;
  }
  orderBy(...columns) {
    if (typeof columns[0] === "function") {
      const orderBy = columns[0](
        new Proxy(
          this.config.table[Table.Symbol.Columns],
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      this.config.orderBy = orderByArray;
    } else {
      const orderByArray = columns;
      this.config.orderBy = orderByArray;
    }
    return this;
  }
  limit(limit) {
    this.config.limit = limit;
    return this;
  }
  returning(fields = this.config.table[SQLiteTable.Symbol.Columns]) {
    this.config.returning = orderSelectedFields(fields);
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildUpdateQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(isOneTimeQuery = true) {
    return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
      this.dialect.sqlToQuery(this.getSQL()),
      this.config.returning,
      this.config.returning ? "all" : "run",
      true,
      void 0,
      {
        type: "insert",
        tables: extractUsedTable(this.config.table)
      }
    );
  }
  prepare() {
    return this._prepare(false);
  }
  async execute() {
    return this.config.returning ? this.all() : this.run();
  }
  $dynamic() {
    return this;
  }
}
__publicField(SQLiteUpdateBase, _Bb, "SQLiteUpdate");
const _SQLiteCountBuilder = class _SQLiteCountBuilder extends (_Fb = SQL, _Eb = entityKind, _Db = Symbol.toStringTag, _Fb) {
  constructor(params) {
    super(_SQLiteCountBuilder.buildEmbeddedCount(params.source, params.filters).queryChunks);
    __publicField(this, "sql");
    __publicField(this, _Db, "SQLiteCountBuilderAsync");
    __publicField(this, "session");
    this.params = params;
    this.session = params.session;
    this.sql = _SQLiteCountBuilder.buildCount(
      params.source,
      params.filters
    );
  }
  static buildEmbeddedCount(source, filters) {
    return sql`(select count(*) from ${source}${sql.raw(" where ").if(filters)}${filters})`;
  }
  static buildCount(source, filters) {
    return sql`select count(*) from ${source}${sql.raw(" where ").if(filters)}${filters}`;
  }
  then(onfulfilled, onrejected) {
    return Promise.resolve(this.session.count(this.sql)).then(
      onfulfilled,
      onrejected
    );
  }
  catch(onRejected) {
    return this.then(void 0, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally == null ? void 0 : onFinally();
        return value;
      },
      (reason) => {
        onFinally == null ? void 0 : onFinally();
        throw reason;
      }
    );
  }
};
__publicField(_SQLiteCountBuilder, _Eb, "SQLiteCountBuilderAsync");
let SQLiteCountBuilder = _SQLiteCountBuilder;
_Gb = entityKind;
class RelationalQueryBuilder {
  constructor(mode, fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session) {
    this.mode = mode;
    this.fullSchema = fullSchema;
    this.schema = schema;
    this.tableNamesMap = tableNamesMap;
    this.table = table;
    this.tableConfig = tableConfig;
    this.dialect = dialect;
    this.session = session;
  }
  findMany(config) {
    return this.mode === "sync" ? new SQLiteSyncRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? config : {},
      "many"
    ) : new SQLiteRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? config : {},
      "many"
    );
  }
  findFirst(config) {
    return this.mode === "sync" ? new SQLiteSyncRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? { ...config, limit: 1 } : { limit: 1 },
      "first"
    ) : new SQLiteRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? { ...config, limit: 1 } : { limit: 1 },
      "first"
    );
  }
}
__publicField(RelationalQueryBuilder, _Gb, "SQLiteAsyncRelationalQueryBuilder");
class SQLiteRelationalQuery extends (_Ib = QueryPromise, _Hb = entityKind, _Ib) {
  constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session, config, mode) {
    super();
    /** @internal */
    __publicField(this, "mode");
    this.fullSchema = fullSchema;
    this.schema = schema;
    this.tableNamesMap = tableNamesMap;
    this.table = table;
    this.tableConfig = tableConfig;
    this.dialect = dialect;
    this.session = session;
    this.config = config;
    this.mode = mode;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildRelationalQuery({
      fullSchema: this.fullSchema,
      schema: this.schema,
      tableNamesMap: this.tableNamesMap,
      table: this.table,
      tableConfig: this.tableConfig,
      queryConfig: this.config,
      tableAlias: this.tableConfig.tsName
    }).sql;
  }
  /** @internal */
  _prepare(isOneTimeQuery = false) {
    const { query, builtQuery } = this._toSQL();
    return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
      builtQuery,
      void 0,
      this.mode === "first" ? "get" : "all",
      true,
      (rawRows, mapColumnValue) => {
        const rows = rawRows.map(
          (row) => mapRelationalRow(this.schema, this.tableConfig, row, query.selection, mapColumnValue)
        );
        if (this.mode === "first") {
          return rows[0];
        }
        return rows;
      }
    );
  }
  prepare() {
    return this._prepare(false);
  }
  _toSQL() {
    const query = this.dialect.buildRelationalQuery({
      fullSchema: this.fullSchema,
      schema: this.schema,
      tableNamesMap: this.tableNamesMap,
      table: this.table,
      tableConfig: this.tableConfig,
      queryConfig: this.config,
      tableAlias: this.tableConfig.tsName
    });
    const builtQuery = this.dialect.sqlToQuery(query.sql);
    return { query, builtQuery };
  }
  toSQL() {
    return this._toSQL().builtQuery;
  }
  /** @internal */
  executeRaw() {
    if (this.mode === "first") {
      return this._prepare(false).get();
    }
    return this._prepare(false).all();
  }
  async execute() {
    return this.executeRaw();
  }
}
__publicField(SQLiteRelationalQuery, _Hb, "SQLiteAsyncRelationalQuery");
class SQLiteSyncRelationalQuery extends (_Kb = SQLiteRelationalQuery, _Jb = entityKind, _Kb) {
  sync() {
    return this.executeRaw();
  }
}
__publicField(SQLiteSyncRelationalQuery, _Jb, "SQLiteSyncRelationalQuery");
class SQLiteRaw extends (_Mb = QueryPromise, _Lb = entityKind, _Mb) {
  constructor(execute, getSQL, action, dialect, mapBatchResult) {
    super();
    /** @internal */
    __publicField(this, "config");
    this.execute = execute;
    this.getSQL = getSQL;
    this.dialect = dialect;
    this.mapBatchResult = mapBatchResult;
    this.config = { action };
  }
  getQuery() {
    return { ...this.dialect.sqlToQuery(this.getSQL()), method: this.config.action };
  }
  mapResult(result, isFromBatch) {
    return isFromBatch ? this.mapBatchResult(result) : result;
  }
  _prepare() {
    return this;
  }
  /** @internal */
  isResponseInArrayMode() {
    return false;
  }
}
__publicField(SQLiteRaw, _Lb, "SQLiteRaw");
_Nb = entityKind;
class BaseSQLiteDatabase {
  constructor(resultKind, dialect, session, schema) {
    __publicField(this, "query");
    /**
     * Creates a subquery that defines a temporary named result set as a CTE.
     *
     * It is useful for breaking down complex queries into simpler parts and for reusing the result set in subsequent parts of the query.
     *
     * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
     *
     * @param alias The alias for the subquery.
     *
     * Failure to provide an alias will result in a DrizzleTypeError, preventing the subquery from being referenced in other queries.
     *
     * @example
     *
     * ```ts
     * // Create a subquery with alias 'sq' and use it in the select query
     * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
     *
     * const result = await db.with(sq).select().from(sq);
     * ```
     *
     * To select arbitrary SQL values as fields in a CTE and reference them in other CTEs or in the main query, you need to add aliases to them:
     *
     * ```ts
     * // Select an arbitrary SQL value as a field in a CTE and reference it in the main query
     * const sq = db.$with('sq').as(db.select({
     *   name: sql<string>`upper(${users.name})`.as('name'),
     * })
     * .from(users));
     *
     * const result = await db.with(sq).select({ name: sq.name }).from(sq);
     * ```
     */
    __publicField(this, "$with", (alias, selection) => {
      const self = this;
      const as = (qb) => {
        if (typeof qb === "function") {
          qb = qb(new QueryBuilder(self.dialect));
        }
        return new Proxy(
          new WithSubquery(
            qb.getSQL(),
            selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}),
            alias,
            true
          ),
          new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
        );
      };
      return { as };
    });
    __publicField(this, "$cache");
    this.resultKind = resultKind;
    this.dialect = dialect;
    this.session = session;
    this._ = schema ? {
      schema: schema.schema,
      fullSchema: schema.fullSchema,
      tableNamesMap: schema.tableNamesMap
    } : {
      schema: void 0,
      fullSchema: {},
      tableNamesMap: {}
    };
    this.query = {};
    const query = this.query;
    if (this._.schema) {
      for (const [tableName, columns] of Object.entries(this._.schema)) {
        query[tableName] = new RelationalQueryBuilder(
          resultKind,
          schema.fullSchema,
          this._.schema,
          this._.tableNamesMap,
          schema.fullSchema[tableName],
          columns,
          dialect,
          session
        );
      }
    }
    this.$cache = { invalidate: async (_params) => {
    } };
  }
  $count(source, filters) {
    return new SQLiteCountBuilder({ source, filters, session: this.session });
  }
  /**
   * Incorporates a previously defined CTE (using `$with`) into the main query.
   *
   * This method allows the main query to reference a temporary named result set.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
   *
   * @param queries The CTEs to incorporate into the main query.
   *
   * @example
   *
   * ```ts
   * // Define a subquery 'sq' as a CTE using $with
   * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
   *
   * // Incorporate the CTE 'sq' into the main query and select from it
   * const result = await db.with(sq).select().from(sq);
   * ```
   */
  with(...queries) {
    const self = this;
    function select(fields) {
      return new SQLiteSelectBuilder({
        fields: fields ?? void 0,
        session: self.session,
        dialect: self.dialect,
        withList: queries
      });
    }
    function selectDistinct(fields) {
      return new SQLiteSelectBuilder({
        fields: fields ?? void 0,
        session: self.session,
        dialect: self.dialect,
        withList: queries,
        distinct: true
      });
    }
    function update(table) {
      return new SQLiteUpdateBuilder(table, self.session, self.dialect, queries);
    }
    function insert(into) {
      return new SQLiteInsertBuilder(into, self.session, self.dialect, queries);
    }
    function delete_(from) {
      return new SQLiteDeleteBase(from, self.session, self.dialect, queries);
    }
    return { select, selectDistinct, update, insert, delete: delete_ };
  }
  select(fields) {
    return new SQLiteSelectBuilder({ fields: fields ?? void 0, session: this.session, dialect: this.dialect });
  }
  selectDistinct(fields) {
    return new SQLiteSelectBuilder({
      fields: fields ?? void 0,
      session: this.session,
      dialect: this.dialect,
      distinct: true
    });
  }
  /**
   * Creates an update query.
   *
   * Calling this method without `.where()` clause will update all rows in a table. The `.where()` clause specifies which rows should be updated.
   *
   * Use `.set()` method to specify which values to update.
   *
   * See docs: {@link https://orm.drizzle.team/docs/update}
   *
   * @param table The table to update.
   *
   * @example
   *
   * ```ts
   * // Update all rows in the 'cars' table
   * await db.update(cars).set({ color: 'red' });
   *
   * // Update rows with filters and conditions
   * await db.update(cars).set({ color: 'red' }).where(eq(cars.brand, 'BMW'));
   *
   * // Update with returning clause
   * const updatedCar: Car[] = await db.update(cars)
   *   .set({ color: 'red' })
   *   .where(eq(cars.id, 1))
   *   .returning();
   * ```
   */
  update(table) {
    return new SQLiteUpdateBuilder(table, this.session, this.dialect);
  }
  /**
   * Creates an insert query.
   *
   * Calling this method will create new rows in a table. Use `.values()` method to specify which values to insert.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert}
   *
   * @param table The table to insert into.
   *
   * @example
   *
   * ```ts
   * // Insert one row
   * await db.insert(cars).values({ brand: 'BMW' });
   *
   * // Insert multiple rows
   * await db.insert(cars).values([{ brand: 'BMW' }, { brand: 'Porsche' }]);
   *
   * // Insert with returning clause
   * const insertedCar: Car[] = await db.insert(cars)
   *   .values({ brand: 'BMW' })
   *   .returning();
   * ```
   */
  insert(into) {
    return new SQLiteInsertBuilder(into, this.session, this.dialect);
  }
  /**
   * Creates a delete query.
   *
   * Calling this method without `.where()` clause will delete all rows in a table. The `.where()` clause specifies which rows should be deleted.
   *
   * See docs: {@link https://orm.drizzle.team/docs/delete}
   *
   * @param table The table to delete from.
   *
   * @example
   *
   * ```ts
   * // Delete all rows in the 'cars' table
   * await db.delete(cars);
   *
   * // Delete rows with filters and conditions
   * await db.delete(cars).where(eq(cars.color, 'green'));
   *
   * // Delete with returning clause
   * const deletedCar: Car[] = await db.delete(cars)
   *   .where(eq(cars.id, 1))
   *   .returning();
   * ```
   */
  delete(from) {
    return new SQLiteDeleteBase(from, this.session, this.dialect);
  }
  run(query) {
    const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
    if (this.resultKind === "async") {
      return new SQLiteRaw(
        async () => this.session.run(sequel),
        () => sequel,
        "run",
        this.dialect,
        this.session.extractRawRunValueFromBatchResult.bind(this.session)
      );
    }
    return this.session.run(sequel);
  }
  all(query) {
    const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
    if (this.resultKind === "async") {
      return new SQLiteRaw(
        async () => this.session.all(sequel),
        () => sequel,
        "all",
        this.dialect,
        this.session.extractRawAllValueFromBatchResult.bind(this.session)
      );
    }
    return this.session.all(sequel);
  }
  get(query) {
    const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
    if (this.resultKind === "async") {
      return new SQLiteRaw(
        async () => this.session.get(sequel),
        () => sequel,
        "get",
        this.dialect,
        this.session.extractRawGetValueFromBatchResult.bind(this.session)
      );
    }
    return this.session.get(sequel);
  }
  values(query) {
    const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
    if (this.resultKind === "async") {
      return new SQLiteRaw(
        async () => this.session.values(sequel),
        () => sequel,
        "values",
        this.dialect,
        this.session.extractRawValuesValueFromBatchResult.bind(this.session)
      );
    }
    return this.session.values(sequel);
  }
  transaction(transaction, config) {
    return this.session.transaction(transaction, config);
  }
}
__publicField(BaseSQLiteDatabase, _Nb, "BaseSQLiteDatabase");
_Ob = entityKind;
class Cache {
}
__publicField(Cache, _Ob, "Cache");
class NoopCache extends (_Qb = Cache, _Pb = entityKind, _Qb) {
  strategy() {
    return "all";
  }
  async get(_key) {
    return void 0;
  }
  async put(_hashedQuery, _response, _tables, _config) {
  }
  async onMutate(_params) {
  }
}
__publicField(NoopCache, _Pb, "NoopCache");
async function hashQuery(sql2, params) {
  const dataToHash = `${sql2}-${JSON.stringify(params)}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(dataToHash);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = [...new Uint8Array(hashBuffer)];
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
class ExecuteResultSync extends (_Sb = QueryPromise, _Rb = entityKind, _Sb) {
  constructor(resultCb) {
    super();
    this.resultCb = resultCb;
  }
  async execute() {
    return this.resultCb();
  }
  sync() {
    return this.resultCb();
  }
}
__publicField(ExecuteResultSync, _Rb, "ExecuteResultSync");
_Tb = entityKind;
class SQLitePreparedQuery {
  constructor(mode, executeMethod, query, cache, queryMetadata, cacheConfig) {
    /** @internal */
    __publicField(this, "joinsNotNullableMap");
    var _a2;
    this.mode = mode;
    this.executeMethod = executeMethod;
    this.query = query;
    this.cache = cache;
    this.queryMetadata = queryMetadata;
    this.cacheConfig = cacheConfig;
    if (cache && cache.strategy() === "all" && cacheConfig === void 0) {
      this.cacheConfig = { enable: true, autoInvalidate: true };
    }
    if (!((_a2 = this.cacheConfig) == null ? void 0 : _a2.enable)) {
      this.cacheConfig = void 0;
    }
  }
  /** @internal */
  async queryWithCache(queryString, params, query) {
    if (this.cache === void 0 || is(this.cache, NoopCache) || this.queryMetadata === void 0) {
      try {
        return await query();
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
    if (this.cacheConfig && !this.cacheConfig.enable) {
      try {
        return await query();
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
    if ((this.queryMetadata.type === "insert" || this.queryMetadata.type === "update" || this.queryMetadata.type === "delete") && this.queryMetadata.tables.length > 0) {
      try {
        const [res] = await Promise.all([
          query(),
          this.cache.onMutate({ tables: this.queryMetadata.tables })
        ]);
        return res;
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
    if (!this.cacheConfig) {
      try {
        return await query();
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
    if (this.queryMetadata.type === "select") {
      const fromCache = await this.cache.get(
        this.cacheConfig.tag ?? await hashQuery(queryString, params),
        this.queryMetadata.tables,
        this.cacheConfig.tag !== void 0,
        this.cacheConfig.autoInvalidate
      );
      if (fromCache === void 0) {
        let result;
        try {
          result = await query();
        } catch (e) {
          throw new DrizzleQueryError(queryString, params, e);
        }
        await this.cache.put(
          this.cacheConfig.tag ?? await hashQuery(queryString, params),
          result,
          // make sure we send tables that were used in a query only if user wants to invalidate it on each write
          this.cacheConfig.autoInvalidate ? this.queryMetadata.tables : [],
          this.cacheConfig.tag !== void 0,
          this.cacheConfig.config
        );
        return result;
      }
      return fromCache;
    }
    try {
      return await query();
    } catch (e) {
      throw new DrizzleQueryError(queryString, params, e);
    }
  }
  getQuery() {
    return this.query;
  }
  mapRunResult(result, _isFromBatch) {
    return result;
  }
  mapAllResult(_result, _isFromBatch) {
    throw new Error("Not implemented");
  }
  mapGetResult(_result, _isFromBatch) {
    throw new Error("Not implemented");
  }
  execute(placeholderValues) {
    if (this.mode === "async") {
      return this[this.executeMethod](placeholderValues);
    }
    return new ExecuteResultSync(() => this[this.executeMethod](placeholderValues));
  }
  mapResult(response, isFromBatch) {
    switch (this.executeMethod) {
      case "run": {
        return this.mapRunResult(response, isFromBatch);
      }
      case "all": {
        return this.mapAllResult(response, isFromBatch);
      }
      case "get": {
        return this.mapGetResult(response, isFromBatch);
      }
    }
  }
}
__publicField(SQLitePreparedQuery, _Tb, "PreparedQuery");
_Ub = entityKind;
class SQLiteSession {
  constructor(dialect) {
    this.dialect = dialect;
  }
  prepareOneTimeQuery(query, fields, executeMethod, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig) {
    return this.prepareQuery(
      query,
      fields,
      executeMethod,
      isResponseInArrayMode,
      customResultMapper,
      queryMetadata,
      cacheConfig
    );
  }
  run(query) {
    const staticQuery = this.dialect.sqlToQuery(query);
    try {
      return this.prepareOneTimeQuery(staticQuery, void 0, "run", false).run();
    } catch (err) {
      throw new DrizzleError({ cause: err, message: `Failed to run the query '${staticQuery.sql}'` });
    }
  }
  /** @internal */
  extractRawRunValueFromBatchResult(result) {
    return result;
  }
  all(query) {
    return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), void 0, "run", false).all();
  }
  /** @internal */
  extractRawAllValueFromBatchResult(_result) {
    throw new Error("Not implemented");
  }
  get(query) {
    return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), void 0, "run", false).get();
  }
  /** @internal */
  extractRawGetValueFromBatchResult(_result) {
    throw new Error("Not implemented");
  }
  values(query) {
    return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), void 0, "run", false).values();
  }
  async count(sql2) {
    const result = await this.values(sql2);
    return result[0][0];
  }
  /** @internal */
  extractRawValuesValueFromBatchResult(_result) {
    throw new Error("Not implemented");
  }
}
__publicField(SQLiteSession, _Ub, "SQLiteSession");
class SQLiteTransaction extends (_Wb = BaseSQLiteDatabase, _Vb = entityKind, _Wb) {
  constructor(resultType, dialect, session, schema, nestedIndex = 0) {
    super(resultType, dialect, session, schema);
    this.schema = schema;
    this.nestedIndex = nestedIndex;
  }
  rollback() {
    throw new TransactionRollbackError();
  }
}
__publicField(SQLiteTransaction, _Vb, "SQLiteTransaction");
class BetterSQLiteSession extends (_Yb = SQLiteSession, _Xb = entityKind, _Yb) {
  constructor(client, dialect, schema, options = {}) {
    super(dialect);
    __publicField(this, "logger");
    __publicField(this, "cache");
    this.client = client;
    this.schema = schema;
    this.logger = options.logger ?? new NoopLogger();
    this.cache = options.cache ?? new NoopCache();
  }
  prepareQuery(query, fields, executeMethod, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig) {
    const stmt = this.client.prepare(query.sql);
    return new PreparedQuery(
      stmt,
      query,
      this.logger,
      this.cache,
      queryMetadata,
      cacheConfig,
      fields,
      executeMethod,
      isResponseInArrayMode,
      customResultMapper
    );
  }
  transaction(transaction, config = {}) {
    const tx = new BetterSQLiteTransaction("sync", this.dialect, this, this.schema);
    const nativeTx = this.client.transaction(transaction);
    return nativeTx[config.behavior ?? "deferred"](tx);
  }
}
__publicField(BetterSQLiteSession, _Xb, "BetterSQLiteSession");
const _BetterSQLiteTransaction = class _BetterSQLiteTransaction extends (__b = SQLiteTransaction, _Zb = entityKind, __b) {
  transaction(transaction) {
    const savepointName = `sp${this.nestedIndex}`;
    const tx = new _BetterSQLiteTransaction("sync", this.dialect, this.session, this.schema, this.nestedIndex + 1);
    this.session.run(sql.raw(`savepoint ${savepointName}`));
    try {
      const result = transaction(tx);
      this.session.run(sql.raw(`release savepoint ${savepointName}`));
      return result;
    } catch (err) {
      this.session.run(sql.raw(`rollback to savepoint ${savepointName}`));
      throw err;
    }
  }
};
__publicField(_BetterSQLiteTransaction, _Zb, "BetterSQLiteTransaction");
let BetterSQLiteTransaction = _BetterSQLiteTransaction;
class PreparedQuery extends (_ac = SQLitePreparedQuery, _$b = entityKind, _ac) {
  constructor(stmt, query, logger, cache, queryMetadata, cacheConfig, fields, executeMethod, _isResponseInArrayMode, customResultMapper) {
    super("sync", executeMethod, query, cache, queryMetadata, cacheConfig);
    this.stmt = stmt;
    this.logger = logger;
    this.fields = fields;
    this._isResponseInArrayMode = _isResponseInArrayMode;
    this.customResultMapper = customResultMapper;
  }
  run(placeholderValues) {
    const params = fillPlaceholders(this.query.params, placeholderValues ?? {});
    this.logger.logQuery(this.query.sql, params);
    return this.stmt.run(...params);
  }
  all(placeholderValues) {
    const { fields, joinsNotNullableMap, query, logger, stmt, customResultMapper } = this;
    if (!fields && !customResultMapper) {
      const params = fillPlaceholders(query.params, placeholderValues ?? {});
      logger.logQuery(query.sql, params);
      return stmt.all(...params);
    }
    const rows = this.values(placeholderValues);
    if (customResultMapper) {
      return customResultMapper(rows);
    }
    return rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
  }
  get(placeholderValues) {
    const params = fillPlaceholders(this.query.params, placeholderValues ?? {});
    this.logger.logQuery(this.query.sql, params);
    const { fields, stmt, joinsNotNullableMap, customResultMapper } = this;
    if (!fields && !customResultMapper) {
      return stmt.get(...params);
    }
    const row = stmt.raw().get(...params);
    if (!row) {
      return void 0;
    }
    if (customResultMapper) {
      return customResultMapper([row]);
    }
    return mapResultRow(fields, row, joinsNotNullableMap);
  }
  values(placeholderValues) {
    const params = fillPlaceholders(this.query.params, placeholderValues ?? {});
    this.logger.logQuery(this.query.sql, params);
    return this.stmt.raw().all(...params);
  }
  /** @internal */
  isResponseInArrayMode() {
    return this._isResponseInArrayMode;
  }
}
__publicField(PreparedQuery, _$b, "BetterSQLitePreparedQuery");
class BetterSQLite3Database extends (_cc = BaseSQLiteDatabase, _bc = entityKind, _cc) {
}
__publicField(BetterSQLite3Database, _bc, "BetterSQLite3Database");
function construct(client, config = {}) {
  const dialect = new SQLiteSyncDialect({ casing: config.casing });
  let logger;
  if (config.logger === true) {
    logger = new DefaultLogger();
  } else if (config.logger !== false) {
    logger = config.logger;
  }
  let schema;
  if (config.schema) {
    const tablesConfig = extractTablesRelationalConfig(
      config.schema,
      createTableRelationsHelpers
    );
    schema = {
      fullSchema: config.schema,
      schema: tablesConfig.tables,
      tableNamesMap: tablesConfig.tableNamesMap
    };
  }
  const session = new BetterSQLiteSession(client, dialect, schema, { logger });
  const db = new BetterSQLite3Database("sync", dialect, session, schema);
  db.$client = client;
  return db;
}
function drizzle(...params) {
  if (params[0] === void 0 || typeof params[0] === "string") {
    const instance = params[0] === void 0 ? new Client() : new Client(params[0]);
    return construct(instance, params[1]);
  }
  if (isConfig(params[0])) {
    const { connection, client, ...drizzleConfig } = params[0];
    if (client) return construct(client, drizzleConfig);
    if (typeof connection === "object") {
      const { source, ...options } = connection;
      const instance2 = new Client(source, options);
      return construct(instance2, drizzleConfig);
    }
    const instance = new Client(connection);
    return construct(instance, drizzleConfig);
  }
  return construct(params[0], params[1]);
}
((drizzle2) => {
  function mock(config) {
    return construct({}, config);
  }
  drizzle2.mock = mock;
})(drizzle || (drizzle = {}));
let drizzleDb = null;
function initDrizzle() {
  if (drizzleDb) {
    return drizzleDb;
  }
  drizzleDb = drizzle(getDb());
  console.log("❇️ Drizzle ORM initialized successfully.");
  return drizzleDb;
}
function closeDrizzle() {
  drizzleDb = null;
}
function useDb() {
  if (!drizzleDb) {
    throw new Error("Drizzle ORM has not been initialized yet! Please call initDrizzle() first.");
  }
  return drizzleDb;
}
const BodyTypes = sqliteTable("BodyTypes", {
  bodyTypeId: integer("bodyTypeId").primaryKey({ autoIncrement: true }),
  bodyTypeName: text("bodyTypeName").notNull().unique()
});
const baseBodyTypes = [
  { bodyTypeName: "Sedan" },
  { bodyTypeName: "Hatchback" },
  { bodyTypeName: "SUV" },
  { bodyTypeName: "Coupe" },
  { bodyTypeName: "Station Wagon" },
  { bodyTypeName: "MPV" },
  { bodyTypeName: "Crossover" },
  { bodyTypeName: "Pickup" },
  { bodyTypeName: "Cabrio" }
];
async function createBodyTypesTable() {
  const db = getDb();
  const orm = useDb();
  const createBodyTypesTableSql = `
    CREATE TABLE IF NOT EXISTS BodyTypes(
    bodyTypeId INTEGER PRIMARY KEY AUTOINCREMENT,
    bodyTypeName TEXT NOT NULL Unique
    )

`;
  try {
    db.exec(createBodyTypesTableSql);
    console.log("❇️ BodyTypes table created");
    try {
      await orm.insert(BodyTypes).values(baseBodyTypes).onConflictDoNothing();
      console.log(" ❇️ Base body types added the table.");
    } catch (err) {
      console.error("🆘 Base body types insert error:", err.message);
      throw err;
    }
  } catch (err) {
    console.log("🆘 BodyTypes table not created", err.message);
    throw err;
  }
}
const Brands = sqliteTable("Brands", {
  brandId: integer("brandId").primaryKey({ autoIncrement: true }),
  brandName: text("brandName").notNull().unique()
});
const baseCarBrands = [
  { brandName: "Abarth" },
  { brandName: "Acura" },
  { brandName: "Aixam" },
  { brandName: "Alfa Romeo" },
  { brandName: "Alpine" },
  { brandName: "Ariel" },
  { brandName: "Aston Martin" },
  { brandName: "Audi" },
  { brandName: "BAC (Briggs Automotive Company)" },
  { brandName: "Bentley" },
  { brandName: "BMW" },
  { brandName: "Bugatti" },
  { brandName: "Buick" },
  { brandName: "BYD" },
  { brandName: "Cadillac" },
  { brandName: "Caterham" },
  { brandName: "Changan" },
  { brandName: "Chery" },
  { brandName: "Chevrolet" },
  { brandName: "Chrysler" },
  { brandName: "Citroën" },
  { brandName: "Cupra" },
  { brandName: "Dacia" },
  { brandName: "Daewoo" },
  { brandName: "Daihatsu" },
  { brandName: "Datsun" },
  { brandName: "DeLorean" },
  { brandName: "Dodge" },
  { brandName: "Dongfeng" },
  { brandName: "DS Automobiles" },
  { brandName: "Eunos" },
  { brandName: "FAW" },
  { brandName: "Ferrari" },
  { brandName: "Fiat" },
  { brandName: "Fisker" },
  { brandName: "Ford" },
  { brandName: "Geely" },
  { brandName: "Genesis" },
  { brandName: "GMC" },
  { brandName: "Great Wall (GWM)" },
  { brandName: "Haval" },
  { brandName: "Holden" },
  { brandName: "Honda" },
  { brandName: "Hummer" },
  { brandName: "Hyundai" },
  { brandName: "Infiniti" },
  { brandName: "Isuzu" },
  { brandName: "Jaguar" },
  { brandName: "Jeep" },
  { brandName: "KGM (SsangYong)" },
  { brandName: "Kia" },
  { brandName: "Koenigsegg" },
  { brandName: "Lada" },
  { brandName: "Lamborghini" },
  { brandName: "Lancia" },
  { brandName: "Land Rover" },
  { brandName: "Lexus" },
  { brandName: "Li Auto" },
  { brandName: "Lincoln" },
  { brandName: "Lotus" },
  { brandName: "Lucid" },
  { brandName: "Lynk & Co" },
  { brandName: "Mahindra" },
  { brandName: "Maserati" },
  { brandName: "Maybach" },
  { brandName: "Mazda" },
  { brandName: "McLaren" },
  { brandName: "Mercedes-Benz" },
  { brandName: "MG" },
  { brandName: "Mini" },
  { brandName: "Mitsubishi" },
  { brandName: "Morgan" },
  { brandName: "Nio" },
  { brandName: "Nissan" },
  { brandName: "Oldsmobile" },
  { brandName: "Opel" },
  { brandName: "Pagani" },
  { brandName: "Perodua" },
  { brandName: "Peugeot" },
  { brandName: "Pininfarina" },
  { brandName: "Plymouth" },
  { brandName: "Polestar" },
  { brandName: "Pontiac" },
  { brandName: "Porsche" },
  { brandName: "Proton" },
  { brandName: "Ram" },
  { brandName: "Renault" },
  { brandName: "Rimac" },
  { brandName: "Rivian" },
  { brandName: "Rolls-Royce" },
  { brandName: "Saab" },
  { brandName: "Saturn" },
  { brandName: "Scania" },
  { brandName: "Scion" },
  { brandName: "SEAT" },
  { brandName: "Skoda" },
  { brandName: "Smart" },
  { brandName: "Spyker" },
  { brandName: "Subaru" },
  { brandName: "Suzuki" },
  { brandName: "Tata Motors" },
  { brandName: "Tesla" },
  { brandName: "Toyota" },
  { brandName: "Vanderhall" },
  { brandName: "Vauxhall" },
  { brandName: "VinFast" },
  { brandName: "Volkswagen" },
  { brandName: "Volvo" },
  { brandName: "Wiesmann" },
  { brandName: "Wuling" },
  { brandName: "XPeng" },
  { brandName: "Zagato" },
  { brandName: "Zeekr" },
  { brandName: "Zenvo" }
];
async function createBrandsTable() {
  const db = getDb();
  const orm = useDb();
  const createBrandsTableSql = `
    CREATE TABLE IF NOT EXISTS Brands(
      brandId   INTEGER PRIMARY KEY AUTOINCREMENT,
      brandName TEXT    NOT NULL UNIQUE
    )
  `;
  try {
    db.exec(createBrandsTableSql);
    console.log("❇️ Brands table created.");
    await orm.insert(Brands).values(baseCarBrands).onConflictDoNothing();
    console.log("❇️ Base brands seeded.");
  } catch (err) {
    console.error("🆘 Brands table creation failed:", err.message);
    throw err;
  }
}
function createCarsTable() {
  const db = getDb();
  const createCarTableSql = `
    CREATE TABLE IF NOT EXISTS Cars (
      carId INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER,
      oldCustomerId JSON NULL,
      brandId INTEGER NULL,
      model TEXT NULL,
      year INTEGER NULL,
      vinNumber TEXT NULL,
      plateNumber TEXT NULL,
      km REAL NULL,
      fuelType INTEGER NULL,
      bodyType INTEGER NULL,
      engineVolumeCc INTEGER NULL,
      notes TEXT NULL,
      FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE SET NULL,
      FOREIGN KEY (brandId) REFERENCES Brands(brandId) ON DELETE SET NULL
    )
  `;
  try {
    db.exec(createCarTableSql);
    console.log("❇️ Car table created");
  } catch (err) {
    console.log("🆘 Car table not created", err.message);
    throw err;
  }
}
function createCustomersTable() {
  const db = getDb();
  const createCustomersTableSql = `
    CREATE TABLE IF NOT EXISTS Customers (
        customerId INTEGER PRIMARY KEY AUTOINCREMENT,
        nationalId TEXT NULL,
        firstName  TEXT NOT NULL,
        lastName   TEXT NULL,
        taxNumber  TEXT NULL
    );
`;
  try {
    db.exec(createCustomersTableSql);
    console.log("❇️ Customer table created");
  } catch (err) {
    console.log("🆘Customers table not created", err.message);
    throw err;
  }
}
function createCustomerEmailsTable() {
  const db = getDb();
  const createCustomerEmailTableSql = `
    CREATE TABLE IF NOT EXISTS Emails (
        emailId INTEGER PRIMARY KEY AUTOINCREMENT,
        customerId INTEGER NOT NULL,
        customerEmail TEXT NOT NULL,
        FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE CASCADE
    )
`;
  try {
    db.exec(createCustomerEmailTableSql);
    console.log("❇️ Email table created");
  } catch (err) {
    console.log("🆘Email table not created", err.message);
    throw err;
  }
}
function createCustomerPhoneNumbersTable() {
  const db = getDb();
  const createPhoneNumbersTableSql = `
    CREATE TABLE IF NOT EXISTS PhoneNumbers(
        phoneNumberId INTEGER PRIMARY KEY AUTOINCREMENT,
        customerId  INTEGER NOT NULL,
        countryCode TEXT NOT NULL,
        phoneNumber TEXT NOT NULL,
        FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE CASCADE
        );
`;
  try {
    db.exec(createPhoneNumbersTableSql);
    console.log("❇️ PhoneNumbers table created!");
  } catch (err) {
    console.log("🆘PhoneNumber table not created", err.message);
    throw err;
  }
}
const FuelTypes = sqliteTable("FuelTypes", {
  fuelTypeId: integer("fuelTypeId").primaryKey({ autoIncrement: true }),
  fuelTypeName: text("fuelTypeName").notNull().unique()
});
const baseFuelTypes = [
  { fuelTypeName: "Benzin" },
  { fuelTypeName: "Dizel" },
  { fuelTypeName: "LPG" },
  { fuelTypeName: "Elektrik" },
  { fuelTypeName: "Hibrit" }
];
async function createFuelTypesTable() {
  const db = getDb();
  const orm = useDb();
  const createFuelTypesTableSql = `
    CREATE TABLE IF NOT EXISTS FuelTypes(
        fuelTypeId INTEGER PRIMARY KEY AUTOINCREMENT,
        fuelTypeName TEXT NOT NULL Unique
    )

`;
  try {
    db.exec(createFuelTypesTableSql);
    console.log("❇️ FuelTypes table created");
    try {
      await orm.insert(FuelTypes).values(baseFuelTypes).onConflictDoNothing();
      console.log(" ❇️ Base Fuel types added the table.");
    } catch (err) {
      console.error("🆘 Base Fuel types insert error:", err.message);
      throw err;
    }
  } catch (err) {
    console.log("🆘 FuelTypes table not created", err.message);
    throw err;
  }
}
function createPartsTable() {
  const db = getDb();
  const createPartTableSql = `
    CREATE TABLE IF NOT EXISTS Parts(
        partId INTEGER PRIMARY KEY AUTOINCREMENT,
        carId INTEGER NOT NULL,
        serviceId INTEGER NOT NULL,
        partName TEXT NOT NULL,
        partTax REAL NULL,
        partPrice REAL NULL
    );
`;
  try {
    db.exec(createPartTableSql);
    console.log("❇️ Parts table created");
  } catch (err) {
    console.log("🆘 Parts table not created", err.message);
    throw err;
  }
}
function createServicesTable() {
  const db = getDb();
  const createServicesTableSql = `
        CREATE TABLE IF NOT EXISTS Services(
            serviceId INTEGER PRIMARY KEY AUTOINCREMENT,
            carId INTEGER NOT NULL,
            customerId INTEGER NULL,
            applicationDate DATETIME NULL,
            appointmentDate DATETIME NULL,
            jobDuration INTEGER NULL,
            deliveryDate DATETIME NULL,
            km REAL NULL,
            complaints TEXT NOT NULL,
            extraRequests TEXT NULL,
            faults JSON NULL,
            hasDamageOnReceive BOOLEAN NOT NULL,
            damageOnReceive JSON NULL,
            hasDamageDuringRepair BOOLEAN NULL,
            damageDuringRepair JSON NULL,
            laborCharge REAL NULL,
            totalCharge REAL NULL,
            targetDeliveryDate DATETIME NULL,
            isDelivered BOOLEAN NULL,
            FOREIGN KEY (carId) REFERENCES Cars(carId) ON DELETE CASCADE,
            FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE SET NULL
        )
    `;
  try {
    db.exec(createServicesTableSql);
    console.log("❇️ Services table created");
  } catch (err) {
    console.log("🆘 Services table not created", err.message);
    throw err;
  }
}
const fuelTypeTranslations = sqliteTable("FuelTypeTranslations", {
  translationId: integer("translationId").primaryKey({ autoIncrement: true }),
  fuelTypeId: integer("fuelTypeId").references(() => FuelTypes.fuelTypeId),
  languageCode: text("languageCode").notNull(),
  translatedName: text("translatedName").notNull()
});
const baseFuelTypeTranslations = [
  // Benzin (Gasoline/Petrol) (fuelTypeId: 1)
  { fuelTypeId: 1, languageCode: "en", translatedName: "Gasoline" },
  { fuelTypeId: 1, languageCode: "es", translatedName: "Gasolina" },
  { fuelTypeId: 1, languageCode: "fr", translatedName: "Essence" },
  { fuelTypeId: 1, languageCode: "de", translatedName: "Benzin" },
  { fuelTypeId: 1, languageCode: "pt", translatedName: "Gasolina" },
  { fuelTypeId: 1, languageCode: "zh", translatedName: "汽油" },
  { fuelTypeId: 1, languageCode: "ja", translatedName: "ガソリン" },
  { fuelTypeId: 1, languageCode: "tr", translatedName: "Benzin" },
  { fuelTypeId: 1, languageCode: "ko", translatedName: "휘발유" },
  { fuelTypeId: 1, languageCode: "ru", translatedName: "Бензин" },
  { fuelTypeId: 1, languageCode: "nl", translatedName: "Benzine" },
  { fuelTypeId: 1, languageCode: "az", translatedName: "Benzin" },
  { fuelTypeId: 1, languageCode: "it", translatedName: "Benzina" },
  { fuelTypeId: 1, languageCode: "pl", translatedName: "Benzyna" },
  // Dizel (Diesel) (fuelTypeId: 2)
  { fuelTypeId: 2, languageCode: "en", translatedName: "Diesel" },
  { fuelTypeId: 2, languageCode: "es", translatedName: "Diésel" },
  { fuelTypeId: 2, languageCode: "fr", translatedName: "Diesel" },
  { fuelTypeId: 2, languageCode: "de", translatedName: "Diesel" },
  { fuelTypeId: 2, languageCode: "pt", translatedName: "Diesel" },
  { fuelTypeId: 2, languageCode: "zh", translatedName: "柴油" },
  { fuelTypeId: 2, languageCode: "ja", translatedName: "ディーゼル" },
  { fuelTypeId: 2, languageCode: "tr", translatedName: "Dizel" },
  { fuelTypeId: 2, languageCode: "ko", translatedName: "디젤" },
  { fuelTypeId: 2, languageCode: "ru", translatedName: "Дизель" },
  { fuelTypeId: 2, languageCode: "nl", translatedName: "Diesel" },
  { fuelTypeId: 2, languageCode: "az", translatedName: "Dizel" },
  { fuelTypeId: 2, languageCode: "it", translatedName: "Diesel" },
  { fuelTypeId: 2, languageCode: "pl", translatedName: "Diesel" },
  // LPG (fuelTypeId: 3)
  { fuelTypeId: 3, languageCode: "en", translatedName: "LPG" },
  { fuelTypeId: 3, languageCode: "es", translatedName: "GLP" },
  // Gas Licuado de Petróleo
  { fuelTypeId: 3, languageCode: "fr", translatedName: "GPL" },
  // Gaz de Pétrole Liquéfié
  { fuelTypeId: 3, languageCode: "de", translatedName: "Autogas (LPG)" },
  { fuelTypeId: 3, languageCode: "pt", translatedName: "GPL" },
  // Gás Liquefeito de Petróleo
  { fuelTypeId: 3, languageCode: "zh", translatedName: "液化石油气" },
  { fuelTypeId: 3, languageCode: "ja", translatedName: "LPG" },
  { fuelTypeId: 3, languageCode: "tr", translatedName: "LPG" },
  { fuelTypeId: 3, languageCode: "ko", translatedName: "LPG" },
  { fuelTypeId: 3, languageCode: "ru", translatedName: "СНГ" },
  // Сжиженный нефтяной газ
  { fuelTypeId: 3, languageCode: "nl", translatedName: "LPG" },
  { fuelTypeId: 3, languageCode: "az", translatedName: "LPG" },
  { fuelTypeId: 3, languageCode: "it", translatedName: "GPL" },
  // Gas di Petrolio Liquefatti
  { fuelTypeId: 3, languageCode: "pl", translatedName: "LPG" },
  // Elektrik (Electric) (fuelTypeId: 4)
  { fuelTypeId: 4, languageCode: "en", translatedName: "Electric" },
  { fuelTypeId: 4, languageCode: "es", translatedName: "Eléctrico" },
  { fuelTypeId: 4, languageCode: "fr", translatedName: "Électrique" },
  { fuelTypeId: 4, languageCode: "de", translatedName: "Elektro" },
  { fuelTypeId: 4, languageCode: "pt", translatedName: "Elétrico" },
  { fuelTypeId: 4, languageCode: "zh", translatedName: "电动" },
  { fuelTypeId: 4, languageCode: "ja", translatedName: "電気" },
  { fuelTypeId: 4, languageCode: "tr", translatedName: "Elektrik" },
  { fuelTypeId: 4, languageCode: "ko", translatedName: "전기" },
  { fuelTypeId: 4, languageCode: "ru", translatedName: "Электро" },
  { fuelTypeId: 4, languageCode: "nl", translatedName: "Elektrisch" },
  { fuelTypeId: 4, languageCode: "az", translatedName: "Elektrik" },
  { fuelTypeId: 4, languageCode: "it", translatedName: "Elettrica" },
  { fuelTypeId: 4, languageCode: "pl", translatedName: "Elektryczny" },
  // Hibrit (Hybrid) (fuelTypeId: 5)
  { fuelTypeId: 5, languageCode: "en", translatedName: "Hybrid" },
  { fuelTypeId: 5, languageCode: "es", translatedName: "Híbrido" },
  { fuelTypeId: 5, languageCode: "fr", translatedName: "Hybride" },
  { fuelTypeId: 5, languageCode: "de", translatedName: "Hybrid" },
  { fuelTypeId: 5, languageCode: "pt", translatedName: "Híbrido" },
  { fuelTypeId: 5, languageCode: "zh", translatedName: "混合动力" },
  { fuelTypeId: 5, languageCode: "ja", translatedName: "ハイブリッド" },
  { fuelTypeId: 5, languageCode: "tr", translatedName: "Hibrit" },
  { fuelTypeId: 5, languageCode: "ko", translatedName: "하이브리드" },
  { fuelTypeId: 5, languageCode: "ru", translatedName: "Гибрид" },
  { fuelTypeId: 5, languageCode: "nl", translatedName: "Hybride" },
  { fuelTypeId: 5, languageCode: "az", translatedName: "Hibrid" },
  { fuelTypeId: 5, languageCode: "it", translatedName: "Ibrida" },
  { fuelTypeId: 5, languageCode: "pl", translatedName: "Hybryda" }
];
const baseFuelTypeTranslationsSql = `
  CREATE TABLE IF NOT EXISTS FuelTypeTranslations (
  translationId INTEGER PRIMARY KEY AUTOINCREMENT,
  FuelTypeId INTEGER NOT NULL,
  languageCode TEXT NOT NULL,
  translatedName TEXT NOT NULL,
  FOREIGN KEY (fuelTypeId) REFERENCES FuelTypes(fuelTypeId)
);
`;
async function createFuelTypesTranslationsTable() {
  const db = getDb();
  const orm = useDb();
  try {
    db.exec(baseFuelTypeTranslationsSql);
    console.log("❇️ Translations Base FuelType translations table created");
    try {
      const existing = db.prepare("SELECT COUNT(*) AS count FROM FuelTypeTranslations").get();
      if (existing.count === 0) {
        await orm.insert(fuelTypeTranslations).values(baseFuelTypeTranslations);
      }
      console.log("❇️ Translations Base FuelType insert success");
    } catch (err) {
      console.log("🆘 Translations Base FuelType not insert.", err.message);
      throw err;
    }
  } catch (err) {
    console.log("🆘 Translations Base FuelType translations table not created | Error: ", err.message);
    throw err;
  }
}
const bodyTypeTranslations = sqliteTable("BodyTypeTranslations", {
  translationId: integer("translationId").primaryKey({ autoIncrement: true }),
  bodyTypeId: integer("bodyTypeId").references(() => BodyTypes.bodyTypeId),
  languageCode: text("languageCode").notNull(),
  translatedName: text("translatedName").notNull()
});
const baseBodyTypeTranslationsSql = `
  CREATE TABLE IF NOT EXISTS BodyTypeTranslations (
  translationId INTEGER PRIMARY KEY AUTOINCREMENT,
  bodyTypeId INTEGER NOT NULL,
  languageCode TEXT NOT NULL,
  translatedName TEXT NOT NULL,
  FOREIGN KEY (bodyTypeId) REFERENCES BodyTypes(bodyTypeId)
);
`;
const baseBodyTypeTranslations = [
  // Sedan (bodyTypeId: 1)
  { bodyTypeId: 1, languageCode: "en", translatedName: "Sedan" },
  { bodyTypeId: 1, languageCode: "es", translatedName: "Sedán" },
  { bodyTypeId: 1, languageCode: "fr", translatedName: "Berline" },
  { bodyTypeId: 1, languageCode: "de", translatedName: "Limousine" },
  { bodyTypeId: 1, languageCode: "pt", translatedName: "Sedã" },
  { bodyTypeId: 1, languageCode: "zh", translatedName: "轿车" },
  { bodyTypeId: 1, languageCode: "ja", translatedName: "セダン" },
  { bodyTypeId: 1, languageCode: "tr", translatedName: "Sedan" },
  { bodyTypeId: 1, languageCode: "ko", translatedName: "세단" },
  { bodyTypeId: 1, languageCode: "ru", translatedName: "Седан" },
  { bodyTypeId: 1, languageCode: "nl", translatedName: "Sedan" },
  { bodyTypeId: 1, languageCode: "az", translatedName: "Sedan" },
  { bodyTypeId: 1, languageCode: "it", translatedName: "Berlina" },
  { bodyTypeId: 1, languageCode: "pl", translatedName: "Sedan" },
  // Hatchback (bodyTypeId: 2)
  { bodyTypeId: 2, languageCode: "en", translatedName: "Hatchback" },
  { bodyTypeId: 2, languageCode: "es", translatedName: "Hatchback" },
  { bodyTypeId: 2, languageCode: "fr", translatedName: "Hayon" },
  { bodyTypeId: 2, languageCode: "de", translatedName: "Kompaktwagen" },
  { bodyTypeId: 2, languageCode: "pt", translatedName: "Hatch" },
  { bodyTypeId: 2, languageCode: "zh", translatedName: "掀背车" },
  { bodyTypeId: 2, languageCode: "ja", translatedName: "ハッチバック" },
  { bodyTypeId: 2, languageCode: "tr", translatedName: "Hatchback" },
  { bodyTypeId: 2, languageCode: "ko", translatedName: "해치백" },
  { bodyTypeId: 2, languageCode: "ru", translatedName: "Хэтчбек" },
  { bodyTypeId: 2, languageCode: "nl", translatedName: "Hatchback" },
  { bodyTypeId: 2, languageCode: "az", translatedName: "Hatchback" },
  { bodyTypeId: 2, languageCode: "it", translatedName: "Hatchback" },
  { bodyTypeId: 2, languageCode: "pl", translatedName: "Hatchback" },
  // SUV (bodyTypeId: 3)
  { bodyTypeId: 3, languageCode: "en", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "es", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "fr", translatedName: "VUS" },
  { bodyTypeId: 3, languageCode: "de", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "pt", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "zh", translatedName: "越野车" },
  { bodyTypeId: 3, languageCode: "ja", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "tr", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "ko", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "ru", translatedName: "Внедорожник" },
  { bodyTypeId: 3, languageCode: "nl", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "az", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "it", translatedName: "SUV" },
  { bodyTypeId: 3, languageCode: "pl", translatedName: "SUV" },
  // Coupe (bodyTypeId: 4)
  { bodyTypeId: 4, languageCode: "en", translatedName: "Coupe" },
  { bodyTypeId: 4, languageCode: "es", translatedName: "Cupé" },
  { bodyTypeId: 4, languageCode: "fr", translatedName: "Coupé" },
  { bodyTypeId: 4, languageCode: "de", translatedName: "Coupé" },
  { bodyTypeId: 4, languageCode: "pt", translatedName: "Cupê" },
  { bodyTypeId: 4, languageCode: "zh", translatedName: "双门轿跑车" },
  { bodyTypeId: 4, languageCode: "ja", translatedName: "クーペ" },
  { bodyTypeId: 4, languageCode: "tr", translatedName: "Coupe" },
  { bodyTypeId: 4, languageCode: "ko", translatedName: "쿠페" },
  { bodyTypeId: 4, languageCode: "ru", translatedName: "Купе" },
  { bodyTypeId: 4, languageCode: "nl", translatedName: "Coupé" },
  { bodyTypeId: 4, languageCode: "az", translatedName: "Coupe" },
  { bodyTypeId: 4, languageCode: "it", translatedName: "Coupé" },
  { bodyTypeId: 4, languageCode: "pl", translatedName: "Coupe" },
  // Station Wagon (bodyTypeId: 5)
  { bodyTypeId: 5, languageCode: "en", translatedName: "Station Wagon" },
  { bodyTypeId: 5, languageCode: "es", translatedName: "Familiar" },
  { bodyTypeId: 5, languageCode: "fr", translatedName: "Break" },
  { bodyTypeId: 5, languageCode: "de", translatedName: "Kombi" },
  { bodyTypeId: 5, languageCode: "pt", translatedName: "Perua" },
  { bodyTypeId: 5, languageCode: "zh", translatedName: "旅行车" },
  { bodyTypeId: 5, languageCode: "ja", translatedName: "ステーションワゴン" },
  { bodyTypeId: 5, languageCode: "tr", translatedName: "Station Wagon" },
  { bodyTypeId: 5, languageCode: "ko", translatedName: "스테이션 왜건" },
  { bodyTypeId: 5, languageCode: "ru", translatedName: "Универсал" },
  { bodyTypeId: 5, languageCode: "nl", translatedName: "Stationwagen" },
  { bodyTypeId: 5, languageCode: "az", translatedName: "Universal" },
  { bodyTypeId: 5, languageCode: "it", translatedName: "Familiare" },
  { bodyTypeId: 5, languageCode: "pl", translatedName: "Kombi" },
  // MPV (bodyTypeId: 6)
  { bodyTypeId: 6, languageCode: "en", translatedName: "MPV" },
  { bodyTypeId: 6, languageCode: "es", translatedName: "Monovolumen" },
  { bodyTypeId: 6, languageCode: "fr", translatedName: "Monospace" },
  { bodyTypeId: 6, languageCode: "de", translatedName: "Van" },
  { bodyTypeId: 6, languageCode: "pt", translatedName: "Minivan" },
  { bodyTypeId: 6, languageCode: "zh", translatedName: "多功能车" },
  { bodyTypeId: 6, languageCode: "ja", translatedName: "ミニバン" },
  { bodyTypeId: 6, languageCode: "tr", translatedName: "MPV" },
  { bodyTypeId: 6, languageCode: "ko", translatedName: "미니밴" },
  { bodyTypeId: 6, languageCode: "ru", translatedName: "Минивэн" },
  { bodyTypeId: 6, languageCode: "nl", translatedName: "MPV" },
  { bodyTypeId: 6, languageCode: "az", translatedName: "MPV" },
  { bodyTypeId: 6, languageCode: "it", translatedName: "Monovolume" },
  { bodyTypeId: 6, languageCode: "pl", translatedName: "Minivan" },
  // Crossover (bodyTypeId: 7)
  { bodyTypeId: 7, languageCode: "en", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "es", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "fr", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "de", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "pt", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "zh", translatedName: "跨界车" },
  { bodyTypeId: 7, languageCode: "ja", translatedName: "クロスオーバー" },
  { bodyTypeId: 7, languageCode: "tr", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "ko", translatedName: "크로스오버" },
  { bodyTypeId: 7, languageCode: "ru", translatedName: "Кроссовер" },
  { bodyTypeId: 7, languageCode: "nl", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "az", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "it", translatedName: "Crossover" },
  { bodyTypeId: 7, languageCode: "pl", translatedName: "Crossover" },
  // Pickup (bodyTypeId: 8)
  { bodyTypeId: 8, languageCode: "en", translatedName: "Pickup" },
  { bodyTypeId: 8, languageCode: "es", translatedName: "Camioneta" },
  { bodyTypeId: 8, languageCode: "fr", translatedName: "Pickup" },
  { bodyTypeId: 8, languageCode: "de", translatedName: "Pickup" },
  { bodyTypeId: 8, languageCode: "pt", translatedName: "Caminhonete" },
  { bodyTypeId: 8, languageCode: "zh", translatedName: "皮卡" },
  { bodyTypeId: 8, languageCode: "ja", translatedName: "ピックアップ" },
  { bodyTypeId: 8, languageCode: "tr", translatedName: "Pickup" },
  { bodyTypeId: 8, languageCode: "ko", translatedName: "픽업" },
  { bodyTypeId: 8, languageCode: "ru", translatedName: "Пикап" },
  { bodyTypeId: 8, languageCode: "nl", translatedName: "Pick-up" },
  { bodyTypeId: 8, languageCode: "az", translatedName: "Pickup" },
  { bodyTypeId: 8, languageCode: "it", translatedName: "Pick-up" },
  { bodyTypeId: 8, languageCode: "pl", translatedName: "Pickup" },
  // Convertible (bodyTypeId: 9)
  { bodyTypeId: 9, languageCode: "en", translatedName: "Convertible" },
  { bodyTypeId: 9, languageCode: "es", translatedName: "Descapotable" },
  { bodyTypeId: 9, languageCode: "fr", translatedName: "Cabriolet" },
  { bodyTypeId: 9, languageCode: "de", translatedName: "Cabrio" },
  { bodyTypeId: 9, languageCode: "pt", translatedName: "Conversível" },
  { bodyTypeId: 9, languageCode: "zh", translatedName: "敞篷车" },
  { bodyTypeId: 9, languageCode: "ja", translatedName: "コンバーチブル" },
  { bodyTypeId: 9, languageCode: "tr", translatedName: "Cabrio" },
  { bodyTypeId: 9, languageCode: "ko", translatedName: "컨버터블" },
  { bodyTypeId: 9, languageCode: "ru", translatedName: "Кабриолет" },
  { bodyTypeId: 9, languageCode: "nl", translatedName: "Cabriolet" },
  { bodyTypeId: 9, languageCode: "az", translatedName: "Cabriolet" },
  { bodyTypeId: 9, languageCode: "it", translatedName: "Decappottabile" },
  { bodyTypeId: 9, languageCode: "pl", translatedName: "Kabriolet" }
];
async function createBodyTypesTranslationsTable() {
  const db = getDb();
  const orm = useDb();
  try {
    db.exec(baseBodyTypeTranslationsSql);
    console.log("❇️ Translations Base body translations table created");
    try {
      const existing = db.prepare("SELECT COUNT(*) AS count FROM BodyTypeTranslations").get();
      if (existing.count === 0) {
        await orm.insert(bodyTypeTranslations).values(baseBodyTypeTranslations);
      }
      console.log("❇️ Translations Base body types insert success");
    } catch (err) {
      console.log("🆘 Translations Base body types not insert.", err.message);
      throw err;
    }
  } catch (err) {
    console.log("🆘 Translations Base body translations table not created | Error: ", err.message);
    throw err;
  }
}
const CURRENT_SCHEMA_VERSION = 6;
const ATOMIC_MIGRATIONS = /* @__PURE__ */ new Set([1, 4, 6]);
function tableHasForeignKey(tableName, fromColumn, targetTable, onDelete) {
  const db = getDb();
  const rows = db.pragma(`foreign_key_list(${tableName})`);
  return rows.some(
    (row) => row.from === fromColumn && row.table === targetTable && row.on_delete.toUpperCase() === onDelete.toUpperCase()
  );
}
function assertNoOrphans() {
  const db = getDb();
  const checks = [
    ["PhoneNumbers", "customerId", "Customers", false],
    ["Emails", "customerId", "Customers", false],
    ["Cars", "customerId", "Customers", true],
    ["Services", "customerId", "Customers", true],
    ["Services", "carId", "Cars", false]
  ];
  for (const [child, column, parent, nullable] of checks) {
    const condition = nullable ? `c.${column} IS NOT NULL AND c.${column} NOT IN (SELECT p.${parent === "Customers" ? "customerId" : "carId"} FROM ${parent} p)` : `c.${column} NOT IN (SELECT p.${parent === "Customers" ? "customerId" : "carId"} FROM ${parent} p)`;
    const row = db.prepare(`SELECT COUNT(*) AS count FROM ${child} c WHERE ${condition}`).get();
    if (row.count > 0) {
      throw new Error(
        `Database migration stopped: ${row.count} orphaned ${child}.${column} record(s) reference missing ${parent} records.`
      );
    }
  }
}
function migrateCustomerRelationships() {
  const db = getDb();
  const requirements = [
    ["PhoneNumbers", "customerId", "Customers", "CASCADE"],
    ["Emails", "customerId", "Customers", "CASCADE"],
    ["Cars", "customerId", "Customers", "SET NULL"],
    ["Services", "carId", "Cars", "CASCADE"],
    ["Services", "customerId", "Customers", "SET NULL"]
  ];
  const needsMigration = requirements.some(
    ([table, column, parent, action]) => !tableHasForeignKey(table, column, parent, action)
  );
  if (!needsMigration) return;
  assertNoOrphans();
  db.pragma("foreign_keys = OFF");
  const carColumns = db.pragma("table_info(Cars)");
  const legacyCarsUseModelId = carColumns.some((column) => column.name === "modelId");
  const carsHaveEngineVolume = carColumns.some((column) => column.name === "engineVolumeCc");
  const carsHaveNotes = carColumns.some((column) => column.name === "notes");
  try {
    db.transaction(() => {
      db.exec(`
        CREATE TABLE PhoneNumbers_new (
          phoneNumberId INTEGER PRIMARY KEY AUTOINCREMENT,
          customerId INTEGER NOT NULL,
          countryCode TEXT NOT NULL,
          phoneNumber TEXT NOT NULL,
          FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE CASCADE
        );
        INSERT INTO PhoneNumbers_new SELECT phoneNumberId, customerId, countryCode, phoneNumber FROM PhoneNumbers;
        DROP TABLE PhoneNumbers;
        ALTER TABLE PhoneNumbers_new RENAME TO PhoneNumbers;

        CREATE TABLE Emails_new (
          emailId INTEGER PRIMARY KEY AUTOINCREMENT,
          customerId INTEGER NOT NULL,
          customerEmail TEXT NOT NULL,
          FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE CASCADE
        );
        INSERT INTO Emails_new SELECT emailId, customerId, customerEmail FROM Emails;
        DROP TABLE Emails;
        ALTER TABLE Emails_new RENAME TO Emails;

        CREATE TABLE Cars_new (
          carId INTEGER PRIMARY KEY AUTOINCREMENT,
          customerId INTEGER,
          oldCustomerId JSON NULL,
          brandId INTEGER NULL,
          model TEXT NULL,
          year INTEGER NULL,
          vinNumber TEXT NULL,
          plateNumber TEXT NULL,
          km REAL NULL,
          fuelType INTEGER NULL,
          bodyType INTEGER NULL,
          engineVolumeCc INTEGER NULL,
          notes TEXT NULL,
          FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE SET NULL
        );

        INSERT INTO Cars_new (
          carId, customerId, oldCustomerId, brandId, model, year,
          vinNumber, plateNumber, km, fuelType, bodyType, engineVolumeCc, notes
        )
        SELECT
          carId, customerId, oldCustomerId, brandId, ${legacyCarsUseModelId ? "NULL" : "model"}, year,
          vinNumber, plateNumber, km, fuelType, bodyType,
          ${carsHaveEngineVolume ? "engineVolumeCc" : "NULL"}, ${carsHaveNotes ? "notes" : "NULL"}
        FROM Cars;

        DROP TABLE Cars;
        ALTER TABLE Cars_new RENAME TO Cars;

        CREATE TABLE Services_new (
          serviceId INTEGER PRIMARY KEY AUTOINCREMENT,
          carId INTEGER NOT NULL,
          customerId INTEGER NULL,
          applicationDate DATETIME NULL,
          appointmentDate DATETIME NULL,
          jobDuration INTEGER NULL,
          deliveryDate DATETIME NULL,
          km REAL NULL,
          complaints TEXT NOT NULL,
          extraRequests TEXT NULL,
          faults JSON NULL,
          hasDamageOnReceive BOOLEAN NOT NULL,
          damageOnReceive JSON NULL,
          hasDamageDuringRepair BOOLEAN NULL,
          damageDuringRepair JSON NULL,
          laborCharge REAL NULL,
          totalCharge REAL NULL,
          targetDeliveryDate DATETIME NULL,
          isDelivered BOOLEAN NULL,
          FOREIGN KEY (carId) REFERENCES Cars(carId) ON DELETE CASCADE,
          FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE SET NULL
        );
        INSERT INTO Services_new SELECT serviceId, carId, customerId, applicationDate, appointmentDate, jobDuration, deliveryDate, km, complaints, extraRequests, faults, hasDamageOnReceive, damageOnReceive, hasDamageDuringRepair, damageDuringRepair, laborCharge, totalCharge, targetDeliveryDate, isDelivered FROM Services;
        DROP TABLE Services;
        ALTER TABLE Services_new RENAME TO Services;
      `);
    })();
  } finally {
    db.pragma("foreign_keys = ON");
  }
  const violations = db.pragma("foreign_key_check");
  if (violations.length > 0) {
    throw new Error(`Database migration failed: ${violations.length} foreign key violation(s) remain.`);
  }
}
function migrateCarBrandAndModel() {
  const db = getDb();
  const columns = db.pragma("table_info(Cars)");
  const hasModelColumn = columns.some((column) => column.name === "model");
  const hasModelIdColumn = columns.some((column) => column.name === "modelId");
  const hasBrandIdColumn = columns.some((column) => column.name === "brandId");
  if (!hasBrandIdColumn) {
    throw new Error("Database migration stopped: Cars.brandId column is missing.");
  }
  const hasBrandForeignKey = tableHasForeignKey(
    "Cars",
    "brandId",
    "Brands",
    "SET NULL"
  );
  if (hasModelColumn && !hasModelIdColumn && hasBrandForeignKey) {
    return;
  }
  const orphanBrands = db.prepare(`
      SELECT COUNT(*) AS count
      FROM Cars
      WHERE brandId IS NOT NULL
        AND brandId NOT IN (SELECT brandId FROM Brands)
    `).get();
  if (orphanBrands.count > 0) {
    throw new Error(
      `Database migration stopped: ${orphanBrands.count} car(s) reference missing Brands records.`
    );
  }
  db.pragma("foreign_keys = OFF");
  const carColumns = db.pragma("table_info(Cars)");
  const carsHaveEngineVolume = carColumns.some((column) => column.name === "engineVolumeCc");
  const carsHaveNotes = carColumns.some((column) => column.name === "notes");
  try {
    db.transaction(() => {
      db.exec(`
        CREATE TABLE Cars_new (
          carId INTEGER PRIMARY KEY AUTOINCREMENT,
          customerId INTEGER,
          oldCustomerId JSON NULL,
          brandId INTEGER NULL,
          model TEXT NULL,
          year INTEGER NULL,
          vinNumber TEXT NULL,
          plateNumber TEXT NULL,
          km REAL NULL,
          fuelType INTEGER NULL,
          bodyType INTEGER NULL,
          engineVolumeCc INTEGER NULL,
          notes TEXT NULL,
          FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE SET NULL,
          FOREIGN KEY (brandId) REFERENCES Brands(brandId) ON DELETE SET NULL
        );

        INSERT INTO Cars_new (
          carId, customerId, oldCustomerId, brandId, model, year,
          vinNumber, plateNumber, km, fuelType, bodyType, engineVolumeCc, notes
        )
        SELECT
          carId, customerId, oldCustomerId, brandId, NULL, year,
          vinNumber, plateNumber, km, fuelType, bodyType,
          ${carsHaveEngineVolume ? "engineVolumeCc" : "NULL"}, ${carsHaveNotes ? "notes" : "NULL"}
        FROM Cars;

        DROP TABLE Cars;
        ALTER TABLE Cars_new RENAME TO Cars;
      `);
    })();
  } finally {
    db.pragma("foreign_keys = ON");
  }
  const violations = db.pragma("foreign_key_check");
  if (violations.length > 0) {
    throw new Error(
      `Car brand/model migration failed: ${violations.length} foreign key violation(s) remain.`
    );
  }
}
async function runMigration(version) {
  switch (version) {
    case 1:
      await createCustomersTable();
      await createBrandsTable();
      await createFuelTypesTable();
      await createBodyTypesTable();
      await createCarsTable();
      await createFuelTypesTranslationsTable();
      await createBodyTypesTranslationsTable();
      await createCustomerPhoneNumbersTable();
      await createCustomerEmailsTable();
      await createServicesTable();
      await createPartsTable();
      break;
    case 2:
      migrateCustomerRelationships();
      break;
    case 3:
      migrateCustomerRelationships();
      break;
    case 4:
      getDb().exec("UPDATE Services SET jobDuration = NULL WHERE jobDuration IS NOT NULL");
      break;
    case 5:
      migrateCarBrandAndModel();
      break;
    case 6:
      {
        const db = getDb();
        const columns = db.pragma("table_info(Cars)");
        if (!columns.some((column) => column.name === "engineVolumeCc")) {
          db.exec("ALTER TABLE Cars ADD COLUMN engineVolumeCc INTEGER NULL");
        }
        if (!columns.some((column) => column.name === "notes")) {
          db.exec("ALTER TABLE Cars ADD COLUMN notes TEXT NULL");
        }
      }
      break;
    default:
      throw new Error(`Unknown database migration: ${version}`);
  }
}
async function runDatabaseMigrations() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      appliedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  const appliedRows = db.prepare("SELECT version FROM schema_migrations ORDER BY version").all();
  const applied = new Set(appliedRows.map((row) => row.version));
  for (let version = 1; version <= CURRENT_SCHEMA_VERSION; version += 1) {
    if (applied.has(version)) continue;
    if (ATOMIC_MIGRATIONS.has(version)) {
      db.exec("BEGIN IMMEDIATE");
      try {
        await runMigration(version);
        db.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(version);
        db.exec("COMMIT");
      } catch (error) {
        if (db.inTransaction) db.exec("ROLLBACK");
        throw error;
      }
    } else {
      await runMigration(version);
      db.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(version);
    }
    console.log(`❇️ Database migration ${version} applied.`);
  }
}
async function CreateDefaultDbTables() {
  await runDatabaseMigrations();
}
const CONFIG_FILE_NAME = "config.json";
function getConfigPath() {
  return path.join(app.getPath("userData"), CONFIG_FILE_NAME);
}
function getConfig() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) return null;
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.language || !parsed.savePath || parsed.eulaAccepted !== true) {
      return null;
    }
    const normalizedDbPath = path.normalize(path.resolve(parsed.savePath));
    if (path.basename(normalizedDbPath) !== "data_carArchiver.sqlite" || !fs.existsSync(normalizedDbPath) || !fs.statSync(normalizedDbPath).isFile()) {
      return null;
    }
    return {
      language: parsed.language,
      savePath: normalizedDbPath,
      eulaAccepted: parsed.eulaAccepted,
      theme: parsed.theme === "dark" ? "dark" : "light",
      onboardingCompleted: parsed.onboardingCompleted ?? true
    };
  } catch (error) {
    console.error("🆘 Config could not be read:", error);
    return null;
  }
}
function saveConfig(config) {
  const configPath = getConfigPath();
  const directory = path.dirname(configPath);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}
function hasConfig() {
  return getConfig() !== null;
}
class ServiceResponse {
  // Başarılı Tekil Veri
  static success(data, message = "Operation successful") {
    return {
      success: true,
      status: "success",
      message,
      data
    };
  }
  // Başarılı Liste (Sayfalamalı)
  static successPaginated(data, totalRecords, page, pageSize, message = "List fetched successfully") {
    return {
      success: true,
      status: "success",
      message,
      data,
      meta: {
        page,
        pageSize,
        totalRecords,
        totalPages: Math.ceil(totalRecords / pageSize)
      }
    };
  }
  // İş Kuralı Hatası (Örn: "Stok yetersiz")
  static fail(message, code) {
    return {
      success: false,
      status: "fail",
      message,
      code
    };
  }
  // Sistem Hatası (Try-Catch blokları için)
  static error(error, message = "An unexpected error occurred") {
    console.error("System Error:", error);
    return {
      success: false,
      status: "error",
      message,
      data: void 0
    };
  }
  // Validasyon Hatası (Formlar için)
  static validationError(errors, message = "Validation failed") {
    return {
      success: false,
      status: "validation_error",
      message,
      validationErrors: errors
    };
  }
}
class BaseRepository {
  constructor(table, idColumn) {
    __publicField(this, "table");
    __publicField(this, "idColumn");
    this.table = table;
    this.idColumn = idColumn;
  }
  handleError(error, defaultMessage) {
    console.error("❌ Database Error:", error);
    const message = error instanceof Error ? error.message : "";
    const code = typeof error === "object" && error !== null && "code" in error ? error.code : void 0;
    if (code === "SQLITE_CONSTRAINT_UNIQUE") {
      return ServiceResponse.fail("This record already exists.", "UNIQUE_CONSTRAINT");
    }
    if (message.includes("not been initialized")) {
      return ServiceResponse.error(error, "Database connection is not ready.");
    }
    return ServiceResponse.error(error, defaultMessage);
  }
  async create(data) {
    try {
      const result = await useDb().insert(this.table).values(data).returning();
      return ServiceResponse.success(result[0], "Created successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to create record.");
    }
  }
  async getAll(options) {
    try {
      const db = useDb();
      let query = db.select().from(this.table).$dynamic();
      const columns = getTableColumns(this.table);
      const orderByCol = columns[this.idColumn];
      if (orderByCol) {
        query = query.orderBy(desc(orderByCol));
      }
      if ((options == null ? void 0 : options.page) && (options == null ? void 0 : options.pageSize)) {
        const limit = options.pageSize;
        const offset = (options.page - 1) * limit;
        query = query.limit(limit).offset(offset);
        const countResult = await db.select({ count: sql`count(*)` }).from(this.table);
        const totalRecords = Number(countResult[0].count);
        const result2 = await query;
        return ServiceResponse.successPaginated(
          result2,
          totalRecords,
          options.page,
          options.pageSize
        );
      }
      const result = await query;
      return ServiceResponse.success(result, "Records fetched.");
    } catch (err) {
      return this.handleError(err, "Failed to fetch records.");
    }
  }
  async getById(id) {
    try {
      const columns = getTableColumns(this.table);
      const idCol = columns[this.idColumn];
      if (!idCol) throw new Error(`Invalid ID column: ${this.idColumn}`);
      const result = await useDb().select().from(this.table).where(eq(idCol, id));
      if (result[0]) {
        return ServiceResponse.success(result[0], "Record found.");
      }
      return ServiceResponse.fail("Record not found.", "NOT_FOUND");
    } catch (err) {
      return this.handleError(err, "Failed to fetch record.");
    }
  }
  async update(id, data) {
    try {
      const columns = getTableColumns(this.table);
      const idCol = columns[this.idColumn];
      const result = await useDb().update(this.table).set(data).where(eq(idCol, id)).returning();
      if (result[0]) {
        return ServiceResponse.success(result[0], "Updated successfully.");
      }
      return ServiceResponse.fail("Record not found.", "NOT_FOUND");
    } catch (err) {
      return this.handleError(err, "Failed to update record.");
    }
  }
  async delete(id) {
    try {
      const columns = getTableColumns(this.table);
      const idCol = columns[this.idColumn];
      const result = await useDb().delete(this.table).where(eq(idCol, id)).returning();
      if (result.length > 0) {
        return ServiceResponse.success(void 0, "Deleted successfully.");
      }
      return ServiceResponse.fail("Record not found.", "NOT_FOUND");
    } catch (err) {
      return this.handleError(err, "Failed to delete record.");
    }
  }
  async count() {
    try {
      const result = await useDb().select({ count: sql`count(*)` }).from(this.table);
      const total = Number(result[0].count);
      return ServiceResponse.success(total, "Count fetched successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to fetch count.");
    }
  }
}
class BrandsRepository extends BaseRepository {
  constructor() {
    super(Brands, "brandId");
  }
  async findByName(brandName) {
    try {
      const normalizedName = brandName.trim();
      const result = await useDb().select().from(Brands).where(
        sql`LOWER(${Brands.brandName}) = LOWER(${normalizedName})`
      ).limit(1);
      if (result.length > 0) {
        return ServiceResponse.success(result[0], "Brand found.");
      }
      return ServiceResponse.success(void 0, "Brand not found.");
    } catch (error) {
      return this.handleError(error, "Failed to find brand.");
    }
  }
}
const Customers = sqliteTable("Customers", {
  customerId: integer("customerId").primaryKey({ autoIncrement: true }),
  nationalId: text("nationalId"),
  firstName: text("firstName").notNull(),
  lastName: text("lastName"),
  taxNumber: text("taxNumber")
});
const Cars = sqliteTable("Cars", {
  carId: integer("carId").primaryKey({ autoIncrement: true }),
  customerId: integer("customerId").references(() => Customers.customerId, { onDelete: "set null" }),
  oldCustomerId: text("oldCustomerId", { mode: "json" }).$type().default([]),
  brandId: integer("brandId").references(() => Brands.brandId, { onDelete: "set null" }),
  model: text("model"),
  year: integer("year"),
  vinNumber: text("vinNumber"),
  plateNumber: text("plateNumber"),
  km: real("km"),
  fuelType: integer("fuelType"),
  bodyType: integer("bodyType"),
  engineVolumeCc: integer("engineVolumeCc"),
  notes: text("notes")
});
class CarsRepository extends BaseRepository {
  constructor() {
    super(Cars, "carId");
  }
  async getByCustomerId(customerId) {
    try {
      const result = await useDb().select().from(Cars).where(eq(Cars.customerId, customerId));
      return ServiceResponse.success(
        result,
        "Customer's cars fetched successfully."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch cars by customer.");
    }
  }
  async getByBrandId(brandId) {
    try {
      const result = await useDb().select().from(Cars).where(eq(Cars.brandId, brandId));
      return ServiceResponse.success(
        result,
        "Cars fetched by brand."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch cars by brand.");
    }
  }
  async getByYear(year) {
    try {
      const result = await useDb().select().from(Cars).where(eq(Cars.year, year));
      return ServiceResponse.success(
        result,
        `Cars from year ${year} fetched.`
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch cars by year.");
    }
  }
  async getByFuelType(fuelType) {
    try {
      const result = await useDb().select().from(Cars).where(eq(Cars.fuelType, fuelType));
      return ServiceResponse.success(
        result,
        "Cars fetched by fuel type."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch cars by fuel type.");
    }
  }
  async getByBodyType(bodyType) {
    try {
      const result = await useDb().select().from(Cars).where(eq(Cars.bodyType, bodyType));
      return ServiceResponse.success(
        result,
        "Cars fetched by body type."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch cars by body type.");
    }
  }
  async getByVinNumber(vinNumber) {
    try {
      const result = await useDb().select().from(Cars).where(eq(Cars.vinNumber, vinNumber));
      const car = result[0];
      if (car) {
        return ServiceResponse.success(
          car,
          "Car found by VIN."
        );
      }
      return ServiceResponse.fail("No car found with this VIN number.", "NOT_FOUND");
    } catch (err) {
      return this.handleError(err, "Failed to fetch car by VIN.");
    }
  }
  async getByPlateNumber(plateNumber) {
    try {
      const result = await useDb().select().from(Cars).where(eq(Cars.plateNumber, plateNumber));
      const car = result[0];
      if (car) {
        return ServiceResponse.success(
          car,
          "Car found by Plate Number."
        );
      }
      return ServiceResponse.fail("No car found with this Plate Number.", "NOT_FOUND");
    } catch (err) {
      return this.handleError(err, "Failed to fetch car by Plate Number.");
    }
  }
  async addOldCustomer(carId, oldCustomerIdToAdd) {
    try {
      const result = await useDb().select().from(Cars).where(eq(Cars.carId, carId));
      const car = result[0];
      if (!car) {
        return ServiceResponse.fail("Car not found.", "NOT_FOUND");
      }
      const currentIds = car.oldCustomerId ?? [];
      const idToAddStr = oldCustomerIdToAdd.toString();
      if (currentIds.includes(idToAddStr)) {
        return ServiceResponse.success("ID already exists in history", "Customer already exists in car history.");
      }
      const updatedList = [...currentIds, idToAddStr];
      await useDb().update(Cars).set({ oldCustomerId: updatedList }).where(eq(Cars.carId, carId));
      return ServiceResponse.success("Success", "Old customer added successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to add old customer.");
    }
  }
  async getOldCustomers(carId) {
    try {
      const result = await useDb().select().from(Cars).where(eq(Cars.carId, carId));
      const car = result[0];
      if (!car) {
        return ServiceResponse.fail("Car not found.", "NOT_FOUND");
      }
      const currentIds = car.oldCustomerId ?? [];
      const idList = currentIds.map((id) => Number(id)).filter(Number.isInteger);
      return ServiceResponse.success(idList, "Old customers retrieved successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to get old customers.");
    }
  }
  async removeOldCustomer(carId, oldCustomerIdToRemove) {
    try {
      const result = await useDb().select().from(Cars).where(eq(Cars.carId, carId));
      const car = result[0];
      if (!car) return ServiceResponse.fail("Car not found.", "NOT_FOUND");
      const currentIds = car.oldCustomerId ?? [];
      const idToRemove = oldCustomerIdToRemove.toString();
      const updatedList = currentIds.filter((id) => id !== idToRemove);
      await useDb().update(Cars).set({ oldCustomerId: updatedList }).where(eq(Cars.carId, carId));
      return ServiceResponse.success(void 0, "Old customer removed successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to remove old customer.");
    }
  }
  async updateWithOldCustomer(carId, data, oldCustomerIdToAdd) {
    try {
      const db = getDb();
      const transaction = db.transaction(() => {
        const currentRow = db.prepare("SELECT * FROM Cars WHERE carId = ?").get(carId);
        if (!currentRow) return null;
        let oldCustomerIds = [];
        if (Array.isArray(currentRow.oldCustomerId)) {
          oldCustomerIds = currentRow.oldCustomerId.map(String);
        } else if (typeof currentRow.oldCustomerId === "string" && currentRow.oldCustomerId.trim()) {
          try {
            const parsed = JSON.parse(currentRow.oldCustomerId);
            if (Array.isArray(parsed)) oldCustomerIds = parsed.map(String);
          } catch {
            oldCustomerIds = [];
          }
        }
        const nextCustomerId = Object.prototype.hasOwnProperty.call(data, "customerId") ? data.customerId : currentRow.customerId;
        if (oldCustomerIdToAdd && oldCustomerIdToAdd !== nextCustomerId) {
          const id = String(oldCustomerIdToAdd);
          if (!oldCustomerIds.includes(id)) oldCustomerIds.push(id);
        }
        const allowedFields = [
          "customerId",
          "brandId",
          "model",
          "year",
          "vinNumber",
          "plateNumber",
          "km",
          "fuelType",
          "bodyType",
          "engineVolumeCc",
          "notes"
        ];
        const setParts = [];
        const values = [];
        for (const field of allowedFields) {
          if (Object.prototype.hasOwnProperty.call(data, field)) {
            setParts.push(`${field} = ?`);
            values.push(data[field] ?? null);
          }
        }
        setParts.push("oldCustomerId = ?");
        values.push(JSON.stringify(oldCustomerIds));
        values.push(carId);
        db.prepare(`UPDATE Cars SET ${setParts.join(", ")} WHERE carId = ?`).run(...values);
        const updated = db.prepare("SELECT * FROM Cars WHERE carId = ?").get(carId);
        if (!updated) return null;
        const rawOldIds = updated.oldCustomerId;
        let normalizedOldIds = [];
        if (typeof rawOldIds === "string" && rawOldIds.trim()) {
          try {
            const parsed = JSON.parse(rawOldIds);
            if (Array.isArray(parsed)) normalizedOldIds = parsed.map(String);
          } catch {
            normalizedOldIds = [];
          }
        } else if (Array.isArray(rawOldIds)) {
          normalizedOldIds = rawOldIds.map(String);
        }
        return {
          ...updated,
          oldCustomerId: normalizedOldIds
        };
      });
      const result = transaction();
      if (!result) return ServiceResponse.fail("Car not found.", "NOT_FOUND");
      return ServiceResponse.success(result, "Updated successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to update car.");
    }
  }
}
const Services = sqliteTable("Services", {
  serviceId: integer("serviceId").primaryKey({ autoIncrement: true }),
  carId: integer("carId").notNull().references(() => Cars.carId, { onDelete: "cascade" }),
  customerId: integer("customerId").references(() => Customers.customerId, { onDelete: "set null" }),
  applicationDate: integer("applicationDate", { mode: "timestamp" }),
  appointmentDate: integer("appointmentDate", { mode: "timestamp" }),
  // Job duration in whole MINUTES (a length of time, not a point in time).
  jobDuration: integer("jobDuration"),
  deliveryDate: integer("deliveryDate", { mode: "timestamp" }),
  km: real("km"),
  complaints: text("complaints").notNull(),
  extraRequests: text("extraRequests"),
  faults: text("faults", { mode: "json" }).$type().default([]),
  hasDamageOnReceive: integer("hasDamageOnReceive", { mode: "boolean" }).notNull().default(false),
  damageOnReceive: text("damageOnReceive", { mode: "json" }).$type().default([]),
  hasDamageDuringRepair: integer("hasDamageDuringRepair", { mode: "boolean" }).default(false),
  damageDuringRepair: text("damageDuringRepair", { mode: "json" }).$type().default([]),
  laborCharge: real("laborCharge"),
  totalCharge: real("totalCharge"),
  targetDeliveryDate: integer("targetDeliveryDate", { mode: "timestamp" }),
  isDelivered: integer("isDelivered", { mode: "boolean" }).default(false)
});
const PhoneNumbers = sqliteTable("PhoneNumbers", {
  phoneNumberId: integer("phoneNumberId").primaryKey({ autoIncrement: true }),
  customerId: integer("customerId").notNull().references(() => Customers.customerId, { onDelete: "cascade" }),
  countryCode: text("countryCode").notNull(),
  phoneNumber: text("phoneNumber").notNull()
});
const Emails = sqliteTable("Emails", {
  emailId: integer("emailId").primaryKey({ autoIncrement: true }),
  customerId: integer("customerId").notNull().references(() => Customers.customerId, { onDelete: "cascade" }),
  customerEmail: text("customerEmail").notNull()
});
class CustomersRepository extends BaseRepository {
  constructor() {
    super(Customers, "customerId");
  }
  /** Creates a customer and all contact records atomically. */
  async createWithContacts(customer, phones = [], emails = []) {
    try {
      const db = useDb();
      const customerId = db.transaction((tx) => {
        const inserted = tx.insert(Customers).values(customer).returning({ customerId: Customers.customerId }).get();
        if (!inserted) throw new Error("Customer could not be created.");
        if (phones.length > 0) {
          tx.insert(PhoneNumbers).values(phones.map((phone) => ({ ...phone, customerId: inserted.customerId }))).run();
        }
        if (emails.length > 0) {
          tx.insert(Emails).values(emails.map((email) => ({ ...email, customerId: inserted.customerId }))).run();
        }
        return inserted.customerId;
      });
      return ServiceResponse.success(customerId, "Customer created successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to create customer and contacts.");
    }
  }
  async getByNatId(nationalId) {
    try {
      const result = await useDb().select().from(Customers).where(eq(Customers.nationalId, nationalId));
      const customer = result[0];
      if (customer) {
        return ServiceResponse.success(
          customer,
          "Customer found by National ID."
        );
      }
      return ServiceResponse.fail("Customer not found with this National ID.", "NOT_FOUND");
    } catch (err) {
      return this.handleError(err, "Failed to fetch customer by National ID.");
    }
  }
  // İsim ve/veya Soyisime göre dinamik arama
  async getByNameSurname(firstName, lastName) {
    try {
      const filters = [];
      if (firstName) filters.push(eq(Customers.firstName, firstName));
      if (lastName) filters.push(eq(Customers.lastName, lastName));
      if (filters.length === 0) {
        return ServiceResponse.success([], "No search criteria provided.");
      }
      const result = await useDb().select().from(Customers).where(and(...filters));
      return ServiceResponse.success(
        result,
        result.length > 0 ? "Customers found." : "No customers found matching criteria."
      );
    } catch (err) {
      return this.handleError(err, "Failed to search customers.");
    }
  }
  // Müşteri Profili (Müşteri Bilgisi + Arabalar + Servisler + İletişim)
  async getFullProfile(customerId) {
    try {
      const db = useDb();
      const customerData = await db.select().from(Customers).where(eq(Customers.customerId, customerId));
      const carsList = await db.select().from(Cars).where(eq(Cars.customerId, customerId));
      const servicesList = await db.select().from(Services).where(eq(Services.customerId, customerId));
      const phonesList = await db.select().from(PhoneNumbers).where(eq(PhoneNumbers.customerId, customerId));
      const emailsList = await db.select().from(Emails).where(eq(Emails.customerId, customerId));
      const customer = customerData[0];
      if (!customer) {
        return ServiceResponse.fail("Customer not found.", "NOT_FOUND");
      }
      return ServiceResponse.success(
        { customer, cars: carsList, services: servicesList, phones: phonesList, emails: emailsList },
        "Customer profile retrieved successfully."
      );
    } catch (err) {
      return this.handleError(err, "Failed to load customer profile.");
    }
  }
  // Tüm müşterileri telefon ve e-postalarıyla birlikte liste için çeken metot
  async getAllCustomersWithDetails() {
    try {
      const db = useDb();
      const [allCustomers, allPhones, allEmails] = await Promise.all([
        db.select().from(Customers),
        db.select().from(PhoneNumbers),
        db.select().from(Emails)
      ]);
      const phonesByCustomer = /* @__PURE__ */ new Map();
      for (const phone of allPhones) {
        const list = phonesByCustomer.get(phone.customerId) ?? [];
        list.push(phone);
        phonesByCustomer.set(phone.customerId, list);
      }
      const emailsByCustomer = /* @__PURE__ */ new Map();
      for (const email of allEmails) {
        const list = emailsByCustomer.get(email.customerId) ?? [];
        list.push(email);
        emailsByCustomer.set(email.customerId, list);
      }
      const result = allCustomers.map((customer) => ({
        id: customer.customerId,
        fullName: `${customer.firstName} ${customer.lastName || ""}`.trim(),
        nationalId: customer.nationalId || "",
        taxNumber: customer.taxNumber || "",
        phones: (phonesByCustomer.get(customer.customerId) ?? []).map((phone) => ({
          countryCode: phone.countryCode,
          number: phone.phoneNumber
        })),
        emails: (emailsByCustomer.get(customer.customerId) ?? []).map((email) => ({
          address: email.customerEmail
        }))
      }));
      return ServiceResponse.success(result, "Customers with contact details retrieved successfully.");
    } catch (err) {
      console.error("🆘 Detaylı müşteri listesi çekilirken hata:", err);
      return this.handleError(err, "Failed to fetch customers with contact details.");
    }
  }
  // Formu doldurmak için müşteriyi çeken metot
  async getCustomerForEdit(customerId) {
    try {
      const db = useDb();
      const customer = await db.select().from(Customers).where(eq(Customers.customerId, customerId));
      const phones = await db.select().from(PhoneNumbers).where(eq(PhoneNumbers.customerId, customerId));
      const emails = await db.select().from(Emails).where(eq(Emails.customerId, customerId));
      if (!customer[0]) {
        return ServiceResponse.fail("Customer not found.", "NOT_FOUND");
      }
      return ServiceResponse.success(
        { customer: customer[0], phones, emails },
        "Customer edit data retrieved successfully."
      );
    } catch (err) {
      return this.handleError(err, "Failed to load customer edit data.");
    }
  }
  // Müşteriyi telefon ve mailleriyle güncelleyen metot (Senkron Transaction ile)
  async updateCustomerFull(customerId, data) {
    try {
      const db = useDb();
      db.transaction((tx) => {
        const updatedCustomer = tx.update(Customers).set({
          firstName: data.firstName,
          lastName: data.lastName,
          nationalId: data.nationalId,
          taxNumber: data.taxNumber
        }).where(eq(Customers.customerId, customerId)).returning({ customerId: Customers.customerId }).get();
        if (!updatedCustomer) {
          throw new Error("Customer not found.");
        }
        tx.delete(PhoneNumbers).where(eq(PhoneNumbers.customerId, customerId)).run();
        if (data.phones && data.phones.length > 0) {
          tx.insert(PhoneNumbers).values(data.phones.map((p) => ({
            customerId,
            countryCode: p.countryCode,
            phoneNumber: p.number
          }))).run();
        }
        tx.delete(Emails).where(eq(Emails.customerId, customerId)).run();
        if (data.emails && data.emails.length > 0) {
          tx.insert(Emails).values(data.emails.map((e) => ({
            customerId,
            customerEmail: e.address
          }))).run();
        }
      });
      return ServiceResponse.success(null, "Customer updated successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to update customer.");
    }
  }
  // Müşteriyi ve (istenirse) bağlı kayıtları tek transaction içinde siler.
  async deleteCustomer(customerId, deleteRelated) {
    try {
      const db = useDb();
      db.transaction((tx) => {
        tx.delete(PhoneNumbers).where(eq(PhoneNumbers.customerId, customerId)).run();
        tx.delete(Emails).where(eq(Emails.customerId, customerId)).run();
        if (deleteRelated) {
          tx.delete(Services).where(eq(Services.customerId, customerId)).run();
          tx.delete(Cars).where(eq(Cars.customerId, customerId)).run();
        } else {
          tx.update(Cars).set({ customerId: null }).where(eq(Cars.customerId, customerId)).run();
          tx.update(Services).set({ customerId: null }).where(eq(Services.customerId, customerId)).run();
        }
        const deleted = tx.delete(Customers).where(eq(Customers.customerId, customerId)).returning({ customerId: Customers.customerId }).get();
        if (!deleted) throw new Error("Customer not found.");
      });
      return ServiceResponse.success(null, "Customer deleted.");
    } catch (err) {
      return this.handleError(err, "Failed to delete customer.");
    }
  }
  // TOPLU SİLME METODU
  async deleteCustomersBulk(customerIds, deleteRelated) {
    try {
      if (customerIds.length === 0) {
        return ServiceResponse.success(null, "No customers selected.");
      }
      const db = useDb();
      db.transaction((tx) => {
        tx.delete(PhoneNumbers).where(inArray(PhoneNumbers.customerId, customerIds)).run();
        tx.delete(Emails).where(inArray(Emails.customerId, customerIds)).run();
        if (deleteRelated) {
          tx.delete(Services).where(inArray(Services.customerId, customerIds)).run();
          tx.delete(Cars).where(inArray(Cars.customerId, customerIds)).run();
        } else {
          tx.update(Cars).set({ customerId: null }).where(inArray(Cars.customerId, customerIds)).run();
          tx.update(Services).set({ customerId: null }).where(inArray(Services.customerId, customerIds)).run();
        }
        tx.delete(Customers).where(inArray(Customers.customerId, customerIds)).run();
      });
      return ServiceResponse.success(null, "Customers deleted.");
    } catch (err) {
      return this.handleError(err, "Failed to delete customers.");
    }
  }
}
class EmailsRepository extends BaseRepository {
  constructor() {
    super(Emails, "emailId");
  }
  async getByCustomerId(customerId) {
    try {
      const result = await useDb().select().from(Emails).where(eq(Emails.customerId, customerId));
      return ServiceResponse.success(
        result,
        "Customer emails fetched successfully."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch customer emails.");
    }
  }
  async getByCustomerForEmail(customerEmail) {
    var _a2;
    try {
      const result = await useDb().select({ customerId: Emails.customerId }).from(Emails).where(eq(Emails.customerEmail, customerEmail));
      const id = (_a2 = result[0]) == null ? void 0 : _a2.customerId;
      if (id) {
        return ServiceResponse.success(id, "Customer found.");
      }
      return ServiceResponse.fail("No customer found with this email.", "NOT_FOUND");
    } catch (err) {
      return this.handleError(err, "Failed to find customer by email.");
    }
  }
  async isEmailUsed(email) {
    try {
      const result = await useDb().select().from(Emails).where(eq(Emails.customerEmail, email)).limit(1);
      const isUsed = result.length > 0;
      return ServiceResponse.success(isUsed, isUsed ? "Email is currently in use." : "Email is available.");
    } catch (err) {
      return this.handleError(err, "Failed to check email availability.");
    }
  }
}
class PhoneNumbersRepository extends BaseRepository {
  constructor() {
    super(PhoneNumbers, "phoneNumberId");
  }
  // Bir müşteriye ait telefonları listele
  async getByCustomerId(customerId) {
    try {
      const result = await useDb().select().from(PhoneNumbers).where(eq(PhoneNumbers.customerId, customerId));
      return ServiceResponse.success(
        result,
        "Customer phone numbers fetched successfully."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch phone numbers by customer.");
    }
  }
  // Telefon numarasına göre tekil arama
  // limit(1) kullandığın için tek bir obje veya undefined döneriz
  async getByPhoneNumber(phoneNumber) {
    try {
      const result = await useDb().select().from(PhoneNumbers).where(eq(PhoneNumbers.phoneNumber, phoneNumber)).limit(1);
      const phoneRecord = result[0];
      if (phoneRecord) {
        return ServiceResponse.success(
          phoneRecord,
          "Phone number found."
        );
      }
      return ServiceResponse.fail("Phone number not found.", "NOT_FOUND");
    } catch (err) {
      return this.handleError(err, "Failed to search by phone number.");
    }
  }
  // Ülke koduna göre listeleme (Örn: +90 olanları getir)
  async getByCountryCode(countryCode) {
    try {
      const result = await useDb().select().from(PhoneNumbers).where(eq(PhoneNumbers.countryCode, countryCode));
      return ServiceResponse.success(
        result,
        `Phone numbers fetched for country code ${countryCode}.`
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch phone numbers by country code.");
    }
  }
}
const Parts = sqliteTable("Parts", {
  partId: integer("partId").primaryKey({ autoIncrement: true }),
  carId: integer("carId").notNull(),
  serviceId: integer("serviceId").notNull(),
  partName: text("partName").notNull(),
  partTax: real("partTax"),
  partPrice: real("partPrice")
});
class PartsRepository extends BaseRepository {
  constructor() {
    super(Parts, "partId");
  }
  async getByCarId(carId) {
    try {
      const result = await useDb().select().from(Parts).where(eq(Parts.carId, carId));
      return ServiceResponse.success(result, "Parts fetched by car successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to fetch parts by car.");
    }
  }
  async getByServiceId(serviceId) {
    try {
      const result = await useDb().select().from(Parts).where(eq(Parts.serviceId, serviceId));
      return ServiceResponse.success(result, "Parts fetched by service successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to fetch parts by service.");
    }
  }
  async getByCarAndService(carId, serviceId) {
    try {
      const result = await useDb().select().from(Parts).where(and(eq(Parts.carId, carId), eq(Parts.serviceId, serviceId)));
      return ServiceResponse.success(result, "Parts fetched matching car and service.");
    } catch (err) {
      return this.handleError(err, "Failed to fetch parts by car and service.");
    }
  }
  async deleteByServiceId(serviceId) {
    try {
      await useDb().delete(Parts).where(eq(Parts.serviceId, serviceId));
      return ServiceResponse.success(void 0, "Service parts deleted successfully.");
    } catch (err) {
      return this.handleError(err, "Failed to delete service parts.");
    }
  }
}
class ServicesRepository extends BaseRepository {
  constructor() {
    super(Services, "serviceId");
  }
  async getByCarId(carId) {
    try {
      const result = await useDb().select().from(Services).where(eq(Services.carId, carId));
      return ServiceResponse.success(
        result,
        "Service history for the car fetched successfully."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch service history by car.");
    }
  }
  async getByCustomerId(customerId) {
    try {
      const result = await useDb().select().from(Services).where(eq(Services.customerId, customerId));
      return ServiceResponse.success(
        result,
        "Service history for the customer fetched successfully."
      );
    } catch (err) {
      return this.handleError(err, "Failed to fetch service history by customer.");
    }
  }
}
class BodyTypesRepository extends BaseRepository {
  constructor() {
    super(BodyTypes, "bodyTypeId");
  }
}
class FuelTypesRepository extends BaseRepository {
  constructor() {
    super(FuelTypes, "fuelTypeId");
  }
}
class CustomerService {
  constructor(customerRepository, phoneNumberRepository, emailRepository) {
    __publicField(this, "customerRepository");
    this.customerRepository = customerRepository;
  }
  async createCustomer(customer, phoneNumber, email) {
    const response = await this.customerRepository.createWithContacts(
      customer,
      phoneNumber ?? [],
      email ?? []
    );
    if (!response.success || response.data === void 0) {
      console.error("New customer not created! Message:", response.message);
      return ServiceResponse.fail(response.message || "Customer create failed.");
    }
    return ServiceResponse.success(response.data, "Müşteri başarıyla oluşturuldu.");
  }
  async updateCustomer(customerId, customer) {
    if (!customerId) {
      throw new Error("CustomerId not found");
    }
    const result = await this.customerRepository.update(customerId, customer);
    if (!result.success) {
      return ServiceResponse.fail(result.message, "Customer update failed.");
    }
    return ServiceResponse.success(result, `Customer ${result.message}`);
  }
  async deleteCustomer(customerId) {
    if (!customerId) {
      throw new Error("CustomerId value is null");
    }
    const result = await this.customerRepository.delete(customerId);
    if (!result.success) {
      return ServiceResponse.fail(result.message, "Customer delete failed.");
    }
    return ServiceResponse.success(result.message, "Customer deleted.");
  }
  async getAllCustomer() {
    const result = await this.customerRepository.getAll();
    if (!result.success) {
      return ServiceResponse.fail(result.message || "Failed to fetch customers.");
    }
    const customers = result.data;
    if (!customers || customers.length === 0) {
      return ServiceResponse.success([], "No customers found.");
    }
    return ServiceResponse.success(customers, "Customers retrieved successfully.");
  }
  async getByNatId(nationalId) {
    const result = await this.customerRepository.getByNatId(nationalId);
    if (!result.success) {
      return ServiceResponse.fail(result.message);
    }
    return ServiceResponse.success(result, result.message);
  }
  async getByNameSurname(firstName, lastName) {
    const result = await this.customerRepository.getByNameSurname(firstName, lastName);
    if (!result.success) {
      return ServiceResponse.fail(result.message);
    }
    return ServiceResponse.success(result, result.message);
  }
}
const MAX_BRAND_NAME_LENGTH = 40;
function normalizeBrandName(value) {
  return value.trim().replace(/\s+/g, " ").split(" ").map((word) => {
    if (!word) return word;
    return word.split("-").map((part) => {
      if (!part) return part;
      const lower = part.toLocaleLowerCase("tr-TR");
      return lower.charAt(0).toLocaleUpperCase("tr-TR") + lower.slice(1);
    }).join("-");
  }).join(" ");
}
class BrandService {
  constructor(brandsRepository) {
    __publicField(this, "brandsRepository");
    this.brandsRepository = brandsRepository;
  }
  async getAllBrands() {
    return await this.brandsRepository.getAll();
  }
  async createBrand(brand) {
    const normalizedName = normalizeBrandName(brand.brandName);
    if (!normalizedName) {
      return ServiceResponse.validationError([
        {
          field: "brandName",
          message: "Brand name cannot be empty."
        }
      ]);
    }
    if (normalizedName.length > MAX_BRAND_NAME_LENGTH) {
      return ServiceResponse.validationError([
        {
          field: "brandName",
          message: `Brand name cannot exceed ${MAX_BRAND_NAME_LENGTH} characters.`
        }
      ]);
    }
    const existing = await this.brandsRepository.findByName(normalizedName);
    if (!existing.success) {
      return existing;
    }
    if (existing.data) {
      return ServiceResponse.success(existing.data, "Brand already exists.");
    }
    return await this.brandsRepository.create({
      brandName: normalizedName
    });
  }
  async deleteBrand(brandId) {
    const result = await this.brandsRepository.delete(brandId);
    if (!result.success) {
      return ServiceResponse.fail(result.message, result.code);
    }
    return result;
  }
}
class ServiceService {
  constructor(servicesRepository, partsRepository) {
    __publicField(this, "servicesRepository");
    __publicField(this, "partsRepository");
    this.servicesRepository = servicesRepository;
    this.partsRepository = partsRepository;
  }
  async createService(service, parts = []) {
    const serviceResult = await this.servicesRepository.create(service);
    if (!serviceResult.success || !serviceResult.data) return serviceResult;
    const createdParts = [];
    for (const part of parts) {
      const result = await this.partsRepository.create({ ...part, serviceId: serviceResult.data.serviceId });
      if (!result.success || !result.data) {
        for (const created of createdParts) {
          if (created.partId) await this.partsRepository.delete(created.partId);
        }
        await this.servicesRepository.delete(serviceResult.data.serviceId);
        return ServiceResponse.error(new Error(result.message), "Service and parts could not be created together.");
      }
      createdParts.push(result.data);
    }
    return ServiceResponse.success({ service: serviceResult.data, parts: createdParts }, "Service created successfully.");
  }
  async updateService(serviceId, service, parts = []) {
    const serviceResult = await this.servicesRepository.update(serviceId, service);
    if (!serviceResult.success || !serviceResult.data) return serviceResult;
    const oldParts = await this.partsRepository.getByServiceId(serviceId);
    if (!oldParts.success) return ServiceResponse.error(new Error(oldParts.message), "Service parts could not be loaded.");
    const deletedParts = await this.partsRepository.deleteByServiceId(serviceId);
    if (!deletedParts.success) return ServiceResponse.error(new Error(deletedParts.message), "Service parts could not be replaced.");
    const createdParts = [];
    for (const part of parts) {
      const result = await this.partsRepository.create(part);
      if (!result.success || !result.data) {
        for (const created of createdParts) if (created.partId) await this.partsRepository.delete(created.partId);
        for (const old of oldParts.data ?? []) {
          await this.partsRepository.create({
            carId: old.carId,
            serviceId: old.serviceId,
            partName: old.partName,
            partTax: old.partTax,
            partPrice: old.partPrice
          });
        }
        return ServiceResponse.error(new Error(result.message), "Service parts could not be updated.");
      }
      createdParts.push(result.data);
    }
    return ServiceResponse.success({ service: serviceResult.data, parts: createdParts }, "Service updated successfully.");
  }
  async deleteService(serviceId) {
    const partsResult = await this.partsRepository.deleteByServiceId(serviceId);
    if (!partsResult.success) return partsResult;
    return this.servicesRepository.delete(serviceId);
  }
  async getDetails(serviceId) {
    const serviceResult = await this.servicesRepository.getById(serviceId);
    if (!serviceResult.success || !serviceResult.data) return serviceResult;
    const partsResult = await this.partsRepository.getByServiceId(serviceId);
    if (!partsResult.success) return ServiceResponse.error(new Error(partsResult.message), "Service parts could not be loaded.");
    return ServiceResponse.success({ service: serviceResult.data, parts: partsResult.data ?? [] }, "Service details fetched successfully.");
  }
  async getAll() {
    return this.servicesRepository.getAll();
  }
  async getByCarId(carId) {
    return this.servicesRepository.getByCarId(carId);
  }
  async getByCustomerId(customerId) {
    return this.servicesRepository.getByCustomerId(customerId);
  }
  async getPartsByService(serviceId) {
    return this.partsRepository.getByServiceId(serviceId);
  }
}
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function requireString(value, field, allowEmpty = true) {
  if (typeof value !== "string" || !allowEmpty && value.trim() === "") {
    throw new Error(`Invalid ${field}.`);
  }
  return value;
}
function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Unknown error.";
}
function requireNumber(value, field) {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${field}.`);
  }
  return value;
}
function parseCustomerRequest(payload) {
  if (!isRecord(payload)) throw new Error("Invalid customer payload.");
  const phones = payload.phones === void 0 ? [] : payload.phones;
  const emails = payload.emails === void 0 ? [] : payload.emails;
  if (!Array.isArray(phones) || !Array.isArray(emails)) {
    throw new Error("Invalid customer contact data.");
  }
  return {
    firstName: requireString(payload.firstName, "firstName", false),
    lastName: requireString(payload.lastName, "lastName"),
    nationalId: requireString(payload.nationalId, "nationalId"),
    taxNumber: requireString(payload.taxNumber, "taxNumber"),
    phones: phones.map((phone, index) => {
      if (!isRecord(phone)) throw new Error(`Invalid phone at index ${index}.`);
      return {
        countryCode: requireString(phone.countryCode, `phones[${index}].countryCode`, false),
        number: requireString(phone.number, `phones[${index}].number`, false)
      };
    }),
    emails: emails.map((email, index) => {
      if (!isRecord(email)) throw new Error(`Invalid email at index ${index}.`);
      return {
        address: requireString(email.address, `emails[${index}].address`, false)
      };
    })
  };
}
function parseUpdateCustomerRequest(payload) {
  if (!isRecord(payload)) throw new Error("Invalid update payload.");
  return {
    id: requireNumber(payload.id, "customer id"),
    data: parseCustomerRequest(payload.data)
  };
}
function parseDeleteCustomerRequest(payload) {
  if (!isRecord(payload) || typeof payload.deleteRelated !== "boolean") {
    throw new Error("Invalid delete payload.");
  }
  return {
    id: requireNumber(payload.id, "customer id"),
    deleteRelated: payload.deleteRelated
  };
}
function parseCreateBrandRequest(payload) {
  if (!isRecord(payload)) throw new Error("Invalid brand payload.");
  const brandName = requireString(payload.brandName, "brandName", false).trim();
  if (brandName.length > MAX_BRAND_NAME_LENGTH) {
    throw new Error(`Brand name cannot exceed ${MAX_BRAND_NAME_LENGTH} characters.`);
  }
  return { brandName };
}
function parseCarData(payload) {
  if (!isRecord(payload)) throw new Error("Invalid car payload.");
  const optionalInteger = (value, field) => {
    if (value === null || value === void 0 || value === "") return null;
    return requireNumber(value, field);
  };
  const optionalString = (value, field, maxLength) => {
    if (value === null || value === void 0) return null;
    const text2 = requireString(value, field).trim();
    if (text2.length > maxLength) throw new Error(`${field} cannot exceed ${maxLength} characters.`);
    return text2 || null;
  };
  const km = payload.km === null || payload.km === void 0 || payload.km === "" ? null : Number(payload.km);
  if (km !== null && (!Number.isFinite(km) || km < 0)) {
    throw new Error("Invalid km.");
  }
  const year = optionalInteger(payload.year, "year");
  if (year !== null && (year < 1886 || year > (/* @__PURE__ */ new Date()).getFullYear() + 1)) {
    throw new Error("Invalid year.");
  }
  const plateNumber = optionalString(payload.plateNumber, "plateNumber", 20);
  if (!plateNumber) {
    throw new Error("Plate number is required.");
  }
  const model = optionalString(payload.model, "model", 100);
  const normalizedModel = model ? model.charAt(0).toLocaleUpperCase("tr-TR") + model.slice(1) : null;
  const vinNumber = optionalString(payload.vinNumber, "vinNumber", 32);
  const engineVolumeCc = optionalInteger(payload.engineVolumeCc, "engineVolumeCc");
  if (engineVolumeCc !== null && engineVolumeCc < 1) {
    throw new Error("Invalid engine volume.");
  }
  const notes = optionalString(payload.notes, "notes", 2e3);
  return {
    customerId: optionalInteger(payload.customerId, "customerId"),
    brandId: optionalInteger(payload.brandId, "brandId"),
    model: normalizedModel,
    year,
    vinNumber: vinNumber ? vinNumber.toLocaleUpperCase("tr-TR") : null,
    plateNumber: plateNumber.toLocaleUpperCase("tr-TR"),
    km,
    fuelType: optionalInteger(payload.fuelType, "fuelType"),
    bodyType: optionalInteger(payload.bodyType, "bodyType"),
    engineVolumeCc,
    notes
  };
}
function parseUpdateCarRequest(payload) {
  if (!isRecord(payload)) throw new Error("Invalid car update payload.");
  return {
    id: requireNumber(payload.id, "car id"),
    data: parseCarData(payload.data),
    oldCustomerIdToAdd: payload.oldCustomerIdToAdd === null || payload.oldCustomerIdToAdd === void 0 ? null : requireNumber(payload.oldCustomerIdToAdd, "old customer id")
  };
}
function parseServiceDate(value, field) {
  if (value === null || value === void 0 || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? (() => {
    throw new Error(`Invalid ${field}.`);
  })() : value;
  if (typeof value !== "string") throw new Error(`Invalid ${field}.`);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid ${field}.`);
  return date;
}
function parseOptionalNonNegativeNumber(value, field) {
  if (value === null || value === void 0 || value === "") return null;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) throw new Error(`Invalid ${field}.`);
  return numberValue;
}
function parseServiceRequest(payload) {
  if (!isRecord(payload) || !isRecord(payload.service) || !Array.isArray(payload.parts)) {
    throw new Error("Invalid service payload.");
  }
  const raw = payload.service;
  const carId = requireNumber(raw.carId, "carId");
  const customerId = raw.customerId === null || raw.customerId === void 0 || raw.customerId === "" ? null : requireNumber(raw.customerId, "customerId");
  const complaints = requireString(raw.complaints, "complaints", false).trim();
  if (complaints.length > 4e3) throw new Error("Complaints cannot exceed 4000 characters.");
  const extraRequests = raw.extraRequests === null || raw.extraRequests === void 0 ? null : requireString(raw.extraRequests, "extraRequests").trim() || null;
  if (extraRequests && extraRequests.length > 4e3) throw new Error("Extra requests cannot exceed 4000 characters.");
  const parseStringArray = (value, field, maxItems, maxLength) => {
    if (value === null || value === void 0 || value === "") return [];
    if (!Array.isArray(value)) throw new Error(`Invalid ${field}.`);
    return value.map((item, index) => {
      const text2 = requireString(item, `${field}[${index}]`, false).trim();
      if (text2.length > maxLength) throw new Error(`${field}[${index}] is too long.`);
      return text2;
    }).filter(Boolean).slice(0, maxItems);
  };
  const jobDuration = raw.jobDuration === null || raw.jobDuration === void 0 || raw.jobDuration === "" ? null : Number(raw.jobDuration);
  if (jobDuration !== null && (!Number.isInteger(jobDuration) || jobDuration < 0)) throw new Error("Invalid job duration.");
  const service = {
    carId,
    customerId,
    applicationDate: parseServiceDate(raw.applicationDate, "applicationDate"),
    appointmentDate: parseServiceDate(raw.appointmentDate, "appointmentDate"),
    jobDuration,
    deliveryDate: parseServiceDate(raw.deliveryDate, "deliveryDate"),
    km: parseOptionalNonNegativeNumber(raw.km, "km"),
    complaints,
    extraRequests,
    faults: parseStringArray(raw.faults, "faults", 30, 500),
    hasDamageOnReceive: raw.hasDamageOnReceive === true,
    damageOnReceive: parseStringArray(raw.damageOnReceive, "damageOnReceive", 30, 500),
    hasDamageDuringRepair: raw.hasDamageDuringRepair === true,
    damageDuringRepair: parseStringArray(raw.damageDuringRepair, "damageDuringRepair", 30, 500),
    laborCharge: parseOptionalNonNegativeNumber(raw.laborCharge, "laborCharge"),
    totalCharge: parseOptionalNonNegativeNumber(raw.totalCharge, "totalCharge"),
    targetDeliveryDate: parseServiceDate(raw.targetDeliveryDate, "targetDeliveryDate"),
    isDelivered: raw.isDelivered === true
  };
  const parts = payload.parts.map((item, index) => {
    if (!isRecord(item)) throw new Error(`Invalid part at index ${index}.`);
    const partName = requireString(item.partName, `parts[${index}].partName`, false).trim();
    if (partName.length > 200) throw new Error(`parts[${index}].partName is too long.`);
    return {
      partName,
      partTax: parseOptionalNonNegativeNumber(item.partTax, `parts[${index}].partTax`),
      partPrice: parseOptionalNonNegativeNumber(item.partPrice, `parts[${index}].partPrice`)
    };
  }).filter((part) => part.partName);
  return { service, parts };
}
function parseUpdateServiceRequest(payload) {
  if (!isRecord(payload)) throw new Error("Invalid service update payload.");
  return { id: requireNumber(payload.id, "service id"), ...parseServiceRequest(payload) };
}
function parseBulkDeleteRequest(payload) {
  if (!isRecord(payload) || !Array.isArray(payload.ids) || typeof payload.deleteRelated !== "boolean") {
    throw new Error("Invalid bulk delete payload.");
  }
  const ids = payload.ids.map((id, index) => requireNumber(id, `ids[${index}]`));
  return { ids, deleteRelated: payload.deleteRelated };
}
function parseAppConfig(payload) {
  if (!isRecord(payload)) throw new Error("Invalid app config.");
  const language = requireString(payload.language, "language", false);
  const savePath = requireString(payload.savePath, "savePath", false);
  if (payload.eulaAccepted !== true) throw new Error("EULA must be accepted.");
  if (payload.theme !== "light" && payload.theme !== "dark") throw new Error("Invalid theme.");
  return {
    language,
    savePath,
    eulaAccepted: true,
    theme: payload.theme,
    onboardingCompleted: payload.onboardingCompleted === true
  };
}
const DATABASE_FILE_NAME = "data_carArchiver.sqlite";
const approvedDirectories = /* @__PURE__ */ new Set();
const approvedDatabaseFiles = /* @__PURE__ */ new Set();
function requireApprovedDatabasePath(value) {
  const dbPath = requireString(value, "database path", false);
  const normalizedPath = path.normalize(path.resolve(dbPath));
  if (path.basename(normalizedPath) !== DATABASE_FILE_NAME) {
    throw new Error(`Invalid database file. Expected ${DATABASE_FILE_NAME}.`);
  }
  if (!approvedDatabaseFiles.has(normalizedPath) && !fs.existsSync(normalizedPath)) {
    throw new Error("Database file is not available.");
  }
  return normalizedPath;
}
function requireApprovedDirectory(value) {
  const selectedPath = requireString(value, "directory", false);
  const normalizedPath = path.normalize(path.resolve(selectedPath));
  if (!approvedDirectories.has(normalizedPath)) {
    throw new Error("Directory was not selected through the native directory picker.");
  }
  return normalizedPath;
}
function registerIpcHandlers() {
  ipcMain.handle("check-config", async () => {
    return hasConfig();
  });
  ipcMain.handle("select-directory", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"]
    });
    if (result.canceled || !result.filePaths[0]) return null;
    const selectedPath = path.normalize(path.resolve(result.filePaths[0]));
    approvedDirectories.add(selectedPath);
    return selectedPath;
  });
  ipcMain.handle("verify-import-path", async (_event, rawFolderPath) => {
    const folderPath = requireApprovedDirectory(rawFolderPath);
    const dbName = DATABASE_FILE_NAME;
    const dbPath = path.join(folderPath, dbName);
    if (fs.existsSync(dbPath)) {
      approvedDatabaseFiles.add(path.normalize(path.resolve(dbPath)));
      return dbPath;
    }
    return null;
  });
  ipcMain.handle("setup-new-data-structure", async (_event, rawSelectedRoot) => {
    try {
      const selectedRoot = requireApprovedDirectory(rawSelectedRoot);
      const mainFolderName = "CarServiceArchiver";
      const mainPath = path.join(selectedRoot, mainFolderName);
      const dbPath = path.join(mainPath, DATABASE_FILE_NAME);
      const mediaPath = path.join(mainPath, "media");
      if (fs.existsSync(dbPath)) {
        throw new Error(`A database already exists at ${dbPath}. Choose a different folder or import the existing database.`);
      }
      if (!fs.existsSync(mainPath)) {
        fs.mkdirSync(mainPath, { recursive: true });
        console.log("📁 Main folder created:", mainPath);
      }
      if (!fs.existsSync(mediaPath)) {
        fs.mkdirSync(mediaPath, { recursive: true });
        console.log("📁 Media folder created:", mediaPath);
      }
      if (process.platform === "win32") {
        execFile("attrib", ["+h", "+i", mediaPath], (error) => {
          if (error) {
            console.error("⚠️ Media folder could not be hidden:", error);
          } else {
            console.log("🥷 Media folder hidden from Windows Explorer.");
          }
        });
      }
      approvedDatabaseFiles.add(path.normalize(path.resolve(dbPath)));
      CreateDefaultDb(dbPath);
      initDrizzle();
      await CreateDefaultDbTables();
      console.log("❇️ Setup completed successfully. DB path:", dbPath);
      return dbPath;
    } catch (error) {
      console.error("🆘 Setup failed:", getErrorMessage(error));
      closeDrizzle();
      closeDb();
      return null;
    }
  });
  ipcMain.handle("setup-imported-data", async (_event, rawDbPath) => {
    try {
      const normalizedDbPath = requireApprovedDatabasePath(rawDbPath);
      if (!approvedDatabaseFiles.has(normalizedDbPath)) {
        throw new Error("Database file was not selected through the import flow.");
      }
      closeDrizzle();
      closeDb();
      CreateDefaultDb(normalizedDbPath);
      initDrizzle();
      await CreateDefaultDbTables();
      console.log("❇️ Imported database initialized:", normalizedDbPath);
      return normalizedDbPath;
    } catch (error) {
      console.error("🆘 Imported database setup failed:", getErrorMessage(error));
      closeDrizzle();
      closeDb();
      return null;
    }
  });
  ipcMain.handle("save-config", async (_event, configData) => {
    try {
      const config = parseAppConfig(configData);
      const normalizedDbPath = requireApprovedDatabasePath(config.savePath);
      if (!approvedDatabaseFiles.has(normalizedDbPath)) {
        throw new Error("Database path was not approved by the setup flow.");
      }
      saveConfig({ ...config, savePath: normalizedDbPath });
      console.log("❇️ Config file saved successfully.");
      return true;
    } catch (error) {
      console.error("🆘 Failed to save config:", getErrorMessage(error));
      return false;
    }
  });
  ipcMain.handle("get-config", async () => {
    return getConfig();
  });
  ipcMain.handle("get-dashboard-stats", async () => {
    try {
      const customersRepo = new CustomersRepository();
      const carsRepo = new CarsRepository();
      const servicesRepo = new ServicesRepository();
      const [customersRes, carsRes, servicesRes] = await Promise.all([
        customersRepo.count(),
        carsRepo.count(),
        servicesRepo.count()
      ]);
      return {
        customers: customersRes.success ? customersRes.data : 0,
        cars: carsRes.success ? carsRes.data : 0,
        services: servicesRes.success ? servicesRes.data : 0
      };
    } catch (error) {
      console.error("🆘 İstatistik okuma hatası:", getErrorMessage(error));
      return { services: 0, customers: 0, cars: 0 };
    }
  });
  ipcMain.handle("get-all-customers", async () => {
    try {
      const customersRepo = new CustomersRepository();
      const response = await customersRepo.getAllCustomersWithDetails();
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("🆘 Müşteriler çekilirken hata:", getErrorMessage(error));
      return [];
    }
  });
  ipcMain.handle("add-customer", async (_event, rawPayload) => {
    try {
      const customersRepo = new CustomersRepository();
      const phoneNumbersRepo = new PhoneNumbersRepository();
      const emailsRepo = new EmailsRepository();
      const customerService = new CustomerService(customersRepo, phoneNumbersRepo, emailsRepo);
      const payload = parseCustomerRequest(rawPayload);
      const customerBase = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        nationalId: payload.nationalId,
        taxNumber: payload.taxNumber
      };
      const phoneNumbers = (payload.phones ?? []).map((phone) => ({
        countryCode: phone.countryCode,
        phoneNumber: phone.number
      }));
      const emails = (payload.emails ?? []).map((email) => ({
        customerEmail: email.address
      }));
      const response = await customerService.createCustomer(customerBase, phoneNumbers, emails);
      return response;
    } catch (error) {
      console.error("🆘 Müşteri eklenirken hata:", getErrorMessage(error));
      return ServiceResponse.error(error, "Customer could not be created.");
    }
  });
  ipcMain.handle("get-customer-profile", async (_event, rawCustomerId) => {
    try {
      const customerId = requireNumber(rawCustomerId, "customer id");
      const customersRepo = new CustomersRepository();
      const response = await customersRepo.getFullProfile(customerId);
      return response;
    } catch (error) {
      console.error("🆘 Müşteri profili alınırken hata:", getErrorMessage(error));
      return ServiceResponse.error(error, "Customer profile could not be loaded.");
    }
  });
  ipcMain.handle("get-customer-edit", async (_event, rawCustomerId) => {
    const customerId = requireNumber(rawCustomerId, "customer id");
    return await new CustomersRepository().getCustomerForEdit(customerId);
  });
  ipcMain.handle("update-customer", async (_event, rawRequest) => {
    const request = parseUpdateCustomerRequest(rawRequest);
    return await new CustomersRepository().updateCustomerFull(request.id, request.data);
  });
  ipcMain.handle("delete-customer", async (_event, rawRequest) => {
    const request = parseDeleteCustomerRequest(rawRequest);
    return await new CustomersRepository().deleteCustomer(request.id, request.deleteRelated);
  });
  ipcMain.handle("delete-customers-bulk", async (_event, rawRequest) => {
    const request = parseBulkDeleteRequest(rawRequest);
    return await new CustomersRepository().deleteCustomersBulk(request.ids, request.deleteRelated);
  });
  ipcMain.handle("get-all-fuel-types", async () => {
    try {
      return await new FuelTypesRepository().getAll();
    } catch (error) {
      return ServiceResponse.error(error, "Fuel types could not be loaded.");
    }
  });
  ipcMain.handle("get-all-body-types", async () => {
    try {
      return await new BodyTypesRepository().getAll();
    } catch (error) {
      return ServiceResponse.error(error, "Body types could not be loaded.");
    }
  });
  ipcMain.handle("get-all-cars", async () => {
    try {
      const result = await new CarsRepository().getAll();
      return result;
    } catch (error) {
      return ServiceResponse.error(error, "Cars could not be loaded.");
    }
  });
  ipcMain.handle("get-car", async (_event, rawCarId) => {
    try {
      const carId = requireNumber(rawCarId, "car id");
      return await new CarsRepository().getById(carId);
    } catch (error) {
      return ServiceResponse.error(error, "Car could not be loaded.");
    }
  });
  ipcMain.handle("add-car", async (_event, rawPayload) => {
    try {
      const data = parseCarData(rawPayload);
      return await new CarsRepository().create(data);
    } catch (error) {
      return ServiceResponse.error(error, "Car could not be created.");
    }
  });
  ipcMain.handle("update-car", async (_event, rawPayload) => {
    try {
      const request = parseUpdateCarRequest(rawPayload);
      const repository = new CarsRepository();
      return request.oldCustomerIdToAdd ? await repository.updateWithOldCustomer(request.id, request.data, request.oldCustomerIdToAdd) : await repository.update(request.id, request.data);
    } catch (error) {
      return ServiceResponse.error(error, "Car could not be updated.");
    }
  });
  ipcMain.handle("delete-car", async (_event, rawCarId) => {
    try {
      const carId = requireNumber(rawCarId, "car id");
      return await new CarsRepository().delete(carId);
    } catch (error) {
      return ServiceResponse.error(error, "Car could not be deleted.");
    }
  });
  ipcMain.handle("add-old-customer", async (_event, rawPayload) => {
    try {
      if (!isRecord(rawPayload)) throw new Error("Invalid old customer payload.");
      const carId = requireNumber(rawPayload.carId, "car id");
      const customerId = requireNumber(rawPayload.customerId, "customer id");
      return await new CarsRepository().addOldCustomer(carId, customerId);
    } catch (error) {
      return ServiceResponse.error(error, "Old customer could not be added.");
    }
  });
  ipcMain.handle("remove-old-customer", async (_event, rawPayload) => {
    try {
      if (!isRecord(rawPayload)) throw new Error("Invalid old customer payload.");
      const carId = requireNumber(rawPayload.carId, "car id");
      const customerId = requireNumber(rawPayload.customerId, "customer id");
      return await new CarsRepository().removeOldCustomer(carId, customerId);
    } catch (error) {
      return ServiceResponse.error(error, "Old customer could not be removed.");
    }
  });
  ipcMain.handle("get-all-services", async () => {
    try {
      return await new ServiceService(new ServicesRepository(), new PartsRepository()).getAll();
    } catch (error) {
      return ServiceResponse.error(error, "Services could not be loaded.");
    }
  });
  ipcMain.handle("get-service", async (_event, rawServiceId) => {
    try {
      return await new ServiceService(new ServicesRepository(), new PartsRepository()).getDetails(requireNumber(rawServiceId, "service id"));
    } catch (error) {
      return ServiceResponse.error(error, "Service could not be loaded.");
    }
  });
  ipcMain.handle("get-services-by-car", async (_event, rawCarId) => {
    try {
      return await new ServiceService(new ServicesRepository(), new PartsRepository()).getByCarId(requireNumber(rawCarId, "car id"));
    } catch (error) {
      return ServiceResponse.error(error, "Car service history could not be loaded.");
    }
  });
  ipcMain.handle("get-services-by-customer", async (_event, rawCustomerId) => {
    try {
      return await new ServiceService(new ServicesRepository(), new PartsRepository()).getByCustomerId(requireNumber(rawCustomerId, "customer id"));
    } catch (error) {
      return ServiceResponse.error(error, "Customer service history could not be loaded.");
    }
  });
  ipcMain.handle("get-parts-by-service", async (_event, rawServiceId) => {
    try {
      return await new PartsRepository().getByServiceId(requireNumber(rawServiceId, "service id"));
    } catch (error) {
      return ServiceResponse.error(error, "Service parts could not be loaded.");
    }
  });
  ipcMain.handle("add-service", async (_event, rawPayload) => {
    try {
      const payload = parseServiceRequest(rawPayload);
      const parts = payload.parts.map((part) => ({ carId: payload.service.carId, serviceId: 0, ...part }));
      const result = await new ServiceService(new ServicesRepository(), new PartsRepository()).createService(payload.service, parts);
      return result;
    } catch (error) {
      return ServiceResponse.error(error, "Service could not be created.");
    }
  });
  ipcMain.handle("update-service", async (_event, rawPayload) => {
    try {
      const payload = parseUpdateServiceRequest(rawPayload);
      const parts = payload.parts.map((part) => ({ carId: payload.service.carId, serviceId: payload.id, ...part }));
      const result = await new ServiceService(new ServicesRepository(), new PartsRepository()).updateService(payload.id, payload.service, parts);
      return result;
    } catch (error) {
      return ServiceResponse.error(error, "Service could not be updated.");
    }
  });
  ipcMain.handle("delete-service", async (_event, rawServiceId) => {
    try {
      return await new ServiceService(new ServicesRepository(), new PartsRepository()).deleteService(requireNumber(rawServiceId, "service id"));
    } catch (error) {
      return ServiceResponse.error(error, "Service could not be deleted.");
    }
  });
  ipcMain.handle("get-all-brands", async () => {
    try {
      const brandService = new BrandService(new BrandsRepository());
      return await brandService.getAllBrands();
    } catch (error) {
      console.error("🆘 Markalar alınırken hata:", getErrorMessage(error));
      return ServiceResponse.error(error, "Brands could not be loaded.");
    }
  });
  ipcMain.handle("add-brand", async (_event, rawPayload) => {
    try {
      const payload = parseCreateBrandRequest(rawPayload);
      const brandService = new BrandService(new BrandsRepository());
      return await brandService.createBrand(payload);
    } catch (error) {
      console.error("🆘 Marka eklenirken hata:", getErrorMessage(error));
      return ServiceResponse.error(error, "Brand could not be created.");
    }
  });
}
const currentFilePath = fileURLToPath(import.meta.url);
const __dirname$1 = path$1.dirname(currentFilePath);
process.env.APP_ROOT = path$1.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
const VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
process.env.VITE_PUBLIC = VITE_PUBLIC;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path$1.join(VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname$1, "preload.mjs")
    }
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
  }
}
app.on("before-quit", () => {
  closeDb();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
const STARTUP_ERROR_TEXTS = {
  tr: {
    title: "Veritabanı başlatılamadı",
    body: (dbPath, message, logFile) => `Uygulama veritabanını açamadığı için kapatılacak.

Veritabanı: ${dbPath}
Hata: ${message}

Ayrıntılar: ${logFile}

Sorun sürerse bu iletiyi ve log dosyasını geliştiriciye iletin.`
  },
  en: {
    title: "Database could not be started",
    body: (dbPath, message, logFile) => `The application could not open its database and will close.

Database: ${dbPath}
Error: ${message}

Details: ${logFile}

If the problem persists, send this message and the log file to the developer.`
  }
};
function failStartup(error, dbPath, language) {
  const message = error instanceof Error ? error.message : String(error);
  const logFile = path$1.join(app.getPath("userData"), "startup-error.log");
  try {
    const details = error instanceof Error ? error.stack ?? error.message : String(error);
    fs$1.appendFileSync(logFile, `[${(/* @__PURE__ */ new Date()).toISOString()}] DB: ${dbPath}
${details}

`);
  } catch (logError) {
    console.error("Could not write startup log:", logError);
  }
  const texts = language === "tr" ? STARTUP_ERROR_TEXTS.tr : STARTUP_ERROR_TEXTS.en;
  dialog.showErrorBox(texts.title, texts.body(dbPath, message, logFile));
  closeDrizzle();
  closeDb();
  app.exit(1);
  throw error;
}
app.whenReady().then(async () => {
  registerIpcHandlers();
  const config = getConfig();
  const finalDbPath = config == null ? void 0 : config.savePath;
  if (finalDbPath) {
    try {
      CreateDefaultDb(finalDbPath);
      initDrizzle();
      await runDatabaseMigrations();
      console.log("🟢 Veritabanı bağlandı:", finalDbPath);
    } catch (error) {
      console.error("🔴 Veritabanı başlatılırken hata oluştu:", error);
      failStartup(error, finalDbPath, config == null ? void 0 : config.language);
    }
  }
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
