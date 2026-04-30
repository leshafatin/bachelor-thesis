import { db } from "../metrics/db.js";

export function fetchSummaryMetricPoints(route: string, slug: string) {
  return db
    .prepare(
      `
      SELECT strategy, name, value
           , experiment_group
      FROM metrics
      WHERE route = ?
        AND slug = ?
        AND name IN ('LCP','INP','CLS','TTFB','serverRenderMs')
      ORDER BY strategy, experiment_group, name, id ASC
    `
    )
    .all(route, slug) as Array<{
    strategy: string;
    experiment_group: string | null;
    name: string;
    value: number;
  }>;
}

export function fetchPageViewsForScenario(route: string, slug: string) {
  return db
    .prepare(
      `
      SELECT page_view_id, strategy, experiment_group, session_id
      FROM page_views
      WHERE route = ? AND slug = ?
    `
    )
    .all(route, slug) as Array<{
    page_view_id: string;
    strategy: string;
    experiment_group: string | null;
    session_id: string | null;
  }>;
}

export function fetchProductEventViewsForScenario(route: string, slug: string) {
  return db
    .prepare(
      `
      SELECT page_view_id, strategy, experiment_group, event_type, session_id
      FROM product_events
      WHERE route = ? AND slug = ?
    `
    )
    .all(route, slug) as Array<{
    page_view_id: string | null;
    strategy: string;
    experiment_group: string | null;
    event_type: string;
    session_id: string | null;
  }>;
}

export function fetchProductEventSessionsForScenario(route: string, slug: string) {
  return db
    .prepare(
      `
      SELECT strategy, experiment_group, session_id, event_type
      FROM product_events
      WHERE route = ? AND slug = ?
    `
    )
    .all(route, slug) as Array<{
    strategy: string;
    experiment_group: string | null;
    session_id: string | null;
    event_type: string;
  }>;
}

export function fetchPageViewSessionsForScenario(route: string, slug: string) {
  return db
    .prepare(
      `
      SELECT strategy, experiment_group, session_id
      FROM page_views
      WHERE route = ? AND slug = ?
    `
    )
    .all(route, slug) as Array<{
    strategy: string;
    experiment_group: string | null;
    session_id: string | null;
  }>;
}

export function fetchMetricExportRows(slug: string) {
  return db
    .prepare(
      slug
        ? "SELECT * FROM metrics WHERE slug = ? ORDER BY id ASC"
        : "SELECT * FROM metrics ORDER BY id ASC"
    )
    .all(...(slug ? [slug] : [])) as any[];
}
