import React from "react";
import type { PageData } from "../../../data/dataService.js";
import { DynamicReportPage } from "./DynamicReportPage.js";
import { InteractiveCatalogPage } from "./InteractiveCatalogPage.js";
import { StaticArticlePage } from "./StaticArticlePage.js";

export function Page({ data }: { data: PageData }) {
  const noop = () => {};

  if (data.kind === "interactive" && data.catalogItems?.length) {
    return <InteractiveCatalogPage data={data} noop={noop} />;
  }

  if (data.kind === "dynamic" && data.liveStats?.length) {
    return <DynamicReportPage data={data} noop={noop} />;
  }

  return <StaticArticlePage data={data} noop={noop} />;
}
