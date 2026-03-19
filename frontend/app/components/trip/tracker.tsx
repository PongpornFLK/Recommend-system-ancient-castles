"use client";

import useCheckIn from "@/app/service/tripplan/useCheckIn";
import useCancel from "@/app/service/tripplan/useCancel";
import useTracking from "@/app/service/tripplan/useTracking";
import { Button } from "@heroui/button";
import useRoutedata from "@/app/service/viewroute/useRoutedata";

interface TrackerProps {
  trip_id: number;
  castle_id: number;
  destLat: number;
  destLng: number;
}

export default function Tracker({
  trip_id,
  castle_id,
  destLat,
  destLng,
}: TrackerProps) {
  const { isArrived, currentDistance } = useTracking(trip_id, destLat, destLng);
  const { CheckIn } = useCheckIn();
  const { cancelRoute, loadingCancel } = useCancel();
  const { routeData } = useRoutedata();

  const handleCheckIn = () => {
    const currentLat = routeData?.current.lat;
    const currentLng = routeData?.current.lng;
    const waypoint = routeData?.nearbyplace
      ? routeData.nearbyplace.map((place) => ({
          lat: place.latitude,
          lng: place.longitude,
        }))
      : [];

    if (currentLat === undefined || currentLng === undefined) {
      console.error("Current location is undefined");
      return;
    }

    CheckIn(castle_id, trip_id, currentLat, currentLng, waypoint, destLat, destLng);
  };

  return (
    <div className="flex flex-col justify-between items-end h-full py-3">
      <div className="text-right">
        <p className=" font-bold mb-1">ระยะทางที่เหลือ</p>
        {isArrived ? (
          <div className="text-green-600 font-bold animate-pulse text-lg flex items-center gap-2">
            Success : ถึงจุดหมายแล้ว
          </div>
        ) : (
          <div className="text-blue-700 font-black text-xl">
            {currentDistance !== null
              ? `${currentDistance.toFixed(2)} กม.`
              : "กำลังหานำทาง..."}
          </div>
        )}
      </div>

      <div className="flex flex-row gap-3 mt-8">
        <Button
          className="font-bold h-10 px-6 rounded-xl bg-white text-tone-red hover:bg-tone-red hover:text-white"
          isLoading={loadingCancel}
          onClick={() => cancelRoute(trip_id)}
        >
          Cancel
        </Button>
        <Button
          color={isArrived ? "success" : "default"}
          className={`font-bold h-10 px-8 rounded-xl text-white shadow-md transition-all ${
            !isArrived
              ? " cursor-not-allowed shadow-none"
              : "shadow-green-100 hover:scale-105"
          }`}
          disabled={!isArrived}
          onClick={() => isArrived && handleCheckIn()}
        >
          Check-In
        </Button>
      </div>
    </div>
  );
}
