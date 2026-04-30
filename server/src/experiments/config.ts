import type { Strategy } from "../strategy/StrategyManager.js";

export type ExperimentGroupRule = {
  name: string;
  strategy: Strategy;
  weight: number;
};

export type RouteExperimentRule = {
  name: string;
  status: "active" | "paused";
  routeKey: string;
  slug?: string;
  description: string;
  groups: ExperimentGroupRule[];
};

const routeExperiments: RouteExperimentRule[] = [
  // {
  //   name: "hello-rendering-ab",
  //   status: "active",
  //   routeKey: "/page/:slug",
  //   slug: "hello",
  //   description:
  //     "Сравнение стратегий рендеринга на контентной странице с proxy-метриками вовлечения.",
  //   groups: [
  //     { name: "group_csr", strategy: "csr", weight: 1 },
  //     { name: "group_ssr", strategy: "ssr", weight: 1 },
  //     { name: "group_ssg", strategy: "ssg", weight: 1 },
  //   ],
  // },
  // {
  //   name: "report-rendering-ab",
  //   status: "active",
  //   routeKey: "/page/:slug",
  //   slug: "report",
  //   description:
  //     "Сравнение стратегий рендеринга на динамической странице с часто обновляемыми данными.",
  //   groups: [
  //     { name: "group_csr", strategy: "csr", weight: 1 },
  //     { name: "group_ssr", strategy: "ssr", weight: 1 },
  //     { name: "group_ssg", strategy: "ssg", weight: 1 },
  //   ],
  // },
  // {
  //   name: "catalog-rendering-ab",
  //   status: "active",
  //   routeKey: "/page/:slug",
  //   slug: "catalog",
  //   description:
  //     "Сравнение стратегий рендеринга на storefront-сценарии с продуктовой воронкой.",
  //   groups: [
  //     { name: "group_csr", strategy: "csr", weight: 1 },
  //     { name: "group_ssr", strategy: "ssr", weight: 1 },
  //     { name: "group_ssg", strategy: "ssg", weight: 1 },
  //   ],
  // },
];

export function listExperiments() {
  return routeExperiments;
}

export function findExperimentForRoute(routeKey: string, slug: string) {
  return routeExperiments.find(
    (item) =>
      item.status === "active" &&
      item.routeKey === routeKey &&
      (!item.slug || item.slug === slug)
  );
}
