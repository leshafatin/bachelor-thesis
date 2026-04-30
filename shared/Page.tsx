import React from "react";
import { DynamicReportPage } from "./page/DynamicReportPage";
import { InteractiveCatalogPage } from "./page/InteractiveCatalogPage";
import { StaticArticlePage } from "./page/StaticArticlePage";
import type { PageData, ProductEventPayload } from "./page/types";

export type { PageData, ProductEventPayload } from "./page/types";

const Page = ({
  data,
  onProductEvent,
}: {
  data: PageData;
  onProductEvent?: (event: ProductEventPayload) => void;
}) => {
  if (data.kind === "interactive" && data.catalogItems?.length) {
    return <InteractiveCatalogPage data={data} onProductEvent={onProductEvent} />;
  }

  if (data.kind === "dynamic" && data.liveStats?.length) {
    return <DynamicReportPage data={data} onProductEvent={onProductEvent} />;
  }

  return <StaticArticlePage data={data} onProductEvent={onProductEvent} />;
};

export default Page;
