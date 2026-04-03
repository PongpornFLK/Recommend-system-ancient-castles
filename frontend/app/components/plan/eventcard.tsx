"use client"

import { Card, CardBody } from "@heroui/react";
import { Info, Clock, Calendar } from "lucide-react";
import { EventRecord } from "@/app/service/plan/useEvents";

interface EventCardProps {
  event: EventRecord | null;
}

export default function EventCard({ event }: EventCardProps) {
  if (!event) {
    return null;
  }

  return (
    <Card className="w-full bg-white border border-tone-orange" shadow="none">
      <CardBody className="p-6">
        <div className="flex items-start gap-4">

          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold text-tone-orange">
              {event.event_name}
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              {event.event_description || "ไม่มีคำอธิบาย"}
            </p>

            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-tone-yellow" />
                <span>
                  {event.event_start_date} - {event.event_end_date}
                </span>
              </div>

              {(event.event_start_time || event.event_end_time) && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-tone-yellow" />
                  <span>
                    {event.event_start_time || "--:--"} - {event.event_end_time || "--:--"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
