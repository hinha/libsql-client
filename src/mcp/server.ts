import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LibsqlConnector } from "../connector/index.js";
import { registerAllTools } from "./tools/index.js";
import { registerAllResources } from "./resources/index.js";
import { VERSION } from "../version.js";

export { VERSION as getVersion };

export function createMcpServer(connector: LibsqlConnector): McpServer {
  const server = new McpServer({
    name: "libsql-mcp",
    version: VERSION,
  });

  registerAllTools(server, connector);
  registerAllResources(server, connector);

  return server;
}
