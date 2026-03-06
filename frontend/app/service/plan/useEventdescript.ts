import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function useEventdescript() {
  const searchParams = useSearchParams();
  const castle_id = searchParams.get("castle_id")

  // const castle_id = 10;
  const [eventDescript , setEventDescript] = useState("");
  const [ eventId , setEventId] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      const token = localStorage.getItem("token")

      if (!castle_id) return;

      try {
        const respone = await axios.get(
          `http://127.0.0.1:8000/event/event/description/${castle_id}`,{
            headers : {
              Authorization : `Bearer ${token}`
            }
          }
      
        );
        console.log("fetchEvent" ,respone.data)
        setEventDescript(respone.data.event_description)
        setEventId(respone.data.event_id)
      } catch (err) {
        console.log(err);
      }
    };
    fetchEvent();
  }, [castle_id]);

  // [castle_id]

  return {eventDescript , eventId};
}
