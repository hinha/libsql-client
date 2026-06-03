# @hinha/libsql-mcp

libSQL/Turso MCP server for AI agents. Provides full CRUD database operations as [Model Context Protocol](https://modelcontextprotocol.io) tools and resources, enabling AI assistants like Claude and Cursor to directly query and manage your libSQL/Turso databases.

## Features

- **7 MCP Tools** — `execute`, `batch`, `transaction`, `list_tables`, `describe_table`, `migrate`, `database_overview`
- **3 MCP Resources** — database schema, table listing, individual table schemas
- **Dual Transport** — stdio (local CLI) and HTTP (remote/network access)
- **Remote Turso & Self-hosted** — supports `libsql://`, `https://`, and `wss://` URLs
- **TypeScript** — strict mode, ESM, full type declarations

## Quick Start

### Using with npx (Recommended)

No install needed. Run directly:

```bash
npx -y @hinha/libsql-mcp@latest
```

Or add to your MCP client config:

```json
{
  "mcpServers": {
    "libsql": {
      "command": "npx",
      "args": ["-y", "@hinha/libsql-mcp@latest"],
      "env": {
        "LIBSQL_URL": "https://your-db.sqlite.turso.io",
        "LIBSQL_AUTH_TOKEN": "your-auth-token"
      }
    }
  }
}
```

### Install globally

```bash
npm install -g @hinha/libsql-mcp
LIBSQL_URL=https://your-db.sqlite.turso.io LIBSQL_AUTH_TOKEN=your-token libsql-mcp
```

### Build from source

```bash
git clone https://github.com/hinha/libsql-client.git
cd libsql-client
npm install
npm run build
npm start
```

## Configuration

Set via environment variables or `.env` file:

| Variable | Required | Default | Description |
|---|---|---|---|
| `LIBSQL_URL` | Yes | — | Database URL (`https://`, `libsql://`, `wss://`) |
| `LIBSQL_AUTH_TOKEN` | Yes | — | Auth token (JWT or Turso platform token) |
| `TRANSPORT` | No | `stdio` | Transport mode: `stdio` or `http` |
| `PORT` | No | `3000` | HTTP port (when `TRANSPORT=http`) |

## MCP Client Configuration

### Claude Code

Add to your `settings.json`:

```json
{
  "mcpServers": {
    "libsql": {
      "command": "npx",
      "args": ["-y", "@hinha/libsql-mcp@latest"],
      "env": {
        "LIBSQL_URL": "https://your-db.sqlite.turso.io",
        "LIBSQL_AUTH_TOKEN": "your-auth-token"
      }
    }
  }
}
```

### Cursor

Add to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "libsql": {
      "command": "npx",
      "args": ["-y", "@hinha/libsql-mcp@latest"],
      "env": {
        "LIBSQL_URL": "https://your-db.sqlite.turso.io",
        "LIBSQL_AUTH_TOKEN": "your-auth-token"
      }
    }
  }
}
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "libsql": {
      "command": "npx",
      "args": ["-y", "@hinha/libsql-mcp@latest"],
      "env": {
        "LIBSQL_URL": "https://your-db.sqlite.turso.io",
        "LIBSQL_AUTH_TOKEN": "your-auth-token"
      }
    }
  }
}
```

### HTTP mode (remote access)

```bash
TRANSPORT=http PORT=3000 npx -y @hinha/libsql-mcp@latest
```

## MCP Tools

### `execute`

Execute a single SQL statement.

```json
{
  "sql": "SELECT * FROM users WHERE active = ?",
  "args": [1]
}
```

### `batch`

Execute multiple SQL statements atomically. All succeed or all fail.

```json
{
  "statements": [
    "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, price REAL)",
    { "sql": "INSERT INTO products (name, price) VALUES (?, ?)", "args": ["Widget", 9.99] },
    { "sql": "INSERT INTO products (name, price) VALUES (?, ?)", "args": ["Gadget", 14.99] }
  ],
  "mode": "write"
}
```

### `transaction`

Execute multiple SQL statements in an interactive transaction with explicit commit/rollback.

```json
{
  "statements": [
    { "sql": "UPDATE accounts SET balance = balance - ? WHERE id = ?", "args": [100, 1] },
    { "sql": "UPDATE accounts SET balance = balance + ? WHERE id = ?", "args": [100, 2] }
  ],
  "mode": "write"
}
```

### `list_tables`

List all tables and views in the database.

### `describe_table`

Get column schema for a specific table.

```json
{ "table": "users" }
```

### `migrate`

Run database migrations sequentially.

```json
{
  "migrations": [
    { "sql": "CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, message TEXT, created_at TEXT)" },
    { "sql": "CREATE INDEX IF NOT EXISTS idx_logs_created ON logs(created_at)" }
  ]
}
```

### `database_overview`

Get an overview of the database — all tables with row counts.

## MCP Resources

| Resource | URI | Description |
|---|---|---|
| Schema | `turso://schema` | Full database schema (all tables + columns) |
| Tables | `turso://tables` | List of all tables with metadata |
| Table Detail | `turso://tables/{name}` | Schema for a specific table |

## Project Structure

```
src/
├── connector/index.ts           # LibsqlConnector wrapper class
├── mcp/
│   ├── server.ts                # MCP server setup & registration
│   ├── tools/
│   │   ├── execute.ts           # Execute single SQL
│   │   ├── batch.ts             # Atomic batch operations
│   │   ├── transaction.ts       # Interactive transactions
│   │   ├── list-tables.ts       # List tables & views
│   │   ├── describe-table.ts    # Table schema introspection
│   │   ├── migrate.ts           # Database migrations
│   │   ├── database-overview.ts # Database statistics
│   │   └── index.ts
│   └── resources/
│       ├── schema.ts            # turso://schema resource
│       ├── tables.ts            # turso://tables resource
│       ├── table-detail.ts      # turso://tables/{name} resource
│       └── index.ts
├── transport/
│   ├── stdio.ts                 # Stdio transport (Claude Code, Cursor)
│   └── http.ts                  # HTTP transport (remote access)
└── index.ts                     # Entry point
```

## Development

```bash
npm install
npm run build
npm run dev        # watch mode
npm start          # run server
```

## Release

Push a version tag to trigger the release workflow:

```bash
# Bump version in package.json
npm version patch  # or minor, major
git push --follow-tags
```

The CI workflow will:
1. Build standalone binaries for Linux, macOS (ARM64), and Windows
2. Publish to [npm](https://www.npmjs.com/package/@hinha/libsql-mcp)
3. Create a [GitHub Release](https://github.com/hinha/libsql-client/releases) with binaries

### Download binary

Download the latest binary for your platform from [Releases](https://github.com/hinha/libsql-client/releases):

```bash
# macOS ARM64
curl -L -o libsql-mcp https://github.com/hinha/libsql-client/releases/latest/download/libsql-mcp-macos-arm64
chmod +x libsql-mcp

# Linux x64
curl -L -o libsql-mcp https://github.com/hinha/libsql-client/releases/latest/download/libsql-mcp-linux-x64
chmod +x libsql-mcp

# Windows x64
curl -L -o libsql-mcp.exe https://github.com/hinha/libsql-client/releases/latest/download/libsql-mcp-win-x64.exe
```

Then run:

```bash
LIBSQL_URL=https://your-db.sqlite.turso.io LIBSQL_AUTH_TOKEN=your-token ./libsql-mcp

# Check version
./libsql-mcp --version
```

> **Note:** `NPM_TOKEN` must be set as a GitHub Actions secret for publishing.

## Security

- Table names are validated against `sqlite_master` before use in PRAGMA queries
- SQL is passed through as-is — the AI agent is the trusted user
- Auth tokens are never logged or returned in tool output
