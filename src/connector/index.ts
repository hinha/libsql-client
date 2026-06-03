import {
  createClient,
  Client,
  InValue,
  InStatement,
  ResultSet,
  Transaction,
  TransactionMode,
} from "@libsql/client";

export interface TableInfo {
  name: string;
  type: string;
}

export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: boolean;
  default_value: string | null;
  pk: boolean;
}

export interface TableSchema {
  table: string;
  columns: ColumnInfo[];
}

export interface TableStats {
  table: string;
  rowCount: number;
}

export interface DatabaseOverview {
  tables: TableStats[];
  totalTables: number;
}

export class LibsqlConnector {
  private client: Client;

  constructor(url: string, authToken: string) {
    this.client = createClient({ url, authToken });
  }

  async validate(): Promise<void> {
    await this.client.execute("SELECT 1");
  }

  async execute(sql: string, args?: InValue[]): Promise<ResultSet> {
    return this.client.execute({ sql, args: args ?? [] });
  }

  async batch(
    statements: Array<string | { sql: string; args?: InValue[] }>,
    mode?: TransactionMode,
  ): Promise<ResultSet[]> {
    const stmts = statements.map((s) =>
      typeof s === "string" ? s : { sql: s.sql, args: s.args ?? [] },
    );
    return this.client.batch(stmts, mode);
  }

  async transaction(
    statements: Array<string | { sql: string; args?: InValue[] }>,
    mode?: TransactionMode,
  ): Promise<ResultSet[]> {
    const tx = await this.client.transaction(mode);
    const results: ResultSet[] = [];
    try {
      for (const s of statements) {
        const sql = typeof s === "string" ? s : s.sql;
        const args = typeof s === "string" ? [] : (s.args ?? []);
        const rs = await tx.execute({ sql, args });
        results.push(rs);
      }
      await tx.commit();
      return results;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  async migrate(migrations: Array<{ sql: string; args?: InValue[] }>): Promise<ResultSet[]> {
    const stmts: InStatement[] = migrations.map((m) => ({
      sql: m.sql,
      args: m.args ?? [],
    }));
    return this.client.migrate(stmts);
  }

  async listTables(): Promise<TableInfo[]> {
    const rs = await this.client.execute(
      "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY name",
    );
    return rs.rows.map((row) => ({
      name: row.name as string,
      type: row.type as string,
    }));
  }

  async describeTable(table: string): Promise<TableSchema> {
    const tables = await this.listTables();
    const exists = tables.some((t) => t.name === table);
    if (!exists) {
      throw new Error(`Table '${table}' does not exist`);
    }

    const rs = await this.client.execute({
      sql: "PRAGMA table_info(?)",
      args: [table],
    });

    const columns: ColumnInfo[] = rs.rows.map((row) => ({
      cid: row.cid as number,
      name: row.name as string,
      type: row.type as string,
      notnull: (row.notnull as number) === 1,
      default_value: row.dflt_value as string | null,
      pk: (row.pk as number) === 1,
    }));

    return { table, columns };
  }

  async getSchema(): Promise<TableSchema[]> {
    const tables = await this.listTables();
    const schemas: TableSchema[] = [];
    for (const t of tables) {
      if (t.type === "table") {
        schemas.push(await this.describeTable(t.name));
      }
    }
    return schemas;
  }

  async getOverview(): Promise<DatabaseOverview> {
    const tables = await this.listTables();
    const stats: TableStats[] = [];

    for (const t of tables) {
      if (t.type === "table") {
        try {
          const rs = await this.client.execute({
            sql: "SELECT COUNT(*) as cnt FROM " + this.escapeIdentifier(t.name),
            args: [],
          });
          stats.push({
            table: t.name,
            rowCount: (rs.rows[0]?.cnt as number) ?? 0,
          });
        } catch {
          stats.push({ table: t.name, rowCount: -1 });
        }
      }
    }

    return { tables: stats, totalTables: stats.length };
  }

  private escapeIdentifier(name: string): string {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      throw new Error(`Invalid identifier: ${name}`);
    }
    return `"${name}"`;
  }

  async close(): Promise<void> {
    this.client.close();
  }
}
