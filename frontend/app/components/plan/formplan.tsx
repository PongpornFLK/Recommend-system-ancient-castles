"use client";

import useEventdescript from "@/app/service/plan/useEventdescript";
import { Input } from "@heroui/react";
import { Map } from 'lucide-react';


interface FromPlaceProps {
  placeName: string;
  setPlaceName: (name: string) => void;
}

export default function FromPlan({ placeName, setPlaceName }: FromPlaceProps) {
  const { eventDescript } = useEventdescript();

  return (
    <div className="space-y-4">
      <div className="w-full">
        <Input
          label={
            <div className="font-bold text-md">
              ชื่อแผน
            </div>
          }
          type="text"
          labelPlacement="outside-top"
          variant="flat"
          placeholder="Type your plan name"
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          className="flex-1"
          startContent={<Map size={18} />}
          suppressHydrationWarning
        />
      </div>

      <div className="my-8">
        <div className="flex items-start gap-3">
          <span className="font-semibold text-md min-w-[120px]">
            คำอธิบายกิจกรรม
          </span>
          <span className="text-gray-600 flex-1 text-md">
            {eventDescript || "No event description available"}
          </span>
        </div>
      </div>
    </div>
  );
}
