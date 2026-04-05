import { useState } from "react";
import api from "@/app/service/api";
import { UpdateEventPayload } from "@/app/(admin)/manageevent/types";

export const useUpdateEvent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateEvent = async (eventId: string, payload: UpdateEventPayload) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put(`/event/${eventId}`, payload);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update event";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateEvent, loading, error };
};
