"use client"

import { Select, SelectItem } from "@heroui/react";
import { EventRecord } from "@/app/service/plan/useEvents";
import { CalendarDays } from "lucide-react";

interface SelectEventProps {
  events: EventRecord[];
  selectedEventId: number | null;
  onSelectionChange: (eventId: number | null) => void;
  isLoading: boolean;
}

export default function SelectEvent({ events, selectedEventId, onSelectionChange, isLoading }: SelectEventProps) {
  if (events.length === 0 && !isLoading) {
    return null; // ยังไม่เลือก
  }

  return (
    <Select
      label={
        <div className="font-bold text-md">
          เลือกเทศกาล/งานประเพณี
        </div>
      }
      placeholder="Select Event"
      // startContent={<CalendarDays size={18} />}
      selectedKeys={selectedEventId ? [selectedEventId.toString()] : []}
      onChange={(e) => {
        const value = e.target.value;
        onSelectionChange(value ? parseInt(value) : null);
      }}
      isLoading={isLoading}
      variant="flat"
      className="w-full"
      labelPlacement="outside"
    >
      {events.map((event) => (
        <SelectItem key={event.event_id.toString()}>
          {event.event_name}
        </SelectItem>
      ))}
    </Select>
  );
}
