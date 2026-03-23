import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.resolve(process.cwd(), "db.sqlite");
export const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS route_strategies (
    route TEXT PRIMARY KEY,
    strategy TEXT NOT NULL CHECK(strategy IN ('csr','ssr','ssg'))
  );

  CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,            -- 'server' | 'client'
    route TEXT NOT NULL,
    strategy TEXT NOT NULL,
    name TEXT NOT NULL,              -- TTFB, serverRenderMs, LCP, CLS, INP...
    value REAL NOT NULL,
    ts TEXT NOT NULL
  );

  INSERT OR IGNORE INTO route_strategies(route, strategy)
  VALUES ('/page/:slug', 'csr');
`);
