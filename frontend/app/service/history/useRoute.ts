import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL } from "@/app/config";

interface RouteData {
  route_name: string;
  description_gps: string;
}

export default function useRoute(plan_id: number) {
  const [routeData, setRouteData] = useState<RouteData[]>([]);
  const [routeSeq, setRouteSeq] = useState("");
  const [mapUrl, setMapUrl] = useState("");

  useEffect(() => {
    const fetchRoute = async () => {
      {
        const token = localStorage.getItem("token");

        try {
          const response = await axios.get(`${API_URL}/route/trip/${plan_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          // console.log("Route :", response.data);
          // console.log("Route :", response.data.route_trip[0].description_gps);
          setRouteData(response.data);
          setRouteSeq(response.data.route_trip[0].description_gps);
          setMapUrl(response.data.map_url);
        } catch (err) {
          console.log(err);
        }
      }
    };
    fetchRoute();
  }, [plan_id]);
  return { routeData, routeSeq ,mapUrl };
}
