"use client";

import dynamic from "next/dynamic";

const MyMap = dynamic(() => import("@/app/components/map_current"), { ssr: false });

export default function Map() {
  return (
    <div>
        <MyMap />
    </div>
  )
}
