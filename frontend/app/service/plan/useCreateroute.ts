"use client";

import axios from "axios";
import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

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
  // const searchParams = useSearchParams();
  // const castle_id = searchParams.get("castle_id");

  const castle_id = 10;

  useEffect(() => {
    const fetchLocationCastle = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/locationcastle/${castle_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        // console.log("LocationCastle : ",response.data);

        setLocationCastle(response.data);
      } catch (err) {
        console.log("Fetch Error ", err);
      }
    };

    fetchLocationCastle();
  }, [castle_id]);

  return { locationCastle };
}
