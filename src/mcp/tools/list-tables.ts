import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LibsqlConnector } from "../../connector/index.js";

export function registerListTablesTool(
  server: McpServer,
  connector: LibsqlConnector,
) {
  server.registerTool(
    "list_tables",
    {
      description:
        "List all tables and views in the database. Returns table name and type (table or view).",
    },
    async () => {
      try {
        const tables = await connector.listTables();
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(tables, null, 2),
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
