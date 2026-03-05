"use client";

import useTrip from "@/app/service/tripplan/useTrip";
import { Accordion, AccordionItem, Chip, Image ,Button } from "@heroui/react";

export default function TripAccord() {
  const { tripData, isLoaded, error } = useTrip();
  return (
    <>
      <Accordion variant="splitted">
        {tripData.map((place, key) => (
          <AccordionItem
            key={key}
            aria-label="Accordion 1"
            startContent={
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
            <div className="flex flex-col">
              <span>ชื่อแผนการเดินทาง : {place.plan_name}</span>
              <span>รายละเอียด : {place.event_description}</span>
              <span>จุดหมาย : {place.destination_name}</span>
            </div>
            <div>
                <Button color="danger" className="font-bold">cancel</Button>
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
