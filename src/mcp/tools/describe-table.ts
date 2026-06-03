import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { LibsqlConnector } from "../../connector/index.js";

export function registerDescribeTableTool(
  server: McpServer,
  connector: LibsqlConnector,
) {
  server.registerTool(
    "describe_table",
    {
      description:
        "Get the schema of a specific table including column names, types, nullable, default values, and primary key info.",
      inputSchema: {
        table: z.string().describe("Name of the table to describe"),
      },
    },
    async ({ table }) => {
      try {
        const schema = await connector.describeTable(table);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(schema, null, 2),
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
