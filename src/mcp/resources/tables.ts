import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LibsqlConnector } from "../../connector/index.js";

export function registerTablesResource(
  server: McpServer,
  connector: LibsqlConnector,
) {
  server.registerResource(
    "tables",
    "turso://tables",
    {
      description: "List of all tables and views in the database",
      mimeType: "application/json",
    },
    async (uri) => {
      try {
        const tables = await connector.listTables();
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "application/json",
              text: JSON.stringify(tables, null, 2),
            },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "application/json",
              text: JSON.stringify({ error: msg }),
            },
          ],
        };
      }
    },
  );
}
