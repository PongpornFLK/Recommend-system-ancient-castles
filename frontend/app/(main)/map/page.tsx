"use client";

import { Slider } from "@heroui/react";
import dynamic from "next/dynamic";
import { useState } from "react";

const MapCurrent = dynamic(() => import("@/app/components/map/mapCurrent"), {
  ssr: false,
});

export default function Map() {
  const [getNamePlace, setNamePlace] = useState("");
  const [radius, setRadius] = useState(10);

  const radiusValues = [10, 25, 50, 100];

  return (
    <div className="bg-white p-5 place-items-center rounded-xl">
      <div className="flex flex-col my-5 gap-5 items-center w-full">
        <div className="text-3xl font-bold">Map user current location</div>
        <div className="w-full flex flex-row gap-4">
          <div className="basis-3/4 bg-white py-4 px-8 rounded-2xl border border-gray-200 shadow-inner flex items-center gap-3">
            <div className="text-gray-500 font-bold">ตำแหน่งปัจจุบัน : </div>
            <div className="truncate">{getNamePlace}</div>
          </div>
          <div className="basis-1/4 p-4 rounded-2xl border border-gray-200">
            <Slider
              label="รัศมีการค้นหา (กม.)"
              color="primary"
              size="md"
              step={1}
              maxValue={3}
              minValue={0}
              hideValue={true}
              marks={[
                { value: 0, label: "10", },
                { value: 1, label: "25" },
                { value: 2, label: "50" },
                { value: 3, label: "100" },
              ]}
              value={radiusValues.indexOf(radius)}
              onChange={(v) => setRadius(radiusValues[v as number])}
            />
          </div>
        </div>
      </div>
      <div className="w-full">
        <MapCurrent key={radius} namePlace={setNamePlace} radius={radius} />
      </div>
    </div>
  );
}
