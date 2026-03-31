import api from "@/app/service/api";
import { useRouter } from "next/navigation";
import { MapStaticImg } from "./mapImg";

export default function useCheckIn() {
  const router = useRouter();
  const CheckIn = async (
    castle_id: number,
    trip_id: number,
    currentLat: number,
    currentLng: number,
    waypoint: {
      lat: number;
      lng: number;
    }[],
    destLat: number,
    destLng: number,
  ) => {
    const user_id = localStorage.getItem("user_id");
    const mapImg = MapStaticImg(
      currentLat,
      currentLng,
      destLat,
      destLng,
      waypoint,
    );

    // console.log("Gen Map ", mapImg);
    // console.log("USER ID", user_id, "CASTLE ID", castle_id, "TRIP ID", trip_id)
    try {
      // VisitHistory
      await api.post(`/history/checkin/${user_id}`, {
        user_id: user_id,
        castle_id: castle_id,
      });

      // status to 'success'
      await api.post(`/trip/${trip_id}/confirm`, {
        map_url: mapImg,
      });

      console.log("Check-in and Confirmation complete");
      router.push("/history");
    } catch (err) {
      console.log("Error during Check-in/Confirmation:", err);
    }
  };

  return { CheckIn };
}
