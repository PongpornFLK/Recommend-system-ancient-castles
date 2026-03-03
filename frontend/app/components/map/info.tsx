"use client";

import { InfoWindow } from "@react-google-maps/api";

interface InfoProps {
  castle: { lat: number; lng: number; castle_name: string }[];
}

export default function Info({ castle }: InfoProps) {
  return (
    <>
      {castle.map((place, key) => (
        <InfoWindow
          key={key}
          position={{ lat: place.lat, lng: place.lng }}
          options={{
            pixelOffset: new window.google.maps.Size(0, -40),
            headerDisabled: true,
          }}
        >
          <div>
            <span className="font-bold text-xs">{place.castle_name}</span>
          </div>
        </InfoWindow>
      ))}
    </>
  );
}
