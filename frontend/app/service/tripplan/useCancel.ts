"use client";
import api from "@/app/service/api";
import { useState } from "react";

export default function useCancel() {
  const [loading, setLoading] = useState(false);

  const cancelRoute = async (trip_id: number) => {
    setLoading(true);
    try {
      const response = await api.post(`/trip/${trip_id}/cancel`, {});
      console.log("Delete : ", response.data)
      window.location.reload();

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { cancelRoute, loadingCancel: loading };
}