"use client";

import useEventdescript from "@/app/service/plan/useEventdescript";
import { Input } from "@heroui/react";

interface FromPlaceProps {
  placeName : string,
  setPlaceName : (name : string) => void
}

export default function FromPlan({ placeName , setPlaceName} :FromPlaceProps) {
  const {eventDescript} = useEventdescript();

  return (
    <div>
      <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
        <Input
          label="Plan Name"
          type="email"
          labelPlacement="outside-left"
          variant="bordered"
          placeholder="Type your plan name"
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          isRequired
        />
      </div>
      <div className="gap-4">
        <span>
          Event {eventDescript}
        </span>
      </div>
    </div>
  );
}
