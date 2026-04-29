import type { RenderRuntimeContext } from "../StrategyManager.js";
import { injectClientScripts } from "./clientAssets.js";

export function renderCSR(opts: {
  strategy: string;
  routeKey: string;
  slug: string;
  runtime: RenderRuntimeContext;
}) {
  // CSR: пустой root + клиент всё дорисует
  const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Render Lab (CSR)</title>
</head>
<body>
  <div id="root"></div>
  ${injectClientMeta(opts.routeKey, opts.strategy, opts.slug, opts.runtime)}
  ${injectClientScripts()}
</body>
</html>`;
  return html;
}

function injectClientMeta(
  route: string,
  strategy: string,
  slug: string,
  runtime: RenderRuntimeContext
) {
  return `<script>window.__RENDER_LAB__=${JSON.stringify({
    route,
    strategy,
    slug,
    pageViewId: runtime.pageViewId,
    sessionId: runtime.sessionId,
    experimentName: runtime.experimentName,
    experimentGroup: runtime.experimentGroup,
  })}</script>`;
}
