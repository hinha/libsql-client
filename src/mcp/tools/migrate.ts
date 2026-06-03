import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { LibsqlConnector } from "../../connector/index.js";

export function registerMigrateTool(
  server: McpServer,
  connector: LibsqlConnector,
) {
  server.registerTool(
    "migrate",
    {
      description:
        "Run database migrations. Each migration should contain a SQL statement. Migrations are applied sequentially.",
      inputSchema: {
        migrations: z
          .array(
            z.object({
              sql: z.string().describe("SQL statement for this migration"),
            }),
          )
          .describe("Array of migration objects with SQL statements"),
      },
    },
    async ({ migrations }) => {
      try {
        await connector.migrate(migrations);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  applied: migrations.length,
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
