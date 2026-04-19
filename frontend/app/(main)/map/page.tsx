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
    <div className="bg-white p-3 md:p-5 place-items-center rounded-xl overflow-hidden shadow-sm">
      <div className="flex flex-col my-5 gap-5 items-center w-full">
        <div className="text-2xl md:text-3xl font-bold text-center leading-tight">Map user current location</div>
        <div className="w-full flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:basis-3/4 bg-white py-3 px-4 md:py-4 lg:px-8 rounded-2xl border border-gray-200 shadow-inner flex flex-col md:flex-row md:items-center gap-1 md:gap-3 overflow-hidden">
            <div className="text-gray-500 font-bold whitespace-nowrap text-sm md:text-base">ตำแหน่งปัจจุบัน : </div>
            <div className="truncate text-xs md:text-base">{getNamePlace || "กำลังระบุตำแหน่ง..."}</div>
          </div>
          <div className="w-full lg:basis-1/4 p-4 rounded-2xl border border-gray-200">
            <Slider
              label="รัศมีการค้นหา (กม.)"
              color="primary"
              size="md"
              step={1}
              maxValue={3}
              minValue={0}
              hideValue={true}
              classNames={{
                label: "text-xs md:text-sm font-medium",
              }}
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
      <div className="w-full mt-2">
        <MapCurrent namePlace={setNamePlace} radius={radius} />
      </div>
    </div>
  );
}
