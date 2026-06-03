import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { LibsqlConnector } from "../../connector/index.js";

export function registerExecuteTool(
  server: McpServer,
  connector: LibsqlConnector,
) {
  server.registerTool(
    "execute",
    {
      description:
        "Execute a single SQL statement (SELECT, INSERT, UPDATE, DELETE, CREATE, etc.). Returns columns, rows, rowsAffected, and lastInsertRowid.",
      inputSchema: {
        sql: z.string().describe("SQL statement to execute"),
        args: z
          .array(z.any())
          .optional()
          .describe("Positional parameters for parameterized queries"),
      },
    },
    async ({ sql, args }) => {
      try {
        const result = await connector.execute(sql, args);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  columns: result.columns,
                  columnTypes: result.columnTypes,
                  rows: result.rows.map((row) =>
                    result.columns.reduce(
                      (obj, col, i) => ({ ...obj, [col]: row[i] }),
                      {} as Record<string, unknown>,
                    ),
                  ),
                  rowsAffected: result.rowsAffected,
                  lastInsertRowid: result.lastInsertRowid,
                },
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
