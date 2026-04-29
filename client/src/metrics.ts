import { onCLS, onINP, onLCP } from "web-vitals";
import { postMetric } from "./api";

export function initWebVitals(
  route: string,
  strategy: string,
  meta: {
    pageViewId?: string;
    slug: string;
    pageKind: string;
    sessionId?: string;
    experimentName?: string;
    experimentGroup?: string;
  }
) {
  const send = (name: string, value: number) => {
    postMetric({
      source: "client",
      pageViewId: meta.pageViewId,
      route,
      strategy,
      slug: meta.slug,
      pageKind: meta.pageKind,
      sessionId: meta.sessionId,
      experimentName: meta.experimentName,
      experimentGroup: meta.experimentGroup,
      name,
      value,
      ts: new Date().toISOString(),
    }).catch(() => {});
  };

  onLCP((m) => send("LCP", m.value));
  onCLS((m) => send("CLS", m.value));
  onINP((m) => send("INP", m.value));
}
