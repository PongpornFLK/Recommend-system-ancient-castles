import { useState } from "react";
import api from "@/app/service/api";

export const useDeleteEvent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteEvent = async (eventId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.delete(`/event/${eventId}`);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete event";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteEvent, loading, error };
};
