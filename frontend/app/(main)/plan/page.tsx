"use client";

import dynamic from "next/dynamic";
const Routeplan = dynamic(() => import("@/app/components/plan/routeplan"), {
  ssr: false,
});
const Routesum = dynamic(() => import("@/app/components/plan/routesum"), {
  ssr: false,
});

import useLocation from "@/app/service/map/useLocation";
import { useEffect, useState, Suspense } from "react";
import { now, getLocalTimeZone, ZonedDateTime } from "@internationalized/date";
import { useSearchParams } from "next/navigation";

export default function Plan() {
  const searchParams = useSearchParams();
  const castleIdFromQuery = searchParams.get("castle_id");
  const eventIdFromQuery = searchParams.get("event_id");

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

  useEffect(() => {
    if (!castleIdFromQuery) return;

    setBoxSelect([
      {
        id: 1,
        placeId: castleIdFromQuery,
        placeName: "",
        latitude: 0,
        longitude: 0,
      },
    ]);
  }, [castleIdFromQuery]);

  useEffect(() => {
    if (!eventIdFromQuery) return;
    const parsedEventId = Number(eventIdFromQuery);
    if (!Number.isNaN(parsedEventId)) {
      setEventId(parsedEventId);
    }
  }, [eventIdFromQuery]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <section>
        <div className="bg-white rounded-2xl mt-5 p-6 shadow-md border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex flex-col gap-1 md:gap-2">
              <h1 className="text-2xl md:text-3xl font-bold">My Plan</h1>
              <p className="text-sm md:text-base text-gray-500 max-w-sm">
                สร้างและจัดการแผนการเดินทางสำหรับการเยี่ยมชมปราสาท
              </p>

              
            </div>

            <div className="w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <DatePicker
                  hideTimeZone={true}
                  showMonthAndYearPickers={true}
                  granularity="minute"
                  defaultValue={now(getLocalTimeZone())}
                  label="Event Date"
                  variant="bordered"
                  value={date}
                  onChange={(val) => setDate(val as ZonedDateTime | null)}
                  className="w-full sm:min-w-[200px]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 lg:items-start">
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