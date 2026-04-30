import fs from "node:fs";
import path from "node:path";
import type { PageData } from "../../data/dataService.js";
import { getPageData, listPageScenarios } from "../../data/dataService.js";
import type { RenderRuntimeContext, Strategy } from "../StrategyManager.js";
import { renderSSR } from "./ssr.js";

const OUT_DIR = path.resolve(process.cwd(), "static/page");

export function tryReadSSG(slug: string): string | null {
  const p = path.join(OUT_DIR, `${slug}.html`);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : null;
}

export function personalizeSSGHtml(opts: {
  html: string;
  routeKey: string;
  strategy: Strategy;
  data: PageData;
  runtime: RenderRuntimeContext;
}) {
  const metaScript = buildClientMetaScript(
    opts.routeKey,
    opts.strategy,
    opts.data,
    opts.runtime
  );

  if (opts.html.includes("window.__RENDER_LAB__=")) {
    return opts.html.replace(
      /<script>window\.__RENDER_LAB__=.*?<\/script>/s,
      metaScript
    );
  }

  return opts.html.replace("</body>", `  ${metaScript}\n</body>`);
}

// Скрипт генерации: `npm run ssg` (в server)
async function main() {
  const entry = path.basename(process.argv[1] ?? "");
  if (entry.startsWith("ssg.")) {
    process.env.NODE_ENV = "production";
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const slugs = listPageScenarios().map((scenario) => scenario.slug);
    for (const slug of slugs) {
      const t0 = performance.now();
      const data = getPageData(slug);
      const html = renderSSR({
        data,
        strategy: "ssg",
        routeKey: "/page/:slug",
        runtime: {
          pageViewId: `build_view_${slug}`,
          sessionId: `build_${slug}`,
        },
      });
      fs.writeFileSync(path.join(OUT_DIR, `${slug}.html`), html, "utf-8");
      const ms = performance.now() - t0;
      console.log(`[SSG] ${slug} generated in ${ms.toFixed(1)}ms`);
    }
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

function buildClientMetaScript(
  route: string,
  strategy: Strategy,
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
