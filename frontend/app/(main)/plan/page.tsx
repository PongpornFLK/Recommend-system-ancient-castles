"use client";

import FromPlan from "@/app/components/plan/formplan";
import Routeplan from "@/app/components/plan/routeplan";
import Routesum from "@/app/components/plan/routesum";
import useLocation from "@/app/service/map/useLocation";
import useCreateroute from "@/app/service/plan/useCreateroute";
import { Chip } from "@heroui/react";
import { Calendar, Navigation2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Plan() {
  const [boxSelect, setBoxSelect] = useState([
    { id: 1, placeId: "", placeName: "", latitude: 0, longitude: 0 },
  ]);
  const { getNamePlace, loading, getGPS } = useLocation();
  const { locationCastle } = useCreateroute();
  const [date, setDate] = useState("");
  const [planName , setPlanName] = useState("");

  useEffect(() => {
    const fetchTime = () => {
      const now = new Date().toLocaleString("th-TH");
      setDate(now);
    };
    fetchTime();
  }, []);

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
              <div className="text-sm sm:text-base">{date}</div>
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
              <div className="text-sm sm:text-base">
                {locationCastle?.castle_name}
              </div>
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
          planName={planName}
          setPlanName={setPlanName}
        />

        {/* Right - Container */}
        <Routesum
          boxSelect={boxSelect}
          currentPlace={getNamePlace}
          getGPS={getGPS}
          planName={planName}
        />
      </div>
    </section>
  );
}
