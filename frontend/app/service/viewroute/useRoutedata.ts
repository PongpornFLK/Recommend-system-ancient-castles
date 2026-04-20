"use client";

import { useEffect, useState } from "react";

interface RouteProps {
  current: { lat: number; lng: number };
  nearbyplace: { placeName: string; latitude: number; longitude: number }[];
  destination: {
    castle_name: string;
    location: { latitude: number; longitude: number };
  } | null;
  currentname: string;
}

export default function useRoutedata() {
  const [routeData, setRouteData] = useState<RouteProps | null>(null);

  useEffect(() => {
    const fetchRoute = () => {
      const myRoute = localStorage.getItem("my_route");
      if (myRoute) {
        const route = JSON.parse(myRoute);
        setRouteData(route);
        console.log("Get Route Data :", route);

      } else {
        console.log("No route data found in localStorage");
      }
    };
    fetchRoute();
  }, []);
  return { routeData };
}
