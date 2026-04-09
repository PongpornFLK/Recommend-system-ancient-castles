"use client";

import { useEffect, useRef, useCallback } from "react";
import api from "@/app/service/api";

interface Trip {
  status: string;
  destination_lat: number;
  destination_lng: number;
  destination_name: string;
}

export default function GlobalTracker() {
  const watchIdRef = useRef<number | null>(null);

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

  const handleArrival = useCallback(async (name: string) => {
    localStorage.setItem("arrived", "success");
    window.dispatchEvent(new CustomEvent("arrived"));
    
    // โหลด Toast แบบ Dynamic เพื่อไม่ให้หนักแอปตอนเริ่มต้น
    const { addToast } = await import("@heroui/react");
    addToast({
      title: `ถึงที่หมาย: ${name} แล้ว!`,
      description: "กรุณากดที่กระดิ่งแจ้งเตือนเพื่อ Check-In",
      color: "success",
      variant: "solid",
      classNames: {
        title: "text-white font-bold",
        description: "text-white/90",
        icon: "text-white",
      }
    });
    
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const startTracking = useCallback(async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId || userId === "null" || userId === "") return;

    try {
      const tripResponse = await api.get("/trip/user");
      const activeTrip = tripResponse.data.find((t: Trip) => t.status === "travelling");

      if (activeTrip && activeTrip.destination_lat && activeTrip.destination_lng) {
        // ถ้าถึงอยู่แล้วใน LocalStorage ไม่ต้องรัน GPS ซ้ำ
        if (localStorage.getItem("arrived") === "success") return;

        if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        
        const checkDistance = (pos: GeolocationPosition) => {
          const dist = getDistanceInKm(
            pos.coords.latitude, pos.coords.longitude,
            activeTrip.destination_lat, activeTrip.destination_lng
          );
          
          if (dist <= 500) { // 500 km ตามที่คุณตั้งไว้
            handleArrival(activeTrip.destination_name);
          }
        };

        navigator.geolocation.getCurrentPosition(checkDistance);
        watchIdRef.current = navigator.geolocation.watchPosition(
          checkDistance,
          (err) => console.log("[GlobalTracker] GPS Error:", err),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
        );
      }
    } catch (err) {
      console.error("[GlobalTracker] Sync Error:", err);
    }
  }, [handleArrival]);

  useEffect(() => {
    startTracking();
    
    // ดักฟังเหตุการณ์ต่างๆ เพื่อเริ่มแทร็กใหม่
    window.addEventListener("auth-change", startTracking);
    window.addEventListener("trip-status-changed", startTracking);

    return () => {
      window.removeEventListener("auth-change", startTracking);
      window.removeEventListener("trip-status-changed", startTracking);
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [startTracking]);

  return null; // Component นี้ไม่มีหน้าตา
}
