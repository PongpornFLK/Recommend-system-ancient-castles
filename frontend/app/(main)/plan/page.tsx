"use client";

import dynamic from "next/dynamic";
import Routeplan from "@/app/components/plan/routeplan";
import Routesum from "@/app/components/plan/routesum";
import useLocation from "@/app/service/map/useLocation";
import { useState, Suspense } from "react";
import { now, getLocalTimeZone, ZonedDateTime } from "@internationalized/date";

export default function Plan() {
  const [boxSelect, setBoxSelect] = useState([
    { id: 1, placeId: "", placeName: "", latitude: 0, longitude: 0 },
  ]);
  const { getNamePlace, loading, getGPS } = useLocation();
  const [date, setDate] = useState<ZonedDateTime | null>(
    now(getLocalTimeZone()),
  );
  const [planName, setPlanName] = useState("");
  const [eventId, setEventId] = useState<number | null>(null);
  const [eventDescript, setEventDescript] = useState<string>("");

  const DatePicker = dynamic(
    () => import("@heroui/react").then((mod) => mod.DatePicker),
    {
      ssr: false,
      loading: () => (
        <div className="h-10 w-full min-w-[200px] bg-gray-100 animate-pulse rounded-lg" />
      ),
    },
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <section>
        <div className="bg-white rounded-2xl mt-5 p-6 shadow-md border border-slate-100">
          {/* Top - Container */}
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl md:text-3xl font-bold">My Plan</h1>
              <h1 className="text-md md:text-md text-gray-500">
                สร้างและจัดการแผนการเดินทางสำหรับการเยี่ยมชมปราสาท
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <DatePicker
                  hideTimeZone
                  showMonthAndYearPickers
                  granularity="minute"
                  defaultValue={now(getLocalTimeZone())}
                  label="Event Date"
                  variant="bordered"
                  value={date}
                  onChange={(val) => setDate(val as ZonedDateTime | null)}
                />
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
            selectedEventId={eventId}
            setSelectedEventId={setEventId}
            setEventDescript={setEventDescript}
          />

          {/* Right - Container */}
          <Routesum
            boxSelect={boxSelect}
            currentPlace={getNamePlace}
            getGPS={getGPS}
            planName={planName}
            date={date}
            eventId={eventId}
            eventDescript={eventDescript}
          />
        </div>
      </section>
    </Suspense>
  );
}
