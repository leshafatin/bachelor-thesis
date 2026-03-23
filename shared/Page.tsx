import React from "react";

export type PageData = {
  slug: string;
  title: string;
  body: string;
  ts: string;
  strategy?: string;
};

const Page = ({ data }: { data: PageData }) => {
  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 800 }}>
      <h1>{data.title}</h1>
      <p>
        <b>slug:</b> {data.slug}
      </p>
      <p>
        <b>generated:</b> {data.ts}
      </p>
      {data.strategy ? (
        <p>
          <b>strategy:</b> {data.strategy}
        </p>
      ) : null}
      <hr />
      <p>{data.body}</p>
    </div>
  );
};

export default Page;
