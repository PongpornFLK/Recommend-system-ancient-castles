import axios from "axios";
import { API_URL } from "@/app/config";
import { useEffect, useState } from "react";

interface UserProps {
  lat: number;
  lng: number;
}

export default function useNearUser({ lat, lng }: UserProps) {
  const [castle, setCastle] = useState<{ lat: 0; lng: 0; castle_name: "" }[]>(
    [],
  );

  useEffect(() => {
    const fetchNearUser = async () => {
      if (!lat && !lng) {
        return;
      }
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          `${API_URL}/locationcastle/castle/nearby/user=${lat}&${lng}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setCastle(response.data);
        // console.log("setCastle : " , response.data)
      } catch (err) {
        console.error(err);
      }
    };
    fetchNearUser();
  }, [lat, lng]);

  return { castle };
}
