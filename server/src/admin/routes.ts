import type { Router } from "express";
import { setStrategy, getStrategy, latestMetrics } from "../metrics/repo.js";
import { db } from "../metrics/db.js";
import fs from "node:fs";
import path from "node:path";

export function mountAdmin(router: Router) {
  router.get("/admin", (req, res) => {
    const routeKey = "/page/:slug";
    const cur = getStrategy(routeKey);

    const rowsHtml = latestMetrics(12)
      .map(
        (m: any) =>
          `<tr><td>${m.id}</td><td>${m.source}</td><td>${m.strategy}</td><td>${m.name}</td><td>${m.value}</td><td>${m.ts}</td></tr>`
      )
      .join("");

    const optionsHtml = ["csr", "ssr", "ssg"]
      .map(
        (s) =>
          `<option value="${s}" ${s === cur ? "selected" : ""}>${s}</option>`
      )
      .join("");

    const tplPath = path.resolve(process.cwd(), "src/admin/admin.html");
    let html = fs.readFileSync(tplPath, "utf-8");

    html = html
      .replaceAll("{{routeKey}}", routeKey)
      .replaceAll("{{cur}}", cur)
      .replaceAll("{{options}}", optionsHtml)
      .replaceAll("{{rows}}", rowsHtml);

    res.type("html").send(html);
  });

  router.post("/admin/strategy", (req, res) => {
    const route = String(req.body.route ?? "");
    const strategy = String(req.body.strategy ?? "") as any;
    if (!route || !["csr", "ssr", "ssg"].includes(strategy)) {
      return res.status(400).send("bad input");
    }
    setStrategy(route, strategy);
    res.redirect("/admin");
  });

  router.get("/admin/export.csv", (req, res) => {
    const rows = db
      .prepare("SELECT * FROM metrics ORDER BY id ASC")
      .all() as any[];

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=metrics.csv");

    const header =
      ["id", "source", "route", "strategy", "name", "value", "ts"].join(",") +
      "\n";
    const body = rows
      .map((r) =>
        [r.id, r.source, r.route, r.strategy, r.name, r.value, r.ts]
          .map((v) => `"${String(v).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    res.send(header + body);
  });

  router.get("/admin/summary.json", (req, res) => {
    const route = String(req.query.route ?? "/page/:slug");

    // усреднения: достаточно для первых графиков
    const rows = db
      .prepare(
        `
    SELECT strategy, name, COUNT(*) as n, AVG(value) as avg
    FROM metrics
    WHERE route = ?
      AND name IN ('LCP','INP','CLS','TTFB','serverRenderMs')
    GROUP BY strategy, name
    ORDER BY name, strategy
  `
      )
      .all(route) as Array<{
      strategy: string;
      name: string;
      n: number;
      avg: number;
    }>;

    res.json({ route, rows });
  });
}
