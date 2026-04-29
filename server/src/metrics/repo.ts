import { db } from "./db.js";

export function getStrategy(route: string): "csr" | "ssr" | "ssg" {
  const row = db
    .prepare("SELECT strategy FROM route_strategies WHERE route=?")
    .get(route) as any;
  return (row?.strategy ?? "csr") as any;
}

export function setStrategy(route: string, strategy: "csr" | "ssr" | "ssg") {
  db.prepare(
    "INSERT INTO route_strategies(route, strategy) VALUES (?, ?) ON CONFLICT(route) DO UPDATE SET strategy=excluded.strategy"
  ).run(route, strategy);
}

export function insertMetric(m: {
  source: "server" | "client";
  pageViewId?: string;
  route: string;
  strategy: string;
  slug?: string;
  pageKind?: string;
  sessionId?: string;
  experimentName?: string;
  experimentGroup?: string;
  name: string;
  value: number;
  ts: string;
}) {
  db.prepare(
    "INSERT INTO metrics(source, page_view_id, route, strategy, slug, page_kind, session_id, experiment_name, experiment_group, name, value, ts) VALUES (@source, @pageViewId, @route, @strategy, @slug, @pageKind, @sessionId, @experimentName, @experimentGroup, @name, @value, @ts)"
  ).run(m);
}

export function insertPageView(view: {
  pageViewId: string;
  route: string;
  slug?: string;
  pageKind?: string;
  strategy: string;
  sessionId?: string;
  experimentName?: string;
  experimentGroup?: string;
  openedAt: string;
  responseStatus: number;
  navigationType: string;
}) {
  db.prepare(
    "INSERT INTO page_views(page_view_id, route, slug, page_kind, strategy, session_id, experiment_name, experiment_group, opened_at, response_status, navigation_type) VALUES (@pageViewId, @route, @slug, @pageKind, @strategy, @sessionId, @experimentName, @experimentGroup, @openedAt, @responseStatus, @navigationType)"
  ).run(view);
}

export function insertProductEvent(event: {
  pageViewId?: string;
  route: string;
  slug?: string;
  pageKind?: string;
  strategy: string;
  sessionId?: string;
  experimentName?: string;
  experimentGroup?: string;
  eventType: string;
  eventTarget?: string;
  eventValue?: string;
  createdAt: string;
}) {
  db.prepare(
    "INSERT INTO product_events(page_view_id, route, slug, page_kind, strategy, session_id, experiment_name, experiment_group, event_type, event_target, event_value, created_at) VALUES (@pageViewId, @route, @slug, @pageKind, @strategy, @sessionId, @experimentName, @experimentGroup, @eventType, @eventTarget, @eventValue, @createdAt)"
  ).run(event);
}

export function latestMetrics(limit = 20, slug?: string) {
  if (slug) {
    return db
      .prepare("SELECT * FROM metrics WHERE slug = ? ORDER BY id DESC LIMIT ?")
      .all(slug, limit);
  }

  return db.prepare("SELECT * FROM metrics ORDER BY id DESC LIMIT ?").all(limit);
}

export function clearMetrics(route: string, slug?: string) {
  if (slug) {
    db.prepare("DELETE FROM metrics WHERE route = ? AND slug = ?").run(route, slug);
    return;
  }

  db.prepare("DELETE FROM metrics WHERE route = ?").run(route);
}

export function latestProductEvents(limit = 20, slug?: string) {
  if (slug) {
    return db
      .prepare(
        "SELECT * FROM product_events WHERE slug = ? ORDER BY event_id DESC LIMIT ?"
      )
      .all(slug, limit);
  }

  return db
    .prepare("SELECT * FROM product_events ORDER BY event_id DESC LIMIT ?")
    .all(limit);
}

export function clearProductEvents(route: string, slug?: string) {
  if (slug) {
    db.prepare("DELETE FROM product_events WHERE route = ? AND slug = ?").run(
      route,
      slug
    );
    db.prepare("DELETE FROM page_views WHERE route = ? AND slug = ?").run(
      route,
      slug
    );
    return;
  }

  db.prepare("DELETE FROM product_events WHERE route = ?").run(route);
  db.prepare("DELETE FROM page_views WHERE route = ?").run(route);
}
