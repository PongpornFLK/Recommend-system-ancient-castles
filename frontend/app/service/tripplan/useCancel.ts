"use client";
import axios from "axios";
import { useState } from "react";

export default function useCancel() {
  const [loading, setLoading] = useState(false);
  
  const cancelRoute = async (trip_id: number) => {
    const token = localStorage.getItem("token");
    
    setLoading(true);
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/trip/${trip_id}/cancel`, 
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log("Delete : " , response.data)
      window.location.reload();
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { cancelRoute, loadingCancel: loading };
}