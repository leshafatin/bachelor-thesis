export async function fetchPageData(slug: string) {
  const res = await fetch(`/api/page/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(`Failed to load data: ${res.status}`);
  return res.json();
}

export async function postMetric(payload: any) {
  await fetch("/api/metrics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function postProductEvent(payload: any) {
  await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
