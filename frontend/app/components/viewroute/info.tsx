"use client";

import { InfoWindow } from "@react-google-maps/api";

interface InfoProps {
  direction: google.maps.DirectionsResult;
}

export default function Info({ direction }: InfoProps) {
  return (
    <>
      {direction?.routes[0].legs.map((place, key) => (
        <InfoWindow
          position={place.end_location}
          key={key}
          options={{
            pixelOffset: new window.google.maps.Size(0, -40),
            // headerDisabled: true,
          }}
        >
          <div className="w-75">
            <div className="flex flex-row gap-2">
              <span className="font-bold">Place: </span>
              {place.end_address}
            </div>
            <div className="flex flex-row gap-2 mt-1">
              <div>
                <span className="font-bold">Distance: </span>
                {place.distance?.text}
              </div>
              <div>
                <span className="font-bold"> Time: </span>
                {place.duration?.text}
              </div>
            </div>
          </div>
        </InfoWindow>
      ))}
    </>
  );
}
