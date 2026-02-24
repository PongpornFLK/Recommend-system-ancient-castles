"use client";

import { Chip, Button } from "@heroui/react";

import {
  Calendar,
  Navigation2,
  Flag,
  MapPin,
  Plus,
  List,
  Route,
} from "lucide-react";
import React, { useState } from "react";
import SelectPlace from "@/app/components/selectplace";
import { useSearchParams } from "next/navigation";

export default function Plan() {
  const [boxSelect, setBoxSelect] = useState([
    { id: 1, placeId: "", placeName: "" },
  ]);

  return (
    <section>
      <div className="bg-white rounded-2xl mt-5 p-6 shadow-none">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl md:text-3xl font-bold">My Plan</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Chip
                variant="bordered"
                color="warning"
                startContent={<Calendar size={14} />}
                size="md"
              >
                Start Date
              </Chip>
              <div className="text-sm sm:text-base">12/12/2024 08:00</div>
            </div>

            <div className="flex items-center gap-2">
              <Chip
                variant="bordered"
                color="warning"
                startContent={<Navigation2 size={14} />}
                size="md"
              >
                Destination
              </Chip>
              <div className="text-sm sm:text-base">วัดพระธาตุดอยสุเทพ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Left - Container */}
      <div className="flex flex-col lg:flex-row gap-5 lg:items-start">
        <div className="bg-white rounded-2xl mt-5 p-6 w-full lg:w-3/5 lg:h-fit">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Flag size={24} className="text-green-500" />
              <div className="flex-1">
                <h3 className="font-semibold">ตำแหน่งปัจจุบัน :</h3>
                <p className="text-gray-600 text-sm">
                  บ้านท่าหลวง ตำบล ท่าหลวง อำเภอพิมาย นครราชสีมา
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Plus size={24} className="text-yellow-500" />
              <div className="flex-1 ">
                <h3 className="font-semibold">เพิ่มจุดแวะพัก :</h3>
                <div className="mt-2">
                  <SelectPlace
                    boxSelect={boxSelect}
                    setBoxSelect={setBoxSelect}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin size={24} className="text-red-500" />
              <div className="flex-1 items-center">
                <h3 className="font-semibold">จุดหมาย :</h3>
                <p className="text-gray-600 text-sm mt-1">
                  วัดพระธาตุดอยสุเทพ ตำบล สุเทพ อำเภอเมืองเชียงใหม่
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Container */}
        <div className="bg-white rounded-2xl mt-5 p-6 w-full lg:w-2/5 lg:h-fit">
          <h2 className="text-xl font-bold mb-4">Result</h2>
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>เวลาเดินทางทั้งหมด :</div>
              <div className="font-semibold">13 นาที</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>ระยะทางทั้งหมด :</div>
              <div className="font-semibold">7.5 กิโลเมตร</div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 font-bold">ลำดับการเดินทาง :</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">บ้านท่าหลวง</div>
              {boxSelect
                .filter((box) => box.placeName && box.placeName !== "")
                .map((box, index) => (
                  <div key={box.id} className="flex gap-2">
                    {">"} {index + 1}. {box.placeName}
                  </div>
              ))}
              <div className="flex items-center gap-2">Destination</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              startContent={<List size={16} />}
              className="flex-1 bg-tone-lightgreen text-white font-bold"
            >
              View Details
            </Button>

            <Button
              startContent={<Route size={16} />}
              className="flex-1 bg-tone-yellow text-white font-bold"
            >
              View Route
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}