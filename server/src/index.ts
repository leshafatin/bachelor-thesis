import express from "express";
import path from "node:path";
import {
  insertMetric,
  insertPageView,
  insertProductEvent,
} from "./metrics/repo.js";
import "./metrics/db.js";
import { handlePageRequest } from "./strategy/StrategyManager.js";
import { getPageData } from "./data/dataService.js";
import { mountAdmin } from "./admin/routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PROD ассеты клиента (упрощённо)
app.use(
  "/assets",
  express.static(path.resolve(process.cwd(), "../client/dist/assets"))
);
app.use("/static", express.static(path.resolve(process.cwd(), "static")));

mountAdmin(app);

// API данные (единый источник)
app.get("/api/page/:slug", (req, res) => {
  res.json(getPageData(req.params.slug));
});

// Метрики от клиента + серверные
app.post("/api/metrics", (req, res) => {
  const {
    source,
    pageViewId,
    route,
    strategy,
    slug,
    pageKind,
    sessionId,
    experimentName,
    experimentGroup,
    name,
    value,
    ts,
  } = req.body ?? {};
  if (
    !source ||
    !route ||
    !strategy ||
    !name ||
    typeof value !== "number" ||
    !ts
  ) {
    return res.status(400).json({ ok: false });
  }
  insertMetric({
    source,
    pageViewId,
    route,
    strategy,
    slug,
    pageKind,
    sessionId,
    experimentName,
    experimentGroup,
    name,
    value,
    ts,
  });
  res.json({ ok: true });
});

app.post("/api/events", (req, res) => {
  const {
    pageViewId,
    route,
    strategy,
    slug,
    pageKind,
    sessionId,
    experimentName,
    experimentGroup,
    eventType,
    eventTarget,
    eventValue,
    createdAt,
  } = req.body ?? {};

  if (!route || !strategy || !eventType || !createdAt) {
    return res.status(400).json({ ok: false });
  }

  insertProductEvent({
    pageViewId,
    route,
    strategy,
    slug,
    pageKind,
    sessionId,
    experimentName,
    experimentGroup,
    eventType,
    eventTarget,
    eventValue,
    createdAt,
  });

  console.log(
    [
      "[render-lab:event]",
      `type=${eventType}`,
      `target=${eventTarget ?? "-"}`,
      `value=${eventValue ?? "-"}`,
      `strategy=${strategy}`,
      `pageViewId=${pageViewId ?? "-"}`,
      `sessionId=${sessionId ?? "-"}`,
      `group=${experimentGroup ?? "none"}`,
    ].join(" ")
  );

  res.json({ ok: true });
});

app.get("/page/:slug", (req, res) => {
  const routeKey = "/page/:slug";
  const pageData = getPageData(req.params.slug);
  const t0 = performance.now();

  const { strategy, html, serverRenderMs, runtime, setCookies } =
    handlePageRequest({
    routeKey,
    slug: req.params.slug,
    cookieHeader: req.headers.cookie,
  });

  if (setCookies.length) {
    res.setHeader("Set-Cookie", setCookies);
  }

  const ttfbMs = performance.now() - t0;
  const userAgent = req.get("user-agent") ?? "unknown";

  console.log(
    [
      "[render-lab]",
      `ip=${req.ip}`,
      `slug=${pageData.slug}`,
      `strategy=${strategy}`,
      `pageViewId=${runtime.pageViewId}`,
      `sessionId=${runtime.sessionId}`,
      `experiment=${runtime.experimentName ?? "none"}`,
      `group=${runtime.experimentGroup ?? "none"}`,
      `ua=${JSON.stringify(userAgent)}`,
    ].join(" ")
  );

  insertPageView({
    pageViewId: runtime.pageViewId,
    route: routeKey,
    slug: pageData.slug,
    pageKind: pageData.kind,
    strategy,
    sessionId: runtime.sessionId,
    experimentName: runtime.experimentName,
    experimentGroup: runtime.experimentGroup,
    openedAt: new Date().toISOString(),
    responseStatus: 200,
    navigationType: "direct",
  });

  insertMetric({
    source: "server",
    pageViewId: runtime.pageViewId,
    route: routeKey,
    strategy,
    slug: pageData.slug,
    pageKind: pageData.kind,
    sessionId: runtime.sessionId,
    experimentName: runtime.experimentName,
    experimentGroup: runtime.experimentGroup,
    name: "TTFB",
    value: ttfbMs,
    ts: new Date().toISOString(),
  });

  insertMetric({
    source: "server",
    pageViewId: runtime.pageViewId,
    route: routeKey,
    strategy,
    slug: pageData.slug,
    pageKind: pageData.kind,
    sessionId: runtime.sessionId,
    experimentName: runtime.experimentName,
    experimentGroup: runtime.experimentGroup,
    name: "serverRenderMs",
    value: serverRenderMs,
    ts: new Date().toISOString(),
  });

  res.type("html").send(html);
});

app.get("/", (_req, res) => res.redirect("/admin"));

app.listen(3000, () => {
  console.log("Server: http://localhost:3000");
  console.log("Vite dev: http://localhost:5173");
});
