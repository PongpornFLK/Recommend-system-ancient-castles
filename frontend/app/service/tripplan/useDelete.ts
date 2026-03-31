"use client";
import api from "@/app/service/api";
import { useState } from "react";

export default function useDeleteTrip() {
  const [loadingDelete, setLoadingDelete] = useState(false);

  const deleteRoute = async (trip_id: number) => {
    setLoadingDelete(true);
    try {
      await api.delete(`/trip/${trip_id}`);

      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด ไม่สามารถลบทริปได้");
    } finally {
      setLoadingDelete(false);
    }
  };

  return { deleteRoute, loadingDelete };
}