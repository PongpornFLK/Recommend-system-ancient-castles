import { useState } from "react";
import api from "@/app/service/api";
import { UpdateEventPayload } from "@/app/(admin)/manageevent/types";

export const useAddEvent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addEvent = async (payload: UpdateEventPayload) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/event/admin/create`, payload);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create event";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addEvent, loading, error };
};
