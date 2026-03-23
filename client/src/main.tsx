import React from "react";
import ReactDOM from "react-dom/client";
import type { PageData } from "../../shared/Page";
import Page from "../../shared/Page";
import { fetchPageData } from "./api";
import { initWebVitals } from "./metrics";

declare global {
  interface Window {
    __RENDER_LAB__?: {
      route: string;
      strategy: string;
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
  };
  const initial = meta.initialData;

  const data: PageData = initial ?? (await fetchPageData(slug));
  data.strategy = meta.strategy;

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <Page data={data} />
  );
  initWebVitals(meta.route, meta.strategy);
}

bootstrap();
