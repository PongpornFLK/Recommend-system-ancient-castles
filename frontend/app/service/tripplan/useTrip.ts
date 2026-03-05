import axios from "axios";
import { useEffect, useState } from "react";

interface TripData {
    plan_name: string,
    event_description: string, 
    start_date: string,
    end_date: string,
    duration: number,
    status: string ,  
    destination_name:  string,
}

export default function useTrip() {
  const [tripData, setTripData] = useState<TripData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    const fetchTrip = async () => {
      const token = localStorage.getItem("token");
      setIsLoaded(true);
      setError(false);
      try {
        const response = await axios.get(`http://127.0.0.1:8000/trip/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
