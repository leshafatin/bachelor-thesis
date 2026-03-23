export function renderCSR(opts: { strategy: string; routeKey: string }) {
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
  ${injectClientMeta(opts.routeKey, opts.strategy)}
  ${injectDevScriptsOrProdBundle()}
</body>
</html>`;
  return html;
}

function injectClientMeta(route: string, strategy: string) {
  return `<script>window.__RENDER_LAB__=${JSON.stringify({
    route,
    strategy,
  })}</script>`;
}

function injectDevScriptsOrProdBundle() {
  // DEV: берём Vite dev server
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

  // PROD: берём билд клиента (упрощённо — main из dist/assets по манифесту лучше, но для MVP ок)
  return `<script type="module" src="/assets/main.js"></script>`;
}
