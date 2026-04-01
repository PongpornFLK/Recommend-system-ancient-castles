import { useState, useEffect } from "react";
import api from "@/app/service/api";
import { CastleArray } from "@/app/(admin)/manageevent/types";

export const useGetCastles = () => {
  const [castles, setCastles] = useState<CastleArray>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCastles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.get<CastleArray>(`/castles/admin`);
      setCastles(data.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch castles";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCastles();
  }, []);

  return { castles, loading, error, fetchCastles };
};
