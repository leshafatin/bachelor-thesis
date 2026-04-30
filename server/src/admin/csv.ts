import { getPageData } from "../data/dataService.js";
import { fetchMetricExportRows } from "./repository.js";
import type { SummaryRow } from "./types.js";

export function buildMetricsCsv(slug: string) {
  const rows = fetchMetricExportRows(slug);

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
    .map((row) =>
      [
        row.id,
        row.source,
        row.route,
        row.slug,
        row.page_kind,
        row.session_id,
        row.experiment_name,
        row.experiment_group,
        row.strategy,
        row.name,
        row.value,
        row.ts,
      ]
        .map(csvValue)
        .join(",")
    )
    .join("\n");

  return header + body;
}

export function buildSummaryCsv(slug: string, summary: SummaryRow[]) {
  const pageData = getPageData(slug);
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
        .map(csvValue)
        .join(",")
    )
    .join("\n");

  return {
    filename: `${pageData.slug}-summary.csv`,
    body: header + body,
  };
}

function csvValue(value: unknown) {
  return `"${String(value).replaceAll('"', '""')}"`;
}
