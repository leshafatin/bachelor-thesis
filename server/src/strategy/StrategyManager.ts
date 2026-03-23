import { getStrategy } from "../metrics/repo.js";
import { getPageData } from "../data/dataService.js";
import { renderCSR } from "./adapters/csr.js";
import { renderSSR } from "./adapters/ssr.js";
import { tryReadSSG } from "./adapters/ssg.js";

export type Strategy = "csr" | "ssr" | "ssg";

export function handlePageRequest(opts: { routeKey: string; slug: string }): {
  strategy: Strategy;
  html: string;
  serverRenderMs: number;
} {
  const strategy = getStrategy(opts.routeKey);
  const t0 = performance.now();

  if (strategy === "ssg") {
    const hit = tryReadSSG(opts.slug);
    if (hit)
      return { strategy, html: hit, serverRenderMs: performance.now() - t0 };

    // fallback: если не сгенерено — отрендерим SSR (MVP)
    const data = getPageData(opts.slug);
    const html = renderSSR({ data, strategy, routeKey: opts.routeKey });
    return { strategy, html, serverRenderMs: performance.now() - t0 };
  }

  if (strategy === "ssr") {
    const data = getPageData(opts.slug);
    const html = renderSSR({ data, strategy, routeKey: opts.routeKey });
    return { strategy, html, serverRenderMs: performance.now() - t0 };
  }

  const html = renderCSR({ strategy, routeKey: opts.routeKey });
  return { strategy, html, serverRenderMs: performance.now() - t0 };
}
