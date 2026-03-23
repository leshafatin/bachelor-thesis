import express from "express";
import path from "node:path";
import { insertMetric } from "./metrics/repo.js";
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
  const { source, route, strategy, name, value, ts } = req.body ?? {};
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
  insertMetric({ source, route, strategy, name, value, ts });
  res.json({ ok: true });
});

app.get("/page/:slug", (req, res) => {
  const routeKey = "/page/:slug";
  const t0 = performance.now();

  const { strategy, html, serverRenderMs } = handlePageRequest({
    routeKey,
    slug: req.params.slug,
  });

  const ttfbMs = performance.now() - t0;

  insertMetric({
    source: "server",
    route: routeKey,
    strategy,
    name: "TTFB",
    value: ttfbMs,
    ts: new Date().toISOString(),
  });

  insertMetric({
    source: "server",
    route: routeKey,
    strategy,
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
