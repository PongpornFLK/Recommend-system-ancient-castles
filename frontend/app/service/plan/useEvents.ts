import api from "@/app/service/api";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export interface EventRecord {
  event_id: number;
  castle_id: number;
  event_name: string;
  event_description: string;
  event_start_date: string;
  event_end_date: string;
  event_start_time: string;
  event_end_time: string;
}

export default function useEvents() {
  const searchParams = useSearchParams();
  const castle_id = searchParams.get("castle_id");

  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!castle_id) return;
      setLoading(true);
      try {
        const response = await api.get(`/event/description/${castle_id}`);
        setEvents(response.data);
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [castle_id]);

  return { events, loading };
}
