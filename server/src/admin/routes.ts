import type { Router } from "express";
import {
  clearMetrics,
  getStrategy,
  latestMetrics,
  latestProductEvents,
  setStrategy,
  clearProductEvents,
} from "../metrics/repo.js";
import { getPageData } from "../data/dataService.js";
import { findExperimentForRoute } from "../experiments/config.js";
import {
  buildProductFunnelRows,
  buildProductSummaryRows,
  buildSummaryRows,
} from "./analytics.js";
import { buildMetricsCsv, buildSummaryCsv } from "./csv.js";
import { renderAdminPage } from "./render.js";

export function mountAdmin(router: Router) {
  router.get("/admin", (req, res) => {
    const routeKey = "/page/:slug";
    const cur = getStrategy(routeKey);
    const selectedSlug = String(req.query.slug ?? "hello");
    const pageData = getPageData(selectedSlug);
    const experiment = findExperimentForRoute(routeKey, pageData.slug);
    res.type("html").send(
      renderAdminPage({
        routeKey,
        currentStrategy: cur,
        selectedSlug: pageData.slug,
        experiment,
        latestProductEvents: latestProductEvents(12, pageData.slug),
        latestMetrics: latestMetrics(15, pageData.slug),
      })
    );
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
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${slug || "metrics"}.csv`
    );
    res.send(buildMetricsCsv(slug));
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
    const summary = buildSummaryRows(route, getPageData(slug).slug);
    const csv = buildSummaryCsv(slug, summary);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=${csv.filename}`);
    res.send(csv.body);
  });
}
