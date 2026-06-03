import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LibsqlConnector } from "../../connector/index.js";
import { registerExecuteTool } from "./execute.js";
import { registerBatchTool } from "./batch.js";
import { registerTransactionTool } from "./transaction.js";
import { registerListTablesTool } from "./list-tables.js";
import { registerDescribeTableTool } from "./describe-table.js";
import { registerMigrateTool } from "./migrate.js";
import { registerDatabaseOverviewTool } from "./database-overview.js";

export function registerAllTools(
  server: McpServer,
  connector: LibsqlConnector,
): void {
  registerExecuteTool(server, connector);
  registerBatchTool(server, connector);
  registerTransactionTool(server, connector);
  registerListTablesTool(server, connector);
  registerDescribeTableTool(server, connector);
  registerMigrateTool(server, connector);
  registerDatabaseOverviewTool(server, connector);
}
