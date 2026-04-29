import fs from "node:fs";
import path from "node:path";

type ViteManifest = Record<
  string,
  {
    file: string;
    isEntry?: boolean;
  }
>;

export function injectClientScripts() {
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

  return `<script type="module" src="${resolveClientEntryScript()}"></script>`;
}

function resolveClientEntryScript() {
  try {
    const manifestPath = path.resolve(
      process.cwd(),
      "../client/dist/.vite/manifest.json"
    );
    const manifest = JSON.parse(
      fs.readFileSync(manifestPath, "utf-8")
    ) as ViteManifest;

    const entry =
      manifest["index.html"] ??
      manifest["src/main.tsx"] ??
      Object.values(manifest).find((item) => item.isEntry);

    if (entry?.file) {
      return `/${entry.file}`;
    }
  } catch {
    // Fallback below keeps the demo bootable even if manifest is absent.
  }

  return "/assets/main.js";
}
