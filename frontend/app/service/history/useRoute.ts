import api from "@/app/service/api";
import { useEffect, useState } from "react";

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
      try {
        const response = await api.get(`/route/trip/${plan_id}`);
        // console.log("Route :", response.data);
        // console.log("Route :", response.data.route_trip[0].description_gps);
        setRouteData(response.data);
        setRouteSeq(response.data.route_trip[0].description_gps);
        setMapUrl(response.data.map_url);
      } catch (err) {
        console.log(err);
      }
    };
    fetchRoute();
  }, [plan_id]);
  return { routeData, routeSeq ,mapUrl };
}
