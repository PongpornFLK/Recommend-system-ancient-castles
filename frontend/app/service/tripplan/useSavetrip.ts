"use client";
import axios from "axios";
import { API_URL } from "@/app/config";
import { useRouter } from "next/navigation";

export default function useSaveTrip() {
  const router = useRouter();

  const saveRoute = async (
    tripData: {
      plan_name: string;
      event_id: number | null;
      event_description: string;
      start_date: string;
      end_date: string;
      duration: number;
      status: "travelling";
      castle_id: number;
    },
    itinerary: {
      castle_id: number;
      event_id: number | null;
      start_time: string;
      end_time: string;
      place_name: string;
    }[],
  ) => {
    const token = localStorage.getItem("token");
    try {
      const data = { ...tripData, itinerary_data: itinerary };
      const response = await axios.post(
        `${API_URL}/trip/create`,
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
      console.log("Can't Save", err);
    }
  };
  return { saveRoute };
}
