"use client";

import { addToast } from "@heroui/react";
import { useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function useCurrentuser(namePlace: (address: string) => void) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });
  const [errPosition, setErrPosition] = useState(false);
  useEffect(() => {
    function success(pos: GeolocationPosition) {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setLocation({ lat: lat, lng: lng });
      // console.log("lat:", lat, "lng:", lng);

      if (isLoaded && window.google) {
        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode(
          { location: { lat: lat, lng: lng } },
          (results, status) => {
            if (status == "OK" && results && results[0]) {
              const address = results[0].formatted_address;
              namePlace(address);
            }
          },
        );
      }
    }
    function error(err: GeolocationPositionError) {
      if (err.code === 1) {
        setErrPosition(true);
        addToast({
          hideIcon: true,
          title: "Location Access Denied",
          description: "Please allow location access",
          classNames: {
            closeButton:
              "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
          },
          closeIcon: <X />,
          color: "danger",
        });
      } else {
        setErrPosition(false);
        addToast({
          hideIcon: true,
          title: "Location Unavailable",
          description: "Please check your GPS",
          classNames: {
            closeButton:
              "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
          },
          closeIcon: <X />,
          color: "warning",
        });
      }
    }

    const closer = navigator.geolocation.watchPosition(success, error);

    return () => {
      navigator.geolocation.clearWatch(closer);
    };
  }, [namePlace, isLoaded]);

  return { location, errPosition };
}
