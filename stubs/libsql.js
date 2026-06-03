// Stub for libsql native module.
// The standalone binary only supports remote Turso connections (HTTPS/WSS).
// Local SQLite (file://) is not available in the binary.

class Database {
  constructor() {
    throw new Error(
      "Local SQLite is not supported in the standalone binary. " +
      "Use the npm package (npx @hinha/libsql-mcp) for local file access.",
    );
  }
}

module.exports = Database;
module.exports.SqliteError = class SqliteError extends Error {};
