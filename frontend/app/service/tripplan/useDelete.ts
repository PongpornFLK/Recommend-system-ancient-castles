"use client";
import axios from "axios";
import { API_URL } from "@/app/config";
import { useState } from "react";

export default function useDeleteTrip() {
  const [loadingDelete, setLoadingDelete] = useState(false);

  const deleteRoute = async (trip_id: number) => {
    const token = localStorage.getItem("token");

    setLoadingDelete(true);
    try {
      await axios.delete(
        `${API_URL}/trip/${trip_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

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