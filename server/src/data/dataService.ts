export function getPageData(slug: string) {
  return {
    slug,
    title: `Demo page: ${slug}`,
    body: "Контент страницы одинаковый для CSR/SSR/SSG, чтобы сравнение было корректным.",
    ts: new Date().toISOString(),
  };
}
