"use client";

import { InfoWindow } from "@react-google-maps/api";

interface InfoProps {
  castle: { lat: number; lng: number; castle_name: string }[];
  nearPlace: { lat: number; lng: number; place_name: string }[];
}

export default function Info({ castle, nearPlace }: InfoProps) {
  return (
    <>
      {castle.map((castle, key) => (
        <InfoWindow
          key={key}
          position={{ lat: castle.lat, lng: castle.lng }}
          options={{
            pixelOffset: new window.google.maps.Size(0, -40),
            headerDisabled: true,
          }}
        >
          <div>
            <span className="font-bold text-xs">{castle.castle_name}</span>
          </div>
        </InfoWindow>
      ))}
      {nearPlace.map((place, key) => (
        <InfoWindow
          key={key}
          position={{ lat: place.lat, lng: place.lng }}
          options={{
            pixelOffset: new window.google.maps.Size(0, -40),
            headerDisabled: true,
          }}
        >
          <div>
            <span className="font-bold text-xs">{place.place_name}</span>
          </div>
        </InfoWindow>
      ))}
    </>
  );
}
