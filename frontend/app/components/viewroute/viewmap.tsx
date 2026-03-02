"use client";

import { useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import useRoutedata from "@/app/service/viewroute/useRoutedata";
import { Spinner } from "@heroui/react";
import Info from "./info";
import Direction from "./direction";

export default function ViewMap() {
  const { routeData } = useRoutedata();
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });
  const [direction, setDirection] =
    useState<google.maps.DirectionsResult | null>(null);

  console.log("routeData:", routeData);

  if (!isLoaded || !routeData?.current) {
    return (
      <div className="text-center">
        <Spinner color="warning" label="Loading your location..." />
      </div>
    );
  }

  // console.log("Check Waypoints:", routeData.nearbyplace?.map(p => ({ lat: p.latitude, lng: p.longitude })));

  return (
    <div className="flex items-center justify-center">
      <div className="w-full">
        {isLoaded ? (
          <GoogleMap
            center={{
              lat: routeData.current.lat,
              lng: routeData.current.lng,
            }}
            mapContainerStyle={{ width: "100%", height: "600px" }}
            zoom={13}
          >
            <Marker
              position={{
                lat: routeData.current.lat,
                lng: routeData.current.lng,
              }}
            ></Marker>
            <Direction direction={direction} setDirection={setDirection} />
            {direction && <Info direction={direction} />}
          </GoogleMap>
        ) : (
          <div>p</div>
        )}
      </div>
    </div>
  );
}
