"use client";

import { Flag, MapPin, Plus } from "lucide-react";
import SelectPlace from "@/app/components/plan/selectplace";
import React, { useState, useEffect } from "react";
import { Spinner } from "@heroui/react";
import useCreateroute from "@/app/service/plan/useCreateroute";
import useEvents from "@/app/service/plan/useEvents";
import SelectEvent from "@/app/components/plan/selectevent";
import EventCard from "@/app/components/plan/eventcard";
import FromPlan from "./formplan";

interface RouteSelect {
  boxSelect: {
    id: number;
    placeId: string;
    placeName: string;
    latitude: number;
    longitude: number;
  }[];
  //   Data เดียวกัน
  setBoxSelect: React.Dispatch<
    React.SetStateAction<
      {
        id: number;
        placeId: string;
        placeName: string;
        latitude: number;
        longitude: number;
      }[]
    >
  >;
  currentPlace: string;
  isLoading: boolean;
  planName: string;
  setPlanName: (name: string) => void;
  selectedEventId: number | null;
  setSelectedEventId: (id: number | null) => void;
  setEventDescript: (desc: string) => void;
}

export default function Routeplan({
  boxSelect,
  setBoxSelect,
  currentPlace,
  isLoading,
  planName,
  setPlanName,
  selectedEventId,
  setSelectedEventId,
  setEventDescript,
}: RouteSelect) {
  const { locationCastle } = useCreateroute();
  const { events, loading: eventsLoading } = useEvents();


  const selectedEvent = selectedEventId !== null 
    ? events.find((e) => e.event_id === selectedEventId) || null 
    : null;

  useEffect(() => {
    if (selectedEvent) {
      setEventDescript(selectedEvent.event_description || "");
    } else {
      setEventDescript("");
    }
  }, [selectedEvent, setEventDescript]);

  return (
    <div className="bg-white rounded-2xl mt-5 p-6 w-full lg:w-3/5 lg:h-fit shadow-md border border-slate-100">
      <div className="space-y-4">
        <FromPlan placeName={planName} setPlaceName={setPlanName} />

        <div className="my-10 space-y-4">
          <SelectEvent
            events={events}
            selectedEventId={selectedEventId}
            onSelectionChange={setSelectedEventId}
            isLoading={eventsLoading}
          />
          <EventCard event={selectedEvent} />
        </div>

        <div className="flex items-start gap-3">
          <Flag size={24} className="text-tone-blue" />
          <div className="flex-1">
            <h3 className="font-semibold">ตำแหน่งปัจจุบัน :</h3>
            {isLoading ? (
              <div className="flex gap-5 mt-3">
                <Spinner size="sm" color="primary" />
                <p className="text-gray-600 text-sm">กำลังโหลดข้อมูลสถานที่</p>
              </div>
            ) : (
              <div className="text-gray-600 text-sm mt-3">{currentPlace}</div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Plus size={24} className="text-yellow-500" />
          <div className="flex-1">
            <div className="flex flex-row">
              <h1 className="font-semibold mr-2">เพิ่มจุดแวะพัก : </h1>
              <h1 className="text-gray-500">( ไม่บังคับ )</h1>
            </div>
            <div className="mt-2">
              <SelectPlace boxSelect={boxSelect} setBoxSelect={setBoxSelect} />
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin size={24} className="text-red-500" />
          <div className="flex-1 items-center">
            <h1 className="font-semibold">จุดหมาย :</h1>
            <p className="text-gray-600 text-sm mt-1">
              {locationCastle?.castle_name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
