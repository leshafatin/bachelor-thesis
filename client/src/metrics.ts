import { onCLS, onINP, onLCP } from "web-vitals";
import { postMetric } from "./api";

export function initWebVitals(route: string, strategy: string) {
  const send = (name: string, value: number) => {
    postMetric({
      source: "client",
      route,
      strategy,
      name,
      value,
      ts: new Date().toISOString(),
    }).catch(() => {});
  };

  onLCP((m) => send("LCP", m.value));
  onCLS((m) => send("CLS", m.value));
  onINP((m) => send("INP", m.value));
}
