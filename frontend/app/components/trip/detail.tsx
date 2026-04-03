"use client";

import { Button } from "@heroui/react";
import { ListIcon, MapPin, Info, Calendar, Trash2 } from "lucide-react";
import Tracker from "./tracker";
import { TripData } from "@/app/service/tripplan/useTrip";

interface TripDetailProps {
  place: TripData;
  formatThaiDate: (date: string) => string;
  loadingDelete: boolean;
  deleteRoute: (id: number) => void;
}

const TripDetail = ({
  place,
  formatThaiDate,
  loadingDelete,
  deleteRoute,
}: TripDetailProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-2">
      {/* Left Column: Plan & Destination */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex gap-4">
          <div className="p-3 bg-stone-100 rounded-2xl h-fit text-stone-500">
            <ListIcon size={18} />
          </div>
          <div>
            <h4 className="font-bold text-tone-orange mb-1.5">
              ชื่อแผนการเดินทาง
            </h4>
            <p className=" text-sm font-bold leading-snug">{place.plan_name}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="p-3 bg-stone-100 rounded-2xl h-fit text-stone-500">
            <MapPin size={18} />
          </div>
          <div>
            <h4 className="font-bold text-tone-orange uppercase mb-1.5">
              จุดหมาย
            </h4>
            <p className="text-sm font-bold text-stone-700 leading-snug">
              {place.destination_name || "ไม่ระบุจุดหมาย"}
            </p>
          </div>
        </div>
      </div>

      {/* Middle Column: Event Detail & Date */}
      <div className="lg:col-span-6 space-y-6 mb-3">
        <div className="flex gap-4">
          <div className="p-3 bg-stone-100 rounded-2xl h-fit text-stone-500">
            <Calendar size={18} />
          </div>
          <div>
            <h4 className="font-bold text-tone-orange mb-1.5">
              วันที่เริ่มเดินทาง
            </h4>
            <p className="text-sm font-bold text-stone-700">
              {formatThaiDate(place.start_date)}{" "}
              <span className="text-sm font-normal text-stone-400 ml-1">
                ({place.duration} นาที)
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="p-3 bg-stone-100 rounded-2xl h-fit text-stone-500">
            <Info size={18} />
          </div>
          <div>
            <h4 className="font-bold text-tone-orange uppercase mb-1.5">
              รายละเอียดเทศกาล
            </h4>
            {place.event_name ? (
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold">{place.event_name}</p>
                <div className="text-xs text-stone-500 flex flex-col sm:flex-row sm:gap-3">
                  <span>วันที {place.event_start_date} ถึง {place.event_end_date}</span>
                  {(place.event_start_time || place.event_end_time) && (
                    <span>เวลา {place.event_start_time || "--:--"} - {place.event_end_time || "--:--"}</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm font-bold text-stone-500">
                {place.event_description === "none" ? "ไม่ได้ระบุเทศกาล" : place.event_description || "ไม่ได้ระบุเทศกาล"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Tracking & Actions */}
      <div className="lg:col-span-3 lg:pl-6">
        {place.status === "travelling" &&
          place.destination_lat &&
          place.destination_lng && (
            <Tracker
              trip_id={place.plan_id}
              destLat={place.destination_lat}
              destLng={place.destination_lng}
              castle_id={place.castle_id}
            />
          )}

        {(place.status === "cancel" || place.status === "success") && (
          <div className="flex flex-col justify-end items-end h-full py-1">
            <Button
              className="font-bold text-xs rounded-xl bg-white text-tone-red hover:bg-tone-red hover:text-white"
              startContent={<Trash2 size={16} />}
              isLoading={loadingDelete}
              onClick={() => deleteRoute(place.plan_id)}
            >
              Delete Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDetail;
