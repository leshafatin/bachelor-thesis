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

  CREATE TABLE IF NOT EXISTS page_views (
    page_view_id TEXT PRIMARY KEY,
    route TEXT NOT NULL,
    slug TEXT,
    page_kind TEXT,
    strategy TEXT NOT NULL,
    session_id TEXT,
    experiment_name TEXT,
    experiment_group TEXT,
    opened_at TEXT NOT NULL,
    response_status INTEGER,
    navigation_type TEXT
  );

  CREATE TABLE IF NOT EXISTS product_events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_view_id TEXT,
    route TEXT NOT NULL,
    slug TEXT,
    page_kind TEXT,
    strategy TEXT NOT NULL,
    session_id TEXT,
    experiment_name TEXT,
    experiment_group TEXT,
    event_type TEXT NOT NULL,
    event_target TEXT,
    event_value TEXT,
    created_at TEXT NOT NULL
  );

  INSERT OR IGNORE INTO route_strategies(route, strategy)
  VALUES ('/page/:slug', 'csr');
`);

ensureMetricsColumn("slug", "TEXT");
ensureMetricsColumn("page_kind", "TEXT");
ensureMetricsColumn("session_id", "TEXT");
ensureMetricsColumn("experiment_name", "TEXT");
ensureMetricsColumn("experiment_group", "TEXT");
ensureMetricsColumn("page_view_id", "TEXT");

function ensureMetricsColumn(name: string, type: string) {
  const columns = db.prepare("PRAGMA table_info(metrics)").all() as Array<{
    name: string;
  }>;

  if (!columns.some((column) => column.name === name)) {
    db.exec(`ALTER TABLE metrics ADD COLUMN ${name} ${type}`);
  }
}
