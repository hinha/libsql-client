import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LibsqlConnector } from "../../connector/index.js";

export function registerTableDetailResource(
  server: McpServer,
  connector: LibsqlConnector,
) {
  server.registerResource(
    "table-detail",
    new ResourceTemplate("turso://tables/{name}", { list: undefined }),
    {
      description: "Schema details for a specific table (columns, types, constraints)",
      mimeType: "application/json",
    },
    async (uri, { name }) => {
      try {
        const schema = await connector.describeTable(name as string);
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
