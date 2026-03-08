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
            <div className="font-bold text-gray-700">
              Plan Name
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
          <span className="font-semibold text-sm text-gray-700 min-w-[120px]">
            Event Description:
          </span>
          <span className="text-sm text-gray-600 flex-1">
            {eventDescript || "No event description available"}
          </span>
        </div>
      </div>
    </div>
  );
}
