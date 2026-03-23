import fs from "node:fs";
import path from "node:path";
import { getPageData } from "../../data/dataService.js";
import { renderSSR } from "./ssr.js";

const OUT_DIR = path.resolve(process.cwd(), "static/page");

export function tryReadSSG(slug: string): string | null {
  const p = path.join(OUT_DIR, `${slug}.html`);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : null;
}

// Скрипт генерации: `npm run ssg` (в server)
async function main() {
  if (process.argv[1]?.includes("ssg.ts")) {
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const slugs = ["hello", "about", "catalog"];
    for (const slug of slugs) {
      const t0 = performance.now();
      const data = getPageData(slug);
      const html = renderSSR({
        data,
        strategy: "ssg",
        routeKey: "/page/:slug",
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
