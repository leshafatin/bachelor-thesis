import {
  fetchPageViewSessionsForScenario,
  fetchPageViewsForScenario,
  fetchProductEventSessionsForScenario,
  fetchProductEventViewsForScenario,
  fetchSummaryMetricPoints,
} from "./repository.js";
import type {
  FunnelStage,
  ProductFunnelRow,
  ProductSummaryRow,
  SummaryRow,
} from "./types.js";

export function buildSummaryRows(route: string, slug: string): SummaryRow[] {
  const metrics = fetchSummaryMetricPoints(route, slug);

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

export function buildProductSummaryRows(route: string, slug: string) {
  const views = fetchPageViewsForScenario(route, slug);
  const events = fetchProductEventViewsForScenario(route, slug);

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
      const row: ProductSummaryRow = {
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
      return row;
    })
    .sort(
      (a, b) =>
        a.eventType.localeCompare(b.eventType) ||
        a.strategy.localeCompare(b.strategy) ||
        (a.experimentGroup ?? "").localeCompare(b.experimentGroup ?? "")
    );
}

export function buildProductFunnelRows(route: string, slug: string) {
  const views = fetchPageViewSessionsForScenario(route, slug);
  const events = fetchProductEventSessionsForScenario(route, slug);

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

        const row: ProductFunnelRow = {
          strategy,
          experimentGroup: experimentGroup || null,
          stageKey: stage.key,
          stageLabel: stage.label,
          sessionsReached: currentCount,
          fromEntryPct: fromEntry,
          fromPreviousPct: fromPrevious,
        };
        return row;
      });
    })
    .sort(
      (a, b) =>
        a.strategy.localeCompare(b.strategy) ||
        (a.experimentGroup ?? "").localeCompare(b.experimentGroup ?? "") ||
        (stageOrder.get(a.stageKey) ?? 0) - (stageOrder.get(b.stageKey) ?? 0)
    );
}

function getScenarioFunnelStages(slug: string): FunnelStage[] {
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
