import { getStrategy } from "../metrics/repo.js";
import { getPageData } from "../data/dataService.js";
import { resolveRuntimeAssignment } from "../experiments/runtime.js";
import { renderCSR } from "./adapters/csr.js";
import { renderSSR } from "./adapters/ssr.js";
import { tryReadSSG } from "./adapters/ssg.js";
import crypto from "node:crypto";

export type Strategy = "csr" | "ssr" | "ssg";
export type RenderRuntimeContext = {
  pageViewId: string;
  sessionId: string;
  experimentName?: string;
  experimentGroup?: string;
};

export function handlePageRequest(opts: {
  routeKey: string;
  slug: string;
  cookieHeader?: string;
}): {
  strategy: Strategy;
  html: string;
  serverRenderMs: number;
  runtime: RenderRuntimeContext;
  setCookies: string[];
} {
  const baseStrategy = getStrategy(opts.routeKey);
  const assignment = resolveRuntimeAssignment({
    routeKey: opts.routeKey,
    slug: opts.slug,
    defaultStrategy: baseStrategy,
    cookieHeader: opts.cookieHeader,
  });
  const strategy = assignment.strategy;
  const runtime = {
    pageViewId: `pv_${crypto.randomBytes(8).toString("hex")}`,
    sessionId: assignment.sessionId,
    experimentName: assignment.experimentName,
    experimentGroup: assignment.experimentGroup,
  };
  const t0 = performance.now();

  if (strategy === "ssg") {
    const hit = tryReadSSG(opts.slug);
    if (hit)
      return {
        strategy,
        html: hit,
        serverRenderMs: performance.now() - t0,
        runtime,
        setCookies: assignment.setCookies,
      };

    // fallback: если не сгенерено — отрендерим SSR (MVP)
    const data = getPageData(opts.slug);
    const html = renderSSR({
      data,
      strategy,
      routeKey: opts.routeKey,
      runtime,
    });
    return {
      strategy,
      html,
      serverRenderMs: performance.now() - t0,
      runtime,
      setCookies: assignment.setCookies,
    };
  }

  if (strategy === "ssr") {
    const data = getPageData(opts.slug);
    const html = renderSSR({
      data,
      strategy,
      routeKey: opts.routeKey,
      runtime,
    });
    return {
      strategy,
      html,
      serverRenderMs: performance.now() - t0,
      runtime,
      setCookies: assignment.setCookies,
    };
  }

  const html = renderCSR({
    strategy,
    routeKey: opts.routeKey,
    slug: opts.slug,
    runtime,
  });
  return {
    strategy,
    html,
    serverRenderMs: performance.now() - t0,
    runtime,
    setCookies: assignment.setCookies,
  };
}
