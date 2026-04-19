import api from "@/app/service/api";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function useEventdescript() {
  const searchParams = useSearchParams();
  const castle_id = searchParams.get("castle_id")

  // const castle_id = 10;
  const [eventDescript, setEventDescript] = useState("");
  const [eventId, setEventId] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!castle_id) return;

      try {
        const respone = await api.get(`/description/${castle_id}`);
        console.log("fetchEvent", respone.data)
        setEventDescript(respone.data.event_description)
        setEventId(respone.data.event_id)
      } catch (err) {
        console.log(err);
      }
    };
    fetchEvent();
  }, [castle_id]);

  // re-useEffect เมื่อ castle_id เปลี่ยน

  return { eventDescript, eventId };
}
