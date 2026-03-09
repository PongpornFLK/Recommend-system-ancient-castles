"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function useTracking(
  tripId: number,
  destLat: number,
  destLng: number
) {
  const [isArrived, setIsArrived] = useState(false);
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);

  // คำนวณระยะทาง Haversine Formula
  const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (isArrived) return;
    

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const distance = getDistanceInKm(userLat, userLng, destLat, destLng);
        setCurrentDistance(distance);

        if (distance <= 0.5) {
          setIsArrived(true);
          console.log("Reached destination!");
        }
      },
      (error) => {
        console.error("Error watching location:", error);
      },

      // ความแม่นยำ , realtime
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    // ไม่ทำงานต่อเมื่อออกจาก Tripplan
    return () => navigator.geolocation.clearWatch(watchId);

  }, [tripId, destLat, destLng, isArrived]);

  return { isArrived, currentDistance };
}