"use client";

import { Input } from "@heroui/react";
import { Map } from 'lucide-react';


interface FromPlaceProps {
  placeName: string;
  setPlaceName: (name: string) => void;
}

export default function FromPlan({ placeName, setPlaceName }: FromPlaceProps) {
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
    </div>
  );
}
