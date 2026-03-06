"use client";

import useTracking from "@/app/service/tripplan/useTracking"; 

interface TrackerProps {
  tripId: number;
  destLat: number;
  destLng: number;
}

export default function Tracker({ tripId, destLat, destLng }: TrackerProps) {
  const { isArrived, currentDistance } = useTracking(tripId, destLat, destLng);

  if (isArrived) {
    return (
      <div className="mt-2 text-green-600 font-bold animate-pulse">
         Success
      </div>
    );
  }

  return (
    <div className="mt-2 text-blue-600 font-medium">
      ระยะทางห่างจากจุดหมาย : {" "}
      {currentDistance !== null 
        ? `${currentDistance.toFixed(2)} กม.` 
        : "Finding Distance"}
    </div>
  );
}