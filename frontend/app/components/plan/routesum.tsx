"use client";

import useLocation from "@/app/service/map/useLocation";
import useCalroute from "@/app/service/plan/useCalroute";
import useCreateroute from "@/app/service/plan/useCreateroute";
import useEventdescript from "@/app/service/plan/useEventdescript";
import useViewroute from "@/app/service/plan/useViewroute";
import saveTrip from "@/app/service/tripplan/useSavetrip";
import { ZonedDateTime } from "@internationalized/date";
import { Button, Chip, Skeleton } from "@heroui/react";
import { List, Route } from "lucide-react";
import { useEffect } from "react";
import ButtonSave from "./buttonsave";

interface RouteSumProps {
  // เป็น Array []
  boxSelect: {
    id: number;
    placeId: string;
    placeName: string;
    latitude: number;
    longitude: number;
  }[];
  currentPlace: string;
  getGPS: {
    lat: number;
    lng: number;
  };
  planName: string;
  date?: ZonedDateTime | null;
}

export default function Routesum({
  boxSelect,
  currentPlace,
  getGPS,
  planName,
  date,
}: RouteSumProps) {
  const { locationCastle } = useCreateroute();
  const { getNamePlace } = useLocation();
  const { eventDescript, eventId } = useEventdescript();
  const { viewRoute } = useViewroute();
  const { calRoute, kilo, hours, minute, loading } = useCalroute();
  const { saveRoute } = saveTrip();

  useEffect(() => {
    if (getGPS && locationCastle) {
      const checkNearPlace = boxSelect.filter(
        (item) =>
          item.placeName != "" && item.latitude != 0 && item.longitude != 0,
      );
      calRoute(getGPS, checkNearPlace, locationCastle);
    }
  }, [calRoute, getGPS, boxSelect, locationCastle]);

  const handleSaveTrip = () => {
    let startDate = new Date();
    if (date) {
      startDate = date.toDate();
    }

    const minutes = hours * 60 + minute;
    const endDate = new Date(startDate.getTime() + minutes * 60000);

    const tripData = {
      plan_name: planName,
      event_id: eventId,
      event_description: eventDescript || "none",
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      duration: minutes,
      status: "travelling" as const,
      destination_id: locationCastle?.castle_id || 0,
      destination_name: locationCastle?.castle_name || "none",
      destination_lat: locationCastle?.location.latitude || 0,
      destination_lng: locationCastle?.location.longitude || 0,
    };

    const itinerary = boxSelect
      .filter((box) => box.placeName && box.placeName !== "")
      .map((box) => ({
        castle_id: Number(box.placeId) || 0,
        event_id: eventId || 1,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        place_name: box.placeName,
      }));

    saveRoute(tripData, itinerary);
  };

  return (
    <div className="bg-white rounded-2xl mt-5 p-6 w-full lg:w-2/5 lg:h-fit">
      <h2 className="text-xl font-bold mb-4">Result</h2>
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>เวลาเดินทางทั้งหมด :</div>
          {!loading ? (
            <div className="font-semibold">
              {hours} ชั่วโมง {minute} นาที
            </div>
          ) : (
            <Skeleton className="rounded-lg">
              <div className="h-10 rounded-lg bg-tone-blue" />
            </Skeleton>
          )}
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>ระยะทางทั้งหมด :</div>
          {!loading ? (
            <div className="font-semibold">{kilo} กิโลเมตร</div>
          ) : (
            <Skeleton className="rounded-lg">
              <div className="h-10 rounded-lg bg-tone-blue" />
            </Skeleton>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 font-bold">ลำดับการเดินทาง :</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Chip className="bg-tone-blue text-white">1</Chip>
            <div>{currentPlace}</div>
          </div>
          <div className="flex items-center gap-2">
            <Chip className="bg-tone-yellow text-white">2</Chip>
            <div>
              {boxSelect
                .filter((box) => box.placeName && box.placeName !== "")
                .map((box) => (
                  <div key={box.id} className="flex gap-2">
                    {">"}
                    {box.placeName}
                  </div>
                ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip className="bg-tone-red text-white">3</Chip>
            <div>{locationCastle?.castle_name}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <ButtonSave planName={planName} onSave={handleSaveTrip} />
        <Button
          startContent={<Route size={16} />}
          className="flex-1 bg-tone-yellow text-white font-bold"
          onClick={() => {
            // Filter เช็ค waypoints
            const validWaypoints = boxSelect.filter(
              (box) =>
                box.placeName &&
                box.placeName !== "" &&
                box.latitude !== 0 &&
                box.longitude !== 0,
            );
            viewRoute(getGPS, validWaypoints, locationCastle, getNamePlace);
          }}
        >
          View Route
        </Button>
      </div>
    </div>
  );
}
