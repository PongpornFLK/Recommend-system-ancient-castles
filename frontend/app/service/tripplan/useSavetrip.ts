"use client";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function useSaveTrip() {
  const router = useRouter();

  const saveRoute = async (
    tripData: {
      plan_name: string;
      event_id: number;
      event_description: string;
      start_date: string;
      end_date: string;
      duration: number;
      status: "travelling";
      destination_id: number;
      destination_name: string;
      destination_lat: number;
      destination_lng: number;
    },
    itinerary: {
      castle_id: number;
      event_id: number;
      start_time: string;
      end_time: string;
      place_name: string;
    }[],
  ) => {
    const token = localStorage.getItem("token");
    try {
      const data = { ...tripData, itinerary_data: itinerary };
      const response = await axios.post(
        `http://127.0.0.1:8000/trip/create`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log("Save", response.data);
      router.push("/tripplan");
    } catch (err) {
      console.log(err);
    }
  };
  return { saveRoute };
}
