import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LibsqlConnector } from "../../connector/index.js";

export function registerSchemaResource(
  server: McpServer,
  connector: LibsqlConnector,
) {
  server.registerResource(
    "schema",
    "turso://schema",
    {
      description: "Full database schema with all tables and their column definitions",
      mimeType: "application/json",
    },
    async (uri) => {
      try {
        const schema = await connector.getSchema();
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "application/json",
              text: JSON.stringify(schema, null, 2),
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
