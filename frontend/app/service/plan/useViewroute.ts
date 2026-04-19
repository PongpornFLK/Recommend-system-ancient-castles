"use client";

import { useRouter } from "next/navigation";

export default function useViewroute() {
  const router = useRouter();

  const viewRoute = (
    getGPS: { lat: number; lng: number },
    nearbyplace: { placeName: string; latitude: number; longitude: number }[],
    destination: {
      castle_name: string;
      location: { latitude: number; longitude: number };
    } | null,
    currentname: string,
  ) => {
    const routeData = {
      current: getGPS,
      currentname: currentname,
      destination: destination,
      nearbyplace: nearbyplace,
    };

    // save ทั้งหมดลง local
    localStorage.setItem("my_route", JSON.stringify(routeData));
    console.log("Save Route Data :", routeData);
    router.push("/viewroute");
  };
  return { viewRoute };
}
