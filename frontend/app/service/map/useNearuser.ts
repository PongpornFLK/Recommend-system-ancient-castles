import api from "@/app/service/api";
import { useEffect, useState } from "react";

interface UserProps {
  lat: number;
  lng: number;
  radius: number;
}

export default function useNearUser({ lat, lng, radius }: UserProps) {
  const [castle, setCastle] = useState<{ lat: 0; lng: 0; castle_name: "" }[]>(
    [],
  );

  const [nearPlace, setNearPlace] = useState<{ lat: 0; lng: 0; place_name: "" }[]>(
    [],
  );

  useEffect(() => {
    const fetchNearUser = async () => {
      if (!lat && !lng) {
        return;
      }

      try {
        const responseCastle = await api.get(
          `/locationcastle/castle/nearby/user=${lat}&${lng}?radius=${radius}`,
        );
        const responsePlace = await api.get(
          `/nearplace/nearby/user=${lat}&${lng}?radius=${radius}`,
        );

        setCastle(responseCastle.data);
        setNearPlace(responsePlace.data);

        console.log("setCastle : ", responseCastle.data)
        console.log("setNearPlace : ", responsePlace.data)
      } catch (err) {
        console.error(err);
      }
    };
    fetchNearUser();
  }, [lat, lng, radius]);

  return { castle, nearPlace };
}
