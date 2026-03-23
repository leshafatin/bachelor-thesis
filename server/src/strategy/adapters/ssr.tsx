import React from "react";
import { renderToString } from "react-dom/server";

export type PageData = {
  slug: string;
  title: string;
  body: string;
  ts: string;
  strategy?: string;
};

export function renderSSR(opts: {
  data: PageData;
  strategy: string;
  routeKey: string;
}) {
  const Page = ({ data }: { data: PageData }) => (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 800 }}>
      <h1>{data.title}</h1>
      <p>
        <b>slug:</b> {data.slug}
      </p>
      <p>
        <b>generated:</b> {data.ts}
      </p>
      <p>
        <b>strategy:</b> {opts.strategy}
      </p>
      <hr />
      <p>{data.body}</p>
    </div>
  );

  const markup = renderToString(<Page data={opts.data} />);

  const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Render Lab (SSR)</title>
</head>
<body>
  <div id="root">${markup}</div>
  ${injectClientMeta(opts.routeKey, opts.strategy, opts.data)}
  ${injectDevScriptsOrProdBundle()}
</body>
</html>`;

  return html;
}

function injectClientMeta(route: string, strategy: string, initialData: any) {
  return `<script>window.__RENDER_LAB__=${JSON.stringify({
    route,
    strategy,
    initialData,
  })}</script>`;
}

function injectDevScriptsOrProdBundle() {
  if (process.env.NODE_ENV !== "production") {
    return `
<script type="module" src="http://localhost:5173/@vite/client"></script>

<script type="module">
  import RefreshRuntime from "http://localhost:5173/@react-refresh";
  RefreshRuntime.injectIntoGlobalHook(window);
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => (type) => type;
  window.__vite_plugin_react_preamble_installed__ = true;
</script>

<script type="module" src="http://localhost:5173/src/main.tsx"></script>`;
  }
  return `<script type="module" src="/assets/main.js"></script>`;
}
