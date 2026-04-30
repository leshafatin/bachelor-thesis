export type PageKind = "static" | "dynamic" | "interactive";

export type CatalogItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  priceRub: number;
  oldPriceRub?: number;
  badge?: string;
  inStock: boolean;
};

export type PageData = {
  slug: string;
  kind: PageKind;
  title: string;
  body: string;
  ts: string;
  strategy?: string;
  experimentGoal: string;
  highlights: Array<{ label: string; value: string }>;
  facts?: string[];
  liveStats?: Array<{ label: string; value: string; delta?: string }>;
  catalogItems?: CatalogItem[];
  reportSeries?: Array<{
    title: string;
    unit: string;
    labels: string[];
    points: number[];
    tone: "blue" | "green" | "orange";
  }>;
  reportSegments?: Array<{
    label: string;
    availabilityPct: number;
    orders: number;
    eta: string;
  }>;
  reportAlerts?: Array<{
    title: string;
    severity: "high" | "medium";
    note: string;
  }>;
  reportChannelMix?: Array<{
    label: string;
    value: number;
    note: string;
    tone: "blue" | "green" | "orange";
  }>;
  reportHourlyLoad?: Array<{
    label: string;
    value: number;
  }>;
  reportWorkQueues?: Array<{
    label: string;
    backlog: string;
    owner: string;
    sla: string;
  }>;
};

export type ProductEventPayload = {
  eventType: string;
  eventTarget?: string;
  eventValue?: string;
};
