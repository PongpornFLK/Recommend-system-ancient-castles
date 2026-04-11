"use client";

import useNearUser from "@/app/service/map/useNearuser";
import { Spinner } from "@heroui/react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Circle,
} from "@react-google-maps/api";
import Info from "./info";
import CradErr from "./cardErr";
import useCurrentuser from "@/app/service/map/useCurrentuser";
import { useState, useRef, useEffect } from "react";


interface MapProps {
  namePlace: (address: string) => void;
  radius: number;
}

export default function MapCurrent({ namePlace, radius }: MapProps) {
  // const reCircle = useRef<google.maps.Circle | null>(null);

  const { location, errPosition } = useCurrentuser(namePlace);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  // console.log("API KEY:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  const { castle, nearPlace } = useNearUser({
    lat: location?.lat || 0,
    lng: location?.lng || 0,
    radius: radius
  });



  // load วงใหม่
  // useEffect(() => {
  //   return () => {
  //     if (reCircle.current) {
  //       reCircle.current.setMap(null);
  //       reCircle.current = null;
  //     }
  //   };
  // }, [location, radius])

  return (
    <div>
      {location !== null && isLoaded ? (
        <div className="w-full">
          <GoogleMap
            center={location}
            mapContainerStyle={{ width: "100%", height: "600px" }}
            zoom={radius == 10 ? 12 : radius == 25 ? 11 : radius == 50 ? 10 : radius == 100 ? 9 : 11}
          >
            <Marker
              position={location}
              icon={{
                url: "/assets/map/marker_user.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            ></Marker>

            <Circle
              key="radius-circle"
              // onLoad={(circle) => { reCircle.current = circle }}
              // onUnmount={() => { reCircle.current = null }}
              center={location}
              radius={radius * 1000}
              options={{
                fillOpacity: 0.1,
                fillColor: "#82b3ff",
                strokeColor: "blue",
              }}
            ></Circle>

            {castle.map((castle, key) => (
              <Marker
                key={key}
                position={{ lat: castle.lat, lng: castle.lng }}
                icon={{
                  url: "/assets/map/marker_castle.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              ></Marker>
            ))}
            {nearPlace.map((place, key) => (
              <Marker
                key={key}
                position={{ lat: place.lat, lng: place.lng }}
                icon={{
                  url: "/assets/map/marker_place.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              ></Marker>
            ))}
            {isLoaded && <Info castle={castle} nearPlace={nearPlace} />}
          </GoogleMap>
        </div>
      ) : errPosition === true ? (
        <CradErr />
      ) : (
        <div className="text-center">
          <Spinner color="warning" label="Loading your location..." />
        </div>
      )
      }
    </div >
  );
}
