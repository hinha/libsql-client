// Stub for libsql native module (ESM format).
// The standalone binary only supports remote Turso connections (HTTPS/WSS).

class Database {
  constructor() {
    throw new Error(
      "Local SQLite is not supported in the standalone binary. " +
      "Use the npm package (npx @hinha/libsql-mcp) for local file access.",
    );
  }
}

export default Database;
export class SqliteError extends Error {}
