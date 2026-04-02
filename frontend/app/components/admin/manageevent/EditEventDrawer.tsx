"use client";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Form,
  Input,
  DatePicker,
  TimeInput,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";
import { parseDate, Time, CalendarDate } from "@internationalized/date";
import { Settings, Map, Timer, TextAlignJustify, Type, CheckCheck } from "lucide-react";
import { useGetCastles } from "@/app/service/admin/manageevent/useGetCastles";
import { CastleResponse } from "@/app/(admin)/manageevent/types";

interface EditEventDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  eventName: string;
  setEventName: (name: string) => void;
  castleId: string;
  setCastleId: (id: string) => void;
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
  starTime: Time | null;
  setStartTime: (time: Time | null) => void;
  endTime: Time | null;
  setEndTime: (time: Time | null) => void;
  description: string;
  setDescription: (desc: string) => void;
  onUpdate: () => void;
}

export default function EditEventDrawer({
  isOpen,
  onOpenChange,
  eventName,
  setEventName,
  castleId,
  setCastleId,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  starTime,
  setStartTime,
  endTime,
  setEndTime,
  description,
  setDescription,
  onUpdate,
}: EditEventDrawerProps) {
  const { castles } = useGetCastles();

  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="flex flex-col gap-1">
              <div className="flex flex-row gap-3 text-2xl">
                <Settings size={36} />
                Settings Events
              </div>
            </DrawerHeader>
            <DrawerBody>
              <div className="overflow-y-auto">
                <Form onSubmit={(e) => { e.preventDefault(); onUpdate(); }}>
                  <Input
                    className="font-bold pb-5"
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
                    variant="bordered"
                    className="pb-5 font-bold"
                    label="Castle"
                    placeholder="Select Castle"
                    items={castles}
                    startContent={<Map size={16} />}
                    selectedKeys={castleId ? [castleId.toString()] : []}
                    onChange={(e: any) => setCastleId(e.target.value)}
                  >
                    {castles.map((place: CastleResponse) => (
                      <SelectItem key={place.castle_id}>
                        {place.castle_name}
                      </SelectItem>
                    ))}
                  </Select>
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <DatePicker
                      className="font-bold pb-5 w-full text-xs"
                      label="Start Date"
                      variant="bordered"
                      labelPlacement="outside-top"
                      selectorButtonPlacement="start"
                      value={startDate ? parseDate(startDate.toISOString().split("T")[0]) : undefined}
                      onChange={(e: CalendarDate | null) => {
                        if (e) {
                          const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                          const date = e.toDate(localTimeZone);
                          setStartDate(date);
                        }
                      }}
                    />
                    <DatePicker
                      className="font-bold pb-5 w-full text-xs"
                      label="End Date"
                      variant="bordered"
                      labelPlacement="outside-top"
                      selectorButtonPlacement="start"
                      value={endDate ? parseDate(endDate.toISOString().split("T")[0]) : undefined}
                      onChange={(e: CalendarDate | null) => {
                        if (e) {
                          const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                          const date = e.toDate(localTimeZone);
                          setEndDate(date);
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <TimeInput
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
                  <div className="pb-5" />
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
                </Form>
              </div>
            </DrawerBody>
            <DrawerFooter>
              <Button
                onClick={onClose}
                className="bg-white hover:bg-tone-red text-tone-red hover:text-white font-bold"
              >
                Cancel
              </Button>
              <Button
                color="success"
                onClick={onUpdate}
                className="w-full font-bold text-white"
              >
                Confirm
                <CheckCheck size={18} />
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
