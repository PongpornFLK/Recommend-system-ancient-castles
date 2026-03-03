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

interface MapProps {
  namePlace: (address: string) => void;
}

export default function MapCurrent({ namePlace }: MapProps) {
  const { location, errPosition } = useCurrentuser(namePlace);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });
  // console.log("API KEY:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  const { castle } = useNearUser({
    lat: location?.lat || 0,
    lng: location?.lng || 0,
  });

  // console.log("Castle : ", castle)

  return (
    <div>
      {location !== null && isLoaded ? (
        <div className="w-full">
          <GoogleMap
            center={location}
            mapContainerStyle={{ width: "100%", height: "600px" }}
            zoom={13}
          >
            <Marker
              position={location}
              icon={{
                url: "/assets/map/marker_user.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            ></Marker>

            <Circle
              center={location}
              radius={5000}
              options={{
                fillOpacity: 0.1,
                fillColor: "#82b3ff",
                strokeColor: "blue",
              }}
            ></Circle>

            {castle.map((place, key) => (
              <Marker
                key={key}
                position={{ lat: place.lat, lng: place.lng }}
                icon={{
                  url: "/assets/map/marker_flag.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              ></Marker>
            ))}
            {isLoaded && <Info castle={castle} />}
          </GoogleMap>
        </div>
      ) : errPosition === true ? (
        <CradErr />
      ) : (
        <div className="text-center">
          <Spinner color="warning" label="Loading your location..." />
        </div>
      )}
    </div>
  );
}
