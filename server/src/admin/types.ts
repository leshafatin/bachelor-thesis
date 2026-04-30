export type SummaryRow = {
  strategy: string;
  experimentGroup: string | null;
  name: string;
  n: number;
  avg: number;
  median: number;
  p95: number;
  min: number;
  max: number;
};

export type ProductSummaryRow = {
  strategy: string;
  experimentGroup: string | null;
  eventType: string;
  totalEvents: number;
  uniqueViews: number;
  uniqueSessions: number;
  conversionRatePct: number;
};

export type ProductFunnelRow = {
  strategy: string;
  experimentGroup: string | null;
  stageKey: string;
  stageLabel: string;
  sessionsReached: number;
  fromEntryPct: number;
  fromPreviousPct: number;
};

export type FunnelStage = {
  key: string;
  label: string;
  previousKey: string | null;
};
