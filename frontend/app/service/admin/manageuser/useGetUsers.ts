import { useState, useEffect, useCallback } from "react";
import api from "@/app/service/api";
import { UserApiResponse, UserData } from "@/app/(admin)/manageuser/types";

export const useGetUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async (page: number = 1, size: number = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<UserApiResponse>(`/users`, {
        params: { page, size },
      });
      
      const mappedUsers = response.data.items.map((item: UserData) => ({
        user_id: item.user_id?.toString(),
        username: item.username || "",
        email: item.email || "",
        roles: item.roles || "",
      }));
      
      setUsers(mappedUsers);
      setTotal(response.data.total);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch users";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, total, fetchUsers };
};
