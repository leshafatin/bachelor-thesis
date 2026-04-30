import React from "react";
import { renderToString } from "react-dom/server";
import type { PageData } from "../../data/dataService.js";
import type { RenderRuntimeContext } from "../StrategyManager.js";
import { injectClientScripts } from "./clientAssets.js";
import { Page } from "./ssr-page/Page.js";

export function renderSSR(opts: {
  data: PageData;
  strategy: string;
  routeKey: string;
  runtime: RenderRuntimeContext;
}) {
  const markup = renderToString(<Page data={{ ...opts.data, strategy: opts.strategy }} />);

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Render Lab (SSR)</title>
</head>
<body>
  <div id="root">${markup}</div>
  ${injectClientMeta(opts.routeKey, opts.strategy, opts.data, opts.runtime)}
  ${injectClientScripts()}
</body>
</html>`;
}

function injectClientMeta(
  route: string,
  strategy: string,
  initialData: PageData,
  runtime: RenderRuntimeContext
) {
  return `<script>window.__RENDER_LAB__=${JSON.stringify({
    route,
    strategy,
    initialData,
    pageViewId: runtime.pageViewId,
    sessionId: runtime.sessionId,
    experimentName: runtime.experimentName,
    experimentGroup: runtime.experimentGroup,
  })}</script>`;
}
