"use client";

import dynamic from "next/dynamic";

const MyMap = dynamic(() => import("@/app/components/mymap"), { ssr: false });

export default function Map() {
  return (
    <div>
        <MyMap />
    </div>
  )
}
