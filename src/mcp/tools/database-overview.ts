import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LibsqlConnector } from "../../connector/index.js";

export function registerDatabaseOverviewTool(
  server: McpServer,
  connector: LibsqlConnector,
) {
  server.registerTool(
    "database_overview",
    {
      description:
        "Get an overview of the database: list of all tables with row counts and total table count.",
    },
    async () => {
      try {
        const overview = await connector.getOverview();
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(overview, null, 2),
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
