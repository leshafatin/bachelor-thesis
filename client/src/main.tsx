import React from "react";
import ReactDOM from "react-dom/client";
import type { PageData } from "../../shared/Page";
import Page from "../../shared/Page";
import { fetchPageData, postProductEvent } from "./api";
import { initWebVitals } from "./metrics";

declare global {
  interface Window {
    __RENDER_LAB__?: {
      route: string;
      strategy: string;
      slug?: string;
      pageViewId?: string;
      sessionId?: string;
      experimentName?: string;
      experimentGroup?: string;
      initialData?: PageData;
    };
  }
}

async function bootstrap() {
  const slug = location.pathname.startsWith("/page/")
    ? decodeURIComponent(location.pathname.slice("/page/".length))
    : "hello";

  const meta = window.__RENDER_LAB__ ?? {
    route: "/page/:slug",
    strategy: "csr",
    slug,
    pageViewId: undefined,
    sessionId: undefined,
    experimentName: undefined,
    experimentGroup: undefined,
  };
  const initial = meta.initialData;

  const data: PageData = initial ?? (await fetchPageData(slug));
  data.strategy = meta.strategy;

  console.info("[render-lab] runtime config", {
    route: meta.route,
    slug: data.slug,
    strategy: meta.strategy,
    pageViewId: meta.pageViewId,
    sessionId: meta.sessionId,
    experimentName: meta.experimentName,
    experimentGroup: meta.experimentGroup,
  });

  const rootEl = document.getElementById("root")!;
  const app = (
    <Page
      data={data}
      onProductEvent={(event) =>
        postProductEvent({
          pageViewId: meta.pageViewId,
          route: meta.route,
          strategy: meta.strategy,
          slug: data.slug,
          pageKind: data.kind,
          sessionId: meta.sessionId,
          experimentName: meta.experimentName,
          experimentGroup: meta.experimentGroup,
          eventType: event.eventType,
          eventTarget: event.eventTarget,
          eventValue: event.eventValue,
          createdAt: new Date().toISOString(),
        }).catch(() => {})
      }
    />
  );

  if (initial && rootEl.hasChildNodes()) {
    ReactDOM.hydrateRoot(rootEl, app);
  } else {
    ReactDOM.createRoot(rootEl).render(app);
  }

  initWebVitals(meta.route, meta.strategy, {
    pageViewId: meta.pageViewId,
    slug: data.slug,
    pageKind: data.kind,
    sessionId: meta.sessionId,
    experimentName: meta.experimentName,
    experimentGroup: meta.experimentGroup,
  });
}

bootstrap();
