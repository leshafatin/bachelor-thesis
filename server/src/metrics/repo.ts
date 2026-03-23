import { db } from "./db.js";

export function getStrategy(route: string): "csr" | "ssr" | "ssg" {
  const row = db
    .prepare("SELECT strategy FROM route_strategies WHERE route=?")
    .get(route) as any;
  return (row?.strategy ?? "csr") as any;
}

export function setStrategy(route: string, strategy: "csr" | "ssr" | "ssg") {
  db.prepare(
    "INSERT INTO route_strategies(route, strategy) VALUES (?, ?) ON CONFLICT(route) DO UPDATE SET strategy=excluded.strategy"
  ).run(route, strategy);
}

export function insertMetric(m: {
  source: "server" | "client";
  route: string;
  strategy: string;
  name: string;
  value: number;
  ts: string;
}) {
  db.prepare(
    "INSERT INTO metrics(source, route, strategy, name, value, ts) VALUES (@source, @route, @strategy, @name, @value, @ts)"
  ).run(m);
}

export function latestMetrics(limit = 20) {
  return db
    .prepare("SELECT * FROM metrics ORDER BY id DESC LIMIT ?")
    .all(limit);
}
