"use client";

import { useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

export default function useCalroute() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });
  const [loading, setLoading] = useState(false);

  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0);
  const kilo = (distance / 1000).toFixed(1);
  const hours = Math.floor(time / 3600);
  const minute = Math.floor((time % 3600) / 60);

  const calRoute = (
    getGPS: { lat: number; lng: number },
    nearbyplace: { latitude: number; longitude: number }[],
    destination: {
      location: { latitude: number; longitude: number };
    } | null,
  ) => {
    setLoading(true);
    if (!getGPS || !destination || !isLoaded) {
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: getGPS,
        waypoints:
          nearbyplace && nearbyplace.length > 0
            ? nearbyplace.map((place) => ({
                location: new google.maps.LatLng(
                  place.latitude,
                  place.longitude,
                ),
                stopover: true,
              }))
            : [],
        destination: new google.maps.LatLng(
          destination.location.latitude,
          destination.location.longitude,
        ),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          const current = result.routes[0];
          let totalDistance = 0;
          let totalTime = 0;
          current.legs.forEach((leg) => {
            totalDistance += leg.distance?.value || 0;
            totalTime += leg.duration?.value || 0;
          });
          setDistance(totalDistance);
          setTime(totalTime);
        }
      },
    );
    setLoading(false);
  };

  return { calRoute, loading,kilo , hours ,minute};
}
