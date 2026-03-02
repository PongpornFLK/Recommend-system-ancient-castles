"use client";

import { addToast, Card, CardBody, CardHeader ,Image, Spinner} from "@heroui/react";
import {  GoogleMap,  useJsApiLoader,  Marker,  Circle,} from "@react-google-maps/api";
import { X } from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";

interface MapProps {
  namePlace : (address : string) => void;
}

export default function MapCurrent({namePlace} : MapProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });
  const [errPosition, setErrPosition] = React.useState<boolean>(false);

  // console.log("API KEY:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  useEffect(() => {
    function success(pos: GeolocationPosition) {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setLocation({ lat: lat, lng: lng });

      if(window.google){
        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode({location : { lat : lat , lng : lng}} , (results , status) =>{
          if(status == "OK" && results && results[0]){
            const address = results[0].formatted_address;
            namePlace(address);
          }
        })


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
    }
  }, [namePlace]);

  return (
    <div>
      {location !== null && isLoaded ? (
          <div className="w-full">
            <GoogleMap 
              center={location} 
              mapContainerStyle={{width: '100%', height: '600px'}} 
              zoom={13}
            >
              <Marker position={location}>
              </Marker>
              <Circle center={location} radius={5000} options={{
                fillOpacity : 0.1,
                fillColor : "#82b3ff",
                strokeColor : "blue"
              }}></Circle>
            </GoogleMap>
          </div>
        ) : errPosition === true ? (
          <Card className="max-w-md mx-auto mt-3 mb-5 p-4" shadow="sm">
            <CardHeader className="flex-col items-center">
              <div className="text-xl font-bold">จำเป็นต้องอนุญาตการเข้าถึงตำแหน่ง</div>
              <Image  
              className="my-5"
                alt="Card background"
                src="/assets/map/map.png"
                width={100}
              />
              <div className="text-lg mt-2 font-semibold">ทำตามขั้นตอนด้านล่างเพื่อเปิดใช้งานนะ</div>
            </CardHeader>
            <CardBody className="overflow-visible">
              <div>
                <p>1. คลิกที่ไอคอนการตั้งค่า</p>
                <p>2. ซ้ายบนสุดของแถบ URL มองหาเมนู ตำแหน่ง (Location)</p>
                <p>3. เปลี่ยนสิทธิ์การเข้าถึงเป็น อนุญาต (Allow)</p>
                <p>4. กดยืนยันหรือรีเฟรชหน้าเว็บอีกครั้ง</p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="text-center">
            <Spinner color="warning" label="Loading your location..." />
          </div>
        )}

    </div>
  );
}
