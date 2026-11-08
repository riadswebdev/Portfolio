"use client";

import dynamic from "next/dynamic";

const ConstructionEngine = dynamic(
  () => import("./ConstructionEngine"),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function ConstructionLoader() {
  return <ConstructionEngine />;
}

