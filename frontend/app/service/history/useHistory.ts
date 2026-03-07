import axios from "axios";
import { useEffect, useState } from "react";

export interface HistoryData {
  plan_id: string;
  date: string;
  start_date: string;
  end_date: string;
  duration: string;
  plan_name: string;
  event_description: string;
}

export default function useHistory() {
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");

      // console.log("Token:", token);
      // console.log("User_id:", userId);

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/history/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              page: 1,
              size: 20,
            },
          },
        );

        // console.log("API Response:", response.data);
        // console.log("Items:", response.data.items);

        const historyData = response.data.items.map((item: HistoryData) => ({
          plan_id: item.plan_id?.toString(),
          date: new Date(item.start_date).toLocaleDateString(),
          start_date: new Date(item.start_date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          end_date: new Date(item.end_date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          duration: item.duration?.toString() || "",
          plan_name: item.plan_name || "",
          event_description: item.event_description || "",
        }));

        // console.log("Transformed Data:", historyData);

        setHistoryData(historyData);
      } catch (err) {
        console.error("Login Error", err);
      }
    };

    fetchHistory();
  }, []);
  return { historyData };
}
