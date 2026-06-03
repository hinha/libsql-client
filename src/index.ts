import "dotenv/config";
import { LibsqlConnector } from "./connector/index.js";
import { createMcpServer } from "./mcp/server.js";
import { VERSION } from "./version.js";
import { startStdio } from "./transport/stdio.js";
import { startHttp } from "./transport/http.js";

function printHelp(): never {
  console.log(`@hinha/libsql-mcp v${VERSION}`);
  console.log();
  console.log("libSQL/Turso MCP server for AI agents");
  console.log();
  console.log("Environment variables:");
  console.log("  LIBSQL_URL          Database URL (required)");
  console.log("  LIBSQL_AUTH_TOKEN   Auth token (required)");
  console.log("  TRANSPORT           stdio | http (default: stdio)");
  console.log("  PORT                HTTP port (default: 3000)");
  process.exit(0);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--version") || args.includes("-v")) {
    console.log(VERSION);
    process.exit(0);
  }
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
  }

  const url = process.env.LIBSQL_URL;
  const authToken = process.env.LIBSQL_AUTH_TOKEN;
  const transport = process.env.TRANSPORT ?? "stdio";
  const port = parseInt(process.env.PORT ?? "3000", 10);

  if (!url || !authToken) {
    console.error(
      "Error: LIBSQL_URL and LIBSQL_AUTH_TOKEN environment variables are required",
    );
    console.error("Run with --help for usage information");
    process.exit(1);
  }

  console.error(`@hinha/libsql-mcp v${VERSION}`);

  const connector = new LibsqlConnector(url, authToken);

  try {
    await connector.validate();
    console.error(`Connected to ${url}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`Failed to connect to database: ${msg}`);
    process.exit(1);
  }

  const server = createMcpServer(connector);

  if (transport === "http") {
    await startHttp(server, port);
  } else {
    await startStdio(server);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
