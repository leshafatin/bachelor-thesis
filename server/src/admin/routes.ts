import type { Router } from "express";
import {
  clearMetrics,
  getStrategy,
  latestMetrics,
  latestProductEvents,
  setStrategy,
  clearProductEvents,
} from "../metrics/repo.js";
import { db } from "../metrics/db.js";
import fs from "node:fs";
import path from "node:path";
import { getPageData, listPageScenarios } from "../data/dataService.js";
import { findExperimentForRoute } from "../experiments/config.js";

type SummaryRow = {
  strategy: string;
  experimentGroup: string | null;
  name: string;
  n: number;
  avg: number;
  median: number;
  p95: number;
  min: number;
  max: number;
};

export function mountAdmin(router: Router) {
  router.get("/admin", (req, res) => {
    const routeKey = "/page/:slug";
    const cur = getStrategy(routeKey);
    const selectedSlug = String(req.query.slug ?? "hello");
    const pageData = getPageData(selectedSlug);
    const experiment = findExperimentForRoute(routeKey, pageData.slug);
    const productRowsHtml = latestProductEvents(12, pageData.slug)
      .map(
        (event: any) =>
          `<tr><td>${event.event_id}</td><td>${event.strategy}</td><td>${event.experiment_group ?? "-"}</td><td>${event.event_type}</td><td>${event.event_target ?? "-"}</td><td>${event.event_value ?? "-"}</td><td>${event.created_at}</td></tr>`
      )
      .join("");

    const rowsHtml = latestMetrics(15, pageData.slug)
      .map(
        (m: any) =>
          `<tr><td>${m.id}</td><td>${m.slug ?? "-"}</td><td>${m.page_kind ?? "-"}</td><td>${m.source}</td><td>${m.strategy}</td><td>${m.experiment_group ?? "-"}</td><td>${m.name}</td><td>${Number(
            m.value
          ).toFixed(2)}</td><td>${m.ts}</td></tr>`
      )
      .join("");

    const optionsHtml = ["csr", "ssr", "ssg"]
      .map(
        (s) =>
          `<option value="${s}" ${s === cur ? "selected" : ""}>${s}</option>`
      )
      .join("");

    const scenariosHtml = listPageScenarios()
      .map((scenario) => {
        const active = scenario.slug === pageData.slug;
        return `<a href="/admin?slug=${encodeURIComponent(
          scenario.slug
        )}" style="display:block;padding:14px;border:1px solid ${
          active ? "#244c7d" : "#d7dce2"
        };border-radius:12px;text-decoration:none;color:inherit;background:${
          active ? "#eef6ff" : "#fff"
        }"><strong>${scenario.title}</strong><div style="margin-top:8px;font-size:14px;color:#516070"><code>/page/${
          scenario.slug
        }</code></div><div style="margin-top:8px;font-size:14px;color:#516070">${
          scenario.note
        }</div></a>`;
      })
      .join("");

    const tplPath = path.resolve(process.cwd(), "src/admin/admin.html");
    let html = fs.readFileSync(tplPath, "utf-8");

    html = html
      .replaceAll("{{routeKey}}", routeKey)
      .replaceAll("{{cur}}", cur)
      .replaceAll("{{selectedSlug}}", pageData.slug)
      .replaceAll("{{selectedKind}}", pageData.kind)
      .replaceAll("{{selectedTitle}}", pageData.title)
      .replaceAll("{{selectedGoal}}", pageData.experimentGoal)
      .replaceAll(
        "{{experimentState}}",
        experiment
          ? `Активен эксперимент <code>${experiment.name}</code>. Для этого сценария стратегия назначается по группе пользователя: ${experiment.groups
              .map((group) => `${group.name} -> ${group.strategy}`)
              .join(", ")}`
          : "Для этого сценария активного A/B-эксперимента пока нет. Используется базовая стратегия маршрута."
      )
      .replaceAll("{{scenarioCards}}", scenariosHtml)
      .replaceAll("{{options}}", optionsHtml)
      .replaceAll("{{productRows}}", productRowsHtml)
      .replaceAll("{{rows}}", rowsHtml);

    res.type("html").send(html);
  });

  router.post("/admin/strategy", (req, res) => {
    const route = String(req.body.route ?? "");
    const strategy = String(req.body.strategy ?? "") as
      | "csr"
      | "ssr"
      | "ssg";
    const slug = String(req.body.slug ?? "hello");

    if (!route || !["csr", "ssr", "ssg"].includes(strategy)) {
      return res.status(400).send("bad input");
    }

    setStrategy(route, strategy);
    res.redirect(`/admin?slug=${encodeURIComponent(slug)}`);
  });

  router.post("/admin/reset", (req, res) => {
    const route = String(req.body.route ?? "");
    const slug = String(req.body.slug ?? "");
    if (!route) {
      return res.status(400).send("bad input");
    }

    clearMetrics(route, slug || undefined);
    clearProductEvents(route, slug || undefined);
    res.redirect(`/admin?slug=${encodeURIComponent(slug || "hello")}`);
  });

  router.get("/admin/export.csv", (req, res) => {
    const slug = String(req.query.slug ?? "");
    const rows = db
      .prepare(
        slug
          ? "SELECT * FROM metrics WHERE slug = ? ORDER BY id ASC"
          : "SELECT * FROM metrics ORDER BY id ASC"
      )
      .all(...(slug ? [slug] : [])) as any[];

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${slug || "metrics"}.csv`
    );

    const header =
      [
        "id",
        "source",
        "route",
        "slug",
        "page_kind",
        "session_id",
        "experiment_name",
        "experiment_group",
        "strategy",
        "name",
        "value",
        "ts",
      ].join(",") + "\n";

    const body = rows
      .map((r) =>
        [
          r.id,
          r.source,
          r.route,
          r.slug,
          r.page_kind,
          r.session_id,
          r.experiment_name,
          r.experiment_group,
          r.strategy,
          r.name,
          r.value,
          r.ts,
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    res.send(header + body);
  });

  router.get("/admin/summary.json", (req, res) => {
    const route = String(req.query.route ?? "/page/:slug");
    const slug = String(req.query.slug ?? "hello");

    res.json({ route, slug, rows: buildSummaryRows(route, slug) });
  });

  router.get("/admin/product-summary.json", (req, res) => {
    const route = String(req.query.route ?? "/page/:slug");
    const slug = String(req.query.slug ?? "hello");

    res.json({ route, slug, rows: buildProductSummaryRows(route, slug) });
  });

  router.get("/admin/funnel.json", (req, res) => {
    const route = String(req.query.route ?? "/page/:slug");
    const slug = String(req.query.slug ?? "hello");

    res.json({ route, slug, rows: buildProductFunnelRows(route, slug) });
  });

  router.get("/admin/summary.csv", (req, res) => {
    const route = String(req.query.route ?? "/page/:slug");
    const slug = String(req.query.slug ?? "hello");
    const pageData = getPageData(slug);
    const summary = buildSummaryRows(route, pageData.slug);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${pageData.slug}-summary.csv`
    );

    const header =
      [
        "slug",
        "page_kind",
        "experiment_group",
        "strategy",
        "metric",
        "n",
        "avg",
        "median",
        "p95",
        "min",
        "max",
      ].join(",") + "\n";

    const body = summary
      .map((row) =>
        [
          pageData.slug,
          pageData.kind,
          row.experimentGroup,
          row.strategy,
          row.name,
          row.n,
          row.avg,
          row.median,
          row.p95,
          row.min,
          row.max,
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    res.send(header + body);
  });
}

function buildSummaryRows(route: string, slug: string): SummaryRow[] {
  const metrics = db
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

  const grouped = new Map<string, number[]>();
  for (const item of metrics) {
    const key = `${item.strategy}:${item.experiment_group ?? ""}:${item.name}`;
    const bucket = grouped.get(key) ?? [];
    bucket.push(Number(item.value));
    grouped.set(key, bucket);
  }

  return Array.from(grouped.entries())
    .map(([key, values]) => {
      const [strategy, experimentGroup, name] = key.split(":");
      const sorted = [...values].sort((a, b) => a - b);
      return {
        strategy,
        experimentGroup: experimentGroup || null,
        name,
        n: sorted.length,
        avg: round(mean(sorted)),
        median: round(percentile(sorted, 0.5)),
        p95: round(percentile(sorted, 0.95)),
        min: round(sorted[0] ?? 0),
        max: round(sorted[sorted.length - 1] ?? 0),
      };
    })
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name) ||
        a.strategy.localeCompare(b.strategy) ||
        (a.experimentGroup ?? "").localeCompare(b.experimentGroup ?? "")
    );
}

function mean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function percentile(values: number[], ratio: number) {
  if (!values.length) return 0;
  const index = Math.min(
    values.length - 1,
    Math.max(0, Math.ceil(values.length * ratio) - 1)
  );
  return values[index];
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function buildProductSummaryRows(route: string, slug: string) {
  const views = db
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

  const events = db
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

  const sessionCounts = new Map<string, Set<string>>();
  for (const view of views) {
    const key = `${view.strategy}:${view.experiment_group ?? ""}`;
    const bucket = sessionCounts.get(key) ?? new Set<string>();
    if (view.session_id) bucket.add(view.session_id);
    sessionCounts.set(key, bucket);
  }

  const grouped = new Map<
    string,
    { totalEvents: number; uniqueViews: Set<string>; uniqueSessions: Set<string> }
  >();
  for (const event of events) {
    const key = `${event.strategy}:${event.experiment_group ?? ""}:${event.event_type}`;
    const bucket = grouped.get(key) ?? {
      totalEvents: 0,
      uniqueViews: new Set<string>(),
      uniqueSessions: new Set<string>(),
    };
    bucket.totalEvents += 1;
    if (event.page_view_id) bucket.uniqueViews.add(event.page_view_id);
    if (event.session_id) bucket.uniqueSessions.add(event.session_id);
    grouped.set(key, bucket);
  }

  return Array.from(grouped.entries())
    .map(([key, bucket]) => {
      const [strategy, experimentGroup, eventType] = key.split(":");
      const sessionsForSlice =
        sessionCounts.get(`${strategy}:${experimentGroup}`)?.size ?? 0;
      return {
        strategy,
        experimentGroup: experimentGroup || null,
        eventType,
        totalEvents: bucket.totalEvents,
        uniqueViews: bucket.uniqueViews.size,
        uniqueSessions: bucket.uniqueSessions.size,
        conversionRatePct: sessionsForSlice
          ? round((bucket.uniqueSessions.size / sessionsForSlice) * 100)
          : 0,
      };
    })
    .sort(
      (a, b) =>
        a.eventType.localeCompare(b.eventType) ||
        a.strategy.localeCompare(b.strategy) ||
        (a.experimentGroup ?? "").localeCompare(b.experimentGroup ?? "")
    );
}

function buildProductFunnelRows(route: string, slug: string) {
  const views = db
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

  const events = db
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

  const stages = getScenarioFunnelStages(slug);
  const stageOrder = new Map(stages.map((stage, index) => [stage.key, index]));

  const slices = new Map<string, Map<string, Set<string>>>();

  for (const view of views) {
    if (!view.session_id) continue;
    const sliceKey = `${view.strategy}:${view.experiment_group ?? ""}`;
    const slice = slices.get(sliceKey) ?? new Map<string, Set<string>>();
    const entry = slice.get("page_view") ?? new Set<string>();
    entry.add(view.session_id);
    slice.set("page_view", entry);
    slices.set(sliceKey, slice);
  }

  for (const event of events) {
    if (!event.session_id) continue;
    const sliceKey = `${event.strategy}:${event.experiment_group ?? ""}`;
    const slice = slices.get(sliceKey) ?? new Map<string, Set<string>>();
    const bucket = slice.get(event.event_type) ?? new Set<string>();
    bucket.add(event.session_id);
    slice.set(event.event_type, bucket);
    slices.set(sliceKey, slice);
  }

  return Array.from(slices.entries())
    .flatMap(([sliceKey, slice]) => {
      const [strategy, experimentGroup] = sliceKey.split(":");
      const entryCount = slice.get("page_view")?.size ?? 0;

      return stages.map((stage) => {
        const currentCount = slice.get(stage.key)?.size ?? 0;
        const previousCount = stage.previousKey
          ? slice.get(stage.previousKey)?.size ?? 0
          : entryCount;
        const fromEntry = entryCount
          ? round((currentCount / entryCount) * 100)
          : 0;
        const fromPrevious =
          !stage.previousKey
            ? 100
            : previousCount
              ? round((currentCount / previousCount) * 100)
              : 0;

        return {
          strategy,
          experimentGroup: experimentGroup || null,
          stageKey: stage.key,
          stageLabel: stage.label,
          sessionsReached: currentCount,
          fromEntryPct: fromEntry,
          fromPreviousPct: fromPrevious,
        };
      });
    })
    .sort(
      (a, b) =>
        a.strategy.localeCompare(b.strategy) ||
        (a.experimentGroup ?? "").localeCompare(b.experimentGroup ?? "") ||
        (stageOrder.get(a.stageKey) ?? 0) - (stageOrder.get(b.stageKey) ?? 0)
    );
}

function getScenarioFunnelStages(slug: string) {
  if (slug === "catalog") {
    return [
      { key: "page_view", label: "Вход в сценарий", previousKey: null },
      {
        key: "view_product_details",
        label: "Просмотр товара",
        previousKey: "page_view",
      },
      {
        key: "add_to_cart",
        label: "Добавление в корзину",
        previousKey: "view_product_details",
      },
      {
        key: "begin_checkout",
        label: "Старт оформления",
        previousKey: "add_to_cart",
      },
      {
        key: "submit_checkout",
        label: "Подтверждение заказа",
        previousKey: "begin_checkout",
      },
      {
        key: "click_fake_door",
        label: "Интерес к рассрочке",
        previousKey: "page_view",
      },
    ];
  }

  if (slug === "report") {
    return [
      { key: "page_view", label: "Вход в сценарий", previousKey: null },
      {
        key: "change_report_filter",
        label: "Выбор периода",
        previousKey: "page_view",
      },
      {
        key: "open_report_detail",
        label: "Открытие детали",
        previousKey: "change_report_filter",
      },
      {
        key: "acknowledge_alert",
        label: "Подтверждение алерта",
        previousKey: "open_report_detail",
      },
      {
        key: "export_report",
        label: "Экспорт отчёта",
        previousKey: "acknowledge_alert",
      },
    ];
  }

  return [
    { key: "page_view", label: "Вход в сценарий", previousKey: null },
    {
      key: "engaged_read",
      label: "Вовлечение в материал",
      previousKey: "page_view",
    },
    {
      key: "open_related_material",
      label: "Открытие связанного блока",
      previousKey: "engaged_read",
    },
    {
      key: "click_cta",
      label: "Целевое действие",
      previousKey: "open_related_material",
    },
  ];
}
