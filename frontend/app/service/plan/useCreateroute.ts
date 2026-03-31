"use client";

import api from "@/app/service/api";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface LocationCastle {
  castle_id: number;
  castle_name: string;
  location: {
    location_id: number;
    latitude: number;
    longitude: number;
  };
}

export default function useCreateroute() {
  const [locationCastle, setLocationCastle] = useState<LocationCastle | null>(
    null,
  );
  const searchParams = useSearchParams();
  const castle_id = searchParams.get("castle_id");

  // const castle_id = 10;

  useEffect(() => {
    const fetchLocationCastle = async () => {
      try {
        const response = await api.get(`/locationcastle/${castle_id}`);
        console.log("LocationCastle : ", response.data);

        setLocationCastle(response.data);
      } catch (err) {
        console.log("Fetch Error ", err);
      }
    };

    fetchLocationCastle();
  }, [castle_id]);

  return { locationCastle };
}
