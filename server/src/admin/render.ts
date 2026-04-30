import fs from "node:fs";
import path from "node:path";
import type { RouteExperimentRule } from "../experiments/config.js";
import { getPageData, listPageScenarios } from "../data/dataService.js";

export function renderAdminPage(input: {
  routeKey: string;
  currentStrategy: string;
  selectedSlug: string;
  experiment?: RouteExperimentRule;
  latestProductEvents: any[];
  latestMetrics: any[];
}) {
  const pageData = getPageData(input.selectedSlug);
  const productRowsHtml = input.latestProductEvents
    .map(
      (event: any) =>
        `<tr><td>${event.event_id}</td><td>${event.strategy}</td><td>${event.experiment_group ?? "-"}</td><td>${event.event_type}</td><td>${event.event_target ?? "-"}</td><td>${event.event_value ?? "-"}</td><td>${event.created_at}</td></tr>`
    )
    .join("");

  const rowsHtml = input.latestMetrics
    .map(
      (metric: any) =>
        `<tr><td>${metric.id}</td><td>${metric.slug ?? "-"}</td><td>${metric.page_kind ?? "-"}</td><td>${metric.source}</td><td>${metric.strategy}</td><td>${metric.experiment_group ?? "-"}</td><td>${metric.name}</td><td>${Number(
          metric.value
        ).toFixed(2)}</td><td>${metric.ts}</td></tr>`
    )
    .join("");

  const optionsHtml = ["csr", "ssr", "ssg"]
    .map(
      (strategy) =>
        `<option value="${strategy}" ${strategy === input.currentStrategy ? "selected" : ""}>${strategy}</option>`
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
    .replaceAll("{{routeKey}}", input.routeKey)
    .replaceAll("{{cur}}", input.currentStrategy)
    .replaceAll("{{selectedSlug}}", pageData.slug)
    .replaceAll("{{selectedKind}}", pageData.kind)
    .replaceAll("{{selectedTitle}}", pageData.title)
    .replaceAll("{{selectedGoal}}", pageData.experimentGoal)
    .replaceAll("{{experimentState}}", buildExperimentState(input.experiment))
    .replaceAll("{{scenarioCards}}", scenariosHtml)
    .replaceAll("{{options}}", optionsHtml)
    .replaceAll("{{productRows}}", productRowsHtml)
    .replaceAll("{{rows}}", rowsHtml);

  return html;
}

function buildExperimentState(experiment?: RouteExperimentRule) {
  if (!experiment) {
    return "Для этого сценария активного A/B-эксперимента пока нет. Используется базовая стратегия маршрута.";
  }

  return `Активен эксперимент <code>${experiment.name}</code>. Для этого сценария стратегия назначается по группе пользователя: ${experiment.groups
    .map((group) => `${group.name} -> ${group.strategy}`)
    .join(", ")}`;
}
