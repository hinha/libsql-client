import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { LibsqlConnector } from "../../connector/index.js";

export function registerBatchTool(
  server: McpServer,
  connector: LibsqlConnector,
) {
  server.registerTool(
    "batch",
    {
      description:
        "Execute multiple SQL statements atomically in a single transaction. All statements succeed or all fail together. Returns an array of results.",
      inputSchema: {
        statements: z
          .array(
            z.union([
              z.string().describe("SQL string"),
              z.object({
                sql: z.string().describe("SQL statement"),
                args: z
                  .array(z.any())
                  .optional()
                  .describe("Positional parameters"),
              }),
            ]),
          )
          .describe("Array of SQL statements to execute atomically"),
        mode: z
          .enum(["write", "read", "deferred"])
          .optional()
          .describe("Transaction mode (default: write)"),
      },
    },
    async ({ statements, mode }) => {
      try {
        const results = await connector.batch(statements, mode);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                results.map((r) => ({
                  columns: r.columns,
                  rows: r.rows.map((row) =>
                    r.columns.reduce(
                      (obj, col, i) => ({ ...obj, [col]: row[i] }),
                      {} as Record<string, unknown>,
                    ),
                  ),
                  rowsAffected: r.rowsAffected,
                  lastInsertRowid: r.lastInsertRowid,
                })),
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text" as const, text: `Error: ${msg}` }],
          isError: true,
        };
      }
    },
  );
}
