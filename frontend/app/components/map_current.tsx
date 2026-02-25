"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/app/style/map.css";
import {addToast,Switch,Card,CardBody,CardHeader,Image,Spinner} from "@heroui/react";
import { Mouse, X } from "lucide-react";
import React, { useEffect } from "react";

export default function MyMap() {
  const [currentPosition, setCurrentPosition] = React.useState<LatLngExpression | null>(null);
  const [errPosition, setErrPosition] = React.useState<boolean>(false);

  // Marker User
  const markerIcon = new Icon({
    // iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconUrl: "/assets/map/marker_user.png",
    iconSize: [41, 41],
    iconAnchor: [12, 41],
  });

  // Get La , Long แล้ว save เก็บไว้่ใน sessionStorage เผื่อใช้ในหน้าอื่นได้
  useEffect(() => {
    navigator.geolocation.watchPosition(success, error);

    function success(pos: GeolocationPosition) {
      const long = pos.coords.longitude;
      const la = pos.coords.latitude;

      sessionStorage.setItem("user_long", long.toString());
      sessionStorage.setItem("user_la", la.toString());

      setCurrentPosition([la, long]);
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
  }, [setErrPosition]);

  const [isZoom, setIsZoom] = React.useState(true);

  return (
    <div className="place-items-center">
      <div className="flex flex-col my-5 gap-5 items-center">
        <div className="text-3xl font-bold">Map User current location</div>
        <Switch
          isSelected={!isZoom}
          onValueChange={(value) => setIsZoom(!value)}
          className=""
          thumbIcon={<Mouse />}
        >
          Scroll Wheel Zoom
        </Switch>
      </div>

      <div id="map">
        {currentPosition !== null ? (
          <MapContainer
            key={`map-${!isZoom}`}
            center={currentPosition!}
            zoom={13}
            scrollWheelZoom={!isZoom}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={currentPosition!} icon={markerIcon}>
              <Popup>ตำแหน่งปัจจุบัน</Popup>
            </Marker>
          </MapContainer>
        ) : errPosition === true ? (
          <Card className="max-w-md mx-auto mt-10 p-4" shadow="none">
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
          <div>
            <Spinner color="warning" label="Loading your location..." />;
          </div>
        )}
      </div>
    </div>
  );
}
