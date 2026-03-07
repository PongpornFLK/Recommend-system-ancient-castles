"use client";

import useTrip from "@/app/service/tripplan/useTrip";
import { Accordion, AccordionItem, Chip, Image, Button } from "@heroui/react";
import useCancel from "@/app/service/tripplan/useCancel";
import useDelete from "@/app/service/tripplan/useDelete";
import Tracker from "./tracker";
import useCheckIn from "@/app/service/history/useCheckIn";

export default function TripAccord() {
  const { CheckIn } = useCheckIn();
  const { tripData } = useTrip();
  const { cancelRoute, loadingCancel } = useCancel();
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
        {tripData.map((place, key) => (
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
            <div className="flex flex-col">
              <div className="flex flex-row gap-2">
                <span className="font-bold">ชื่อแผนการเดินทาง :</span>
                <span>{place.plan_name}</span>
              </div>
              <div className="flex flex-row gap-2">
                <span className="font-bold">รายละเอียดเทศกาล :</span>
                <span>{place.event_description}</span>
              </div>
              <div className="flex flex-row gap-2">
                <span className="font-bold">จุดหมาย :</span>
                <span>{place.destination_name}</span>
              </div>
              <div className="flex flex-row gap-2">
                <span className="font-bold">วันที่เริ่มเดินทาง :</span>
                <span>{formatThaiDate(place.start_date)}</span>
              </div>
              <div className="flex flex-row gap-2">
                <span className="font-bold">คาดการณ์ระยะเวลาเดินทาง :</span>
                <span>{place.duration} นาที</span>
              </div>
              {place.status === "travelling" &&
                place.destination_lat &&
                place.destination_lng && (
                  <Tracker
                    tripId={place.plan_id}
                    destLat={place.destination_lat}
                    destLng={place.destination_lng}
                  />
                )}
            </div>
            {place.status === "travelling" && (
              <div className="flex flex-row gap-3">
                <Button
                  color="danger"
                  className="font-bold my-5"
                  isLoading={loadingCancel}
                  onClick={() => cancelRoute(place.plan_id)}
                >
                  Cancel Trip
                </Button>
                <Button
                  color="success"
                  className="font-bold my-5 text-white"
                  onClick={() => CheckIn(place.castle_id, place.plan_id)}
                >
                  Check-In
                </Button>
              </div>
            )}
            {place.status === "cancel" && (
              <Button
                color="danger"
                className="font-bold my-5"
                isLoading={loadingDelete}
                onClick={() => deleteRoute(place.plan_id)}
              >
                Delete Trip
              </Button>
            )}
            {place.status === "success" && (
              <Button
                color="danger"
                className="font-bold my-5"
                isLoading={loadingDelete}
                onClick={() => deleteRoute(place.plan_id)}
              >
                Delete Trip
              </Button>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
