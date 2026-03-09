"use client";

import useTrip, { TripData } from "@/app/service/tripplan/useTrip";
import { Accordion, AccordionItem, Chip, Image, Button } from "@heroui/react";
import { ListIcon, MapPin, Calendar, Info, Trash2 } from "lucide-react";
import useDelete from "@/app/service/tripplan/useDelete";
import Tracker from "./tracker";

import TripDetail from "./detail";

export default function TripAccord() {
  const { tripData } = useTrip();
  const { deleteRoute, loadingDelete } = useDelete();
  const formatThaiDate = (dateString: string) => {
    if (!dateString) return "ไม่ระบุเวลา";
    const date = new Date(dateString);

    return (
      date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Bangkok",
      }) + " น."
    );
  };
  return (
    <>
      <Accordion variant="splitted">
        {tripData.map((place: TripData, key) => (
          <AccordionItem
            key={key}
            aria-label="Accordion 1"
            startContent={
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src="/assets/tripplan/travel.png" width={50}></Image>
            }
            title={
              <div className="flex flex-row gap-3 font-bold text-xl">
                {place.plan_name}
                {place.status == "travelling" ? (
                  <Chip
                    classNames={{
                      base: "bg-tone-yellowpastel",
                      content: "text-white font-bold",
                    }}
                  >
                    {place.status}
                  </Chip>
                ) : place.status == "success" ? (
                  <Chip
                    classNames={{
                      base: "bg-tone-greenpastel",
                      content: "text-white font-bold",
                    }}
                  >
                    {place.status}
                  </Chip>
                ) : (
                  place.status == "cancel" && (
                    <Chip
                      classNames={{
                        base: "bg-tone-redpastel",
                        content: "text-white font-bold",
                      }}
                    >
                      {place.status}
                    </Chip>
                  )
                )}
              </div>
            }
          >
            <TripDetail
              place={place}
              formatThaiDate={formatThaiDate}
              loadingDelete={loadingDelete}
              deleteRoute={deleteRoute}
            />
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
