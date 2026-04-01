"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  useDisclosure,
  Form,
  Input,
  DatePicker,
  TimeInput,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";
import { CirclePlus, TextAlignJustify, Timer, Type } from "lucide-react";
import { useState } from "react";
import { parseDate, Time, CalendarDate } from "@internationalized/date";
import { useAddEvent } from "@/app/service/admin/manageevent/useAddEvent";
import { useGetCastles } from "@/app/service/admin/manageevent/useGetCastles";
import { UpdateEventPayload } from "@/app/(admin)/manageevent/types";
import { CastleResponse } from "@/app/(admin)/manageevent/types";

interface AddEventData {
  onSuccess: () => void;
}

export default function ModalAdd({ onSuccess }: AddEventData) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  // Input Data
  const [eventName, setEventName] = useState("");
  const [castleId, setCastleId] = useState("");
  const [starTime, setStartTime] = useState<Time | null>(null);
  const [endTime, setEndTime] = useState<Time | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");

  // Custom hooks
  const { addEvent } = useAddEvent();
  const { castles } = useGetCastles();

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // จะได้ "2026-04-01"
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: UpdateEventPayload = {
        event_name: eventName,
        event_description: description,
        event_start_date: formatLocalDate(startDate),
        event_end_date: formatLocalDate(endDate),
        event_start_time: starTime?.toString() || "00:00:00",
        event_end_time: endTime?.toString() || "00:00:00",
        castle_id: parseInt(castleId), // ส่ง castle_id โดยตรงเป็น int
      };

      console.log("payload", payload.event_end_date);
      await addEvent(payload);

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error : ", err);
    }
  };
  return (
    <>
      <Button
        onPress={onOpen}
        radius="full"
        color="success"
        className="font-bold text-white"
        startContent={<CirclePlus />}
      >
        Add Event
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        size="2xl"
      >
        <ModalContent>
            <>
              <ModalHeader className="flex flex-col gap-1 text-3xl">
                Add Event
              </ModalHeader>
              <ModalBody>
                <Form className="w-full" onSubmit={onSubmit}>
                  <div className="flex flex-row gap-4 w-full">
                    <Input
                      isRequired
                      className="font-bold"
                      label="Event Name"
                      labelPlacement="outside-top"
                      placeholder="Event Name"
                      startContent={<TextAlignJustify size={18} />}
                      variant="bordered"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />
                    <Select
                    labelPlacement="outside-top"
                      isRequired
                      variant="bordered"
                      className="max-w-xs font-bold"
                      label="Select Castle"
                      items={castles}
                      selectedKeys={castleId}
                      onChange={(e) => setCastleId(e.target.value)}
                    >
                      {castles.map((place: CastleResponse) => (
                        <SelectItem key={place.castle_id}>
                          {place.castle_name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  <div className="flex flex-row sm:flex-row gap-4 w-full">
                    <DatePicker
                      hideTimeZone
                      isRequired
                      showMonthAndYearPickers
                      className="font-bold w-full w-full text-xs"
                      label="Start Date"
                      variant="bordered"
                      labelPlacement="outside-top"
                      selectorButtonPlacement="start"
                      value={
                        startDate
                          ? parseDate(formatLocalDate(startDate))
                          : undefined
                      }
                      onChange={(e: CalendarDate | null) => {
                        if (e) {
                          const localDate = new Date(
                            e.year,
                            e.month - 1,
                            e.day,
                          );
                          setStartDate(localDate);
                        }
                      }}
                    />
                    <DatePicker
                      hideTimeZone
                      isRequired
                      showMonthAndYearPickers
                      className="font-bold w-full w-full text-xs"
                      label="End Date"
                      variant="bordered"
                      labelPlacement="outside-top"
                      selectorButtonPlacement="start"
                      value={
                        endDate
                          ? parseDate(formatLocalDate(endDate))
                          : undefined
                      }
                      onChange={(e: CalendarDate | null) => {
                        if (e) {
                          const localDate = new Date(
                            e.year,
                            e.month - 1,
                            e.day,
                          );
                          setEndDate(localDate);
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-row sm:flex-row gap-4 w-full">
                    <TimeInput
                      isRequired
                      defaultValue={new Time(0, 0)}
                      label="Start Time"
                      labelPlacement="outside-top"
                      className="font-bold w-full"
                      startContent={<Timer size={16} />}
                      variant="bordered"
                      value={starTime}
                      onChange={(val: Time | null) => setStartTime(val)}
                    />
                    <TimeInput
                      isRequired
                      defaultValue={new Time(0, 0)}
                      label="End Time"
                      labelPlacement="outside-top"
                      className="font-bold w-full"
                      startContent={<Timer size={16} />}
                      variant="bordered"
                      value={endTime}
                      onChange={(val: Time | null) => setEndTime(val)}
                    />
                  </div>
                  <div className="w-full">
                    <Textarea
                      disableAnimation
                      disableAutosize
                      classNames={{
                        base: "w-full",
                        input: "resize-y min-h-[100px] mt-3",
                      }}
                      isClearable
                      startContent={<Type size={18} className="mt-3" />}
                      variant="bordered"
                      labelPlacement="outside-top"
                      className="w-full font-bold"
                      label="Description"
                      placeholder="Event Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="bordered" className="bg-tone-orange text-white font-bold">
                    Confirm
                  </Button>
                </Form>
              </ModalBody>
            
            </>
        </ModalContent>
      </Modal>
    </>
  );
}
