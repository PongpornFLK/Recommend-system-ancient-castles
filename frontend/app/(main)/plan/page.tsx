"use client";

import Routeplan from "@/app/components/plan/routeplan";
import Routesum from "@/app/components/plan/routesum";
import useLocation from "@/app/service/map/useLocation";
import { Chip } from "@heroui/react";
import { Calendar, Navigation2 } from "lucide-react";
import { useState } from "react";

export default function Plan() {
  const [boxSelect, setBoxSelect] = useState([
    { id: 1, placeId: "", placeName: "" , latitude : 0 , longitude : 0},
  ]);
  const { getNamePlace, loading , getGPS} = useLocation();

  return (
    <section>
      <div className="bg-white rounded-2xl mt-5 p-6 shadow-none">
        {/* Top - Container */}
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl md:text-3xl font-bold">My Plan</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Chip
                variant="bordered"
                color="warning"
                startContent={<Calendar size={14} />}
                size="md"
              >
                Start Date
              </Chip>
              <div className="text-sm sm:text-base">12/12/2024 08:00</div>
            </div>

            <div className="flex items-center gap-2">
              <Chip
                variant="bordered"
                color="warning"
                startContent={<Navigation2 size={14} />}
                size="md"
              >
                Destination
              </Chip>
              <div className="text-sm sm:text-base">วัดพระธาตุดอยสุเทพ</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 lg:items-start">
        {/* Left - Container */}
        <Routeplan
          boxSelect={boxSelect}
          setBoxSelect={setBoxSelect}
          currentPlace={getNamePlace}
          isLoading={loading}
        />

        {/* Right - Container */}
        <Routesum boxSelect={boxSelect} currentPlace={getNamePlace} getGPS={getGPS}/>
      </div>
    </section>
  );
}
