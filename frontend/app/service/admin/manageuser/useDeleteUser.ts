import { useState } from "react";
import api from "@/app/service/api";

export const useDeleteUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete user";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteUser, loading, error };
};
