"use client";

import useRoutedata from "@/app/service/viewroute/useRoutedata";
import { Spinner } from "@heroui/react";
import { DirectionsService, DirectionsRenderer } from "@react-google-maps/api";

interface DirecProps {
  direction: google.maps.DirectionsResult | null;
  setDirection: React.Dispatch<
    React.SetStateAction<google.maps.DirectionsResult | null>
  >; // เก็บข้อมูลทิศทางและส่งต่อ
}

export default function Direction({ direction, setDirection }: DirecProps) {
  const { routeData } = useRoutedata();

  if (!routeData?.current) {
    return (
      <div className="text-center">
        <Spinner color="warning" label="Loading your location..." />
      </div>
    );
  }
  return (
    <>
      {direction === null && routeData.destination && (
        <DirectionsService
          options={{
            origin: {
              lat: routeData.current.lat,
              lng: routeData.current.lng,
            },
            waypoints:
              routeData.nearbyplace && routeData.nearbyplace.length > 0
                ? routeData.nearbyplace.map((place) => ({
                  location: {
                    lat: place.latitude,
                    lng: place.longitude,
                  },
                  stopover: true,
                }))
                : [], // [] คือ ถ้าไม่มี nearbyplace ให้ส่ง [] ไป
            destination: {
              lat: routeData.destination?.location.latitude,
              lng: routeData.destination?.location.longitude,
            },
            travelMode: window.google.maps.TravelMode.DRIVING, // โหมดการเดินทาง
          }}
          callback={(result, status) => { // จะทำงานเมื่อได้ผลลัพธ์จาก API
            if (status === "OK" && result) {
              console.log("Get Directions Result :", result);
              setDirection(result); // เก็บข้อมูลทิศทาง
            }
          }}
        ></DirectionsService>
      )}
      {direction && <DirectionsRenderer directions={direction} />}
    </>
  );
}
