import api from "@/app/service/api";
import { useEffect, useState } from "react";

export interface TripData {
  plan_id: number,
  plan_name: string,
  event_description: string,
  start_date: string,
  end_date: string,
  duration: number,
  status: string,
  castle_id: number,
  destination_name?: string,
  destination_lat?: number,
  destination_lng?: number,
}

export default function useTrip() {
  const [tripData, setTripData] = useState<TripData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    const fetchTrip = async () => {
      setIsLoaded(true);
      setError(false);
      try {
        const response = await api.get(`/trip/user`);

        setTripData(response.data);
      } catch (err) {
        setError(true);
        console.log(err);
      } finally {
        setIsLoaded(false);
      }
    };
    fetchTrip();
  }, []);

  return { tripData, isLoaded, error };
}
