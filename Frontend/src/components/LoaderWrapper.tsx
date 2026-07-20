"use client";

import dynamic from "next/dynamic";

const ConstructionLoader = dynamic(() => import("./ConstructionLoader"), { ssr: false });

export default function LoaderWrapper() {
  return <ConstructionLoader />;
}
