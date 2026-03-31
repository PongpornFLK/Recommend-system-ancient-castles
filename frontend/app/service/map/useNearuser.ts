import api from "@/app/service/api";
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

      try {
        const response = await api.get(
          `/locationcastle/castle/nearby/user=${lat}&${lng}`,
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
