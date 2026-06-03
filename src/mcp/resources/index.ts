import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LibsqlConnector } from "../../connector/index.js";
import { registerSchemaResource } from "./schema.js";
import { registerTablesResource } from "./tables.js";
import { registerTableDetailResource } from "./table-detail.js";

export function registerAllResources(
  server: McpServer,
  connector: LibsqlConnector,
): void {
  registerSchemaResource(server, connector);
  registerTablesResource(server, connector);
  registerTableDetailResource(server, connector);
}
