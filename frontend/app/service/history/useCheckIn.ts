import axios from "axios";
import { useRouter } from "next/navigation";

export default function useCheckIn() {
  const router = useRouter();
  const CheckIn = async (castle_id: number, trip_id: number) => {
    const user_id = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    // console.log("USER ID", user_id, "CASTLE ID", castle_id, "TRIP ID", trip_id)
    try {
      // VisitHistory
      await axios.post(
        `http://127.0.0.1:8000/history/checkin/${user_id}`,
        {
          user_id: user_id,
          castle_id: castle_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // status to 'success'
      await axios.post(
        `http://127.0.0.1:8000/trip/${trip_id}/confirm`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Check-in and Confirmation complete");
      router.push("/history")
    } catch (err) {
      console.log("Error during Check-in/Confirmation:", err);
    }
  };

  return { CheckIn };
}
