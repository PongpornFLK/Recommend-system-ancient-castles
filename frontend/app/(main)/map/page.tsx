"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const MapCurrent = dynamic(() => import("@/app/components/map/mapCurrent"), {
  ssr: false,
});

export default function Map() {
  const [getNamePlace, setNamePlace] = useState("");

  return (
    <div className="bg-white p-5 place-items-center rounded-xl">
      <div className="flex flex-col my-5 gap-5 items-center">
        <div className="text-3xl font-bold">Map user current location</div>
        <div className="bg-tone-lightgray py-3 px-10 rounded-xl">{getNamePlace}</div>
      </div>
      <div className="w-full">
        <MapCurrent namePlace={setNamePlace} />
      </div>
    </div>
  );
}
