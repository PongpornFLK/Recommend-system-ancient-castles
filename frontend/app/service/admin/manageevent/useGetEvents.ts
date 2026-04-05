import { useState, useEffect, useCallback } from "react";
import api from "@/app/service/api";
import { ApiResponse, EventData } from "@/app/(admin)/manageevent/types";

export const useGetEvents = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchEvents = useCallback(async (page: number = 1, size: number = 5) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<ApiResponse>(`/event/admin`, {
        params: { page, size },
      });
      console.log(response.data);
      setEvents(response.data.items);
      setTotal(response.data.total);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch events";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, total, fetchEvents };
};
