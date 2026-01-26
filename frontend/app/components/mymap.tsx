"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/app/style/map.css";
// import { addToast } from "@heroui/react";
// import { X } from "lucide-react";


export default function MyMap() {
  const markerPlace: { position: LatLngExpression; popUp: string }[] = [
    { position: [48.8566, 2.3522], popUp: "Bangkok, Thailand" },
    { position: [51.5074, -0.1278], popUp: "Chonburi , Thailand" },
    { position: [35.6895, 139.6917], popUp: "Chiang Mai, Thailand" },
  ];

  const markerIcon = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });


  // function success(pos: GeolocationPosition){
  //   const long = pos.coords.longitude;
  //   const lat = pos.coords.latitude;
  //   const accuracy = pos.coords.accuracy;

  //   const markerUser: { position: LatLngExpression}[] = [
  //   { position: [lat, long]},
  //   ];

  //   const circle: { position: LatLngExpression , radius: number }[] = [
  //   { position: [lat, long], radius: accuracy },
  //   ];

    
  // }

  // function error(err : GeolocationPositionError){
  //   if(err.code == 1){
  //     addToast({
  //       hideIcon: true,
  //       title: "Location Access Required",
  //       description : "Please allow location access",
  //       classNames: {
  //         closeButton: "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
  //       },
  //       closeIcon: <X />,
  //       color: "danger"
  //     });
  //   } else {
  //     addToast({
  //       hideIcon: true,
  //       title: "Location Access Denied",
  //       description : "Location access denied",
  //       classNames: {
  //         closeButton: "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
  //       },
  //       closeIcon: <X />,
  //       color: "danger"
  //     });
  //   }

  // }

  return (
    <div className="place-items-center ">
      <MapContainer center={[48.8566, 2.3522]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {markerPlace.map((marker) => (
          <Marker key={marker.popUp} position={marker.position} icon={markerIcon}>
            <Popup>{marker.popUp}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
