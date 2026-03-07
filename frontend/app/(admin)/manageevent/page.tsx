"use client";
import {
  Button,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Input,
  Pagination,
  Tooltip,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
  Form,
  TimeInput,
  Textarea,
  addToast,
  DatePicker,
} from "@heroui/react";
import { parseDate, Time, CalendarDate } from "@internationalized/date";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Settings,
  Map,
  Type,
  TextAlignJustify,
  CheckCheck,
  Trash2,
  X,
  Timer,
} from "lucide-react";
import AdminBar from "@/app/components/admin/adminbar";
import ModalDelete from "@/app/components/admin/modal";
import Searching from "@/app/components/admin/searching";

// --- Interfaces ---
interface Castle {
  castle_id: string;
  castle_name: string;
}

interface EventData {
  event_id: string;
  event_name: string;
  castle_name: string;
  event_description: string;
  event_start: string;
  event_end: string;
  event_date: string;
  castle_id: string;
  castle?: Castle;
}

interface ApiResponse {
  total: number;
  items: EventData[];
}

export default function ManageEvent() {
  const [event, setEvent] = React.useState<ApiResponse | null>(null);
  const [eventData, setEventData] = React.useState<EventData[]>([]);
  const [formData, setFormData] = useState<ApiResponse | null>(null);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const rowSize = 5;
  const pages = Math.ceil(total / rowSize);

  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onOpenChange: onDrawerOpenChange } = useDisclosure();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onOpenChange: onModalOpenChange } = useDisclosure();

  const [eventName, setEventName] = useState("");
  const [castleName, setCastleName] = useState("");
  const [starTime, setStartTime] = useState<Time | null>(null);
  const [endTime, setEndTime] = useState<Time | null>(null);
  const [dateTime, setDateTime] = useState<Date>(new Date());
  const [description, setDescription] = useState("");

  const [eventId, setEventId] = useState<string>("");
  const [castleId, setCastleId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredEvents = eventData.filter(
    (event) =>
      event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.castle_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const headCol: { name: string; uid: keyof EventData | "action" }[] = [
    { name: "Event ID", uid: "event_id" },
    { name: "Event Name", uid: "event_name" },
    { name: "Castle Name", uid: "castle_name" },
    { name: "Event Description", uid: "event_description" },
    { name: "Event Date", uid: "event_date" },
    { name: "Event Start", uid: "event_start" },
    { name: "Event End", uid: "event_end" },
    { name: "Action", uid: "action" },
  ];

  const fetchEvent = useCallback(async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get<ApiResponse>(`http://127.0.0.1:8000/event/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: page,
          size: rowSize,
        },
      });

      setTotal(response.data.total);

      const mappedData = response.data.items.map((item: EventData) => ({
        event_id: item.event_id?.toString(),
        event_name: item.event_name || "",
        castle_name: item.castle?.castle_name || "",
        castle_id: item.castle?.castle_id.toString() || "",
        event_description: item.event_description || "",
        event_date: item.event_date,
        event_start: item.event_start,
        event_end: item.event_end,
      }));

      setEventData(mappedData);
      setEvent(response.data);
      setFormData(response.data);
    } catch (err) {
      console.error("Get event data err", err);
    }
  }, [page, rowSize]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await fetchEvent();
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [page, rowSize, fetchEvent]);

  const deleteEvent = useCallback(
    async (event_id: string) => {
      const token = localStorage.getItem("token");

      try {
        await axios.delete(
          `http://127.0.0.1:8000/event/${event_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        fetchEvent();
      } catch (err) {
        console.error("Delete Not success : ", err);
      }
    },
    [fetchEvent],
  );

  const updateEvent = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/event/${eventId}`,
        {
          event_name: eventName,
          event_description: description,
          event_date: dateTime,
          event_start: starTime?.toString(),
          event_end: endTime?.toString(),
          castle: {
            castle_id: castleId,
            castle_name: castleName,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEventName(response.data.event_name);
      setCastleName(response.data.castle?.castle_name);

      if (response.data.event_start) {
        const [startHour, startMinute] = response.data.event_start.split(":");
        setStartTime(new Time(parseInt(startHour), parseInt(startMinute)));
      }
      if (response.data.event_end) {
        const [endHour, endMinute] = response.data.event_end.split(":");
        setEndTime(new Time(parseInt(endHour), parseInt(endMinute)));
      }

      setDescription(response.data.event_description);
      setCastleId(response.data.castle?.castle_id);

      fetchEvent();

      addToast({
        hideIcon: true,
        title: "Update Success",
        classNames: {
          closeButton: "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
        },
        closeIcon: <X />,
        color: "success",
      });
    } catch (err) {
      console.error("Update Event error : ", err);
    }
  };

  const renderCell = useCallback(
    (data: EventData, columnKey: keyof EventData | "action") => {
      switch (columnKey) {
        case "event_id":
          return data.event_id;
        case "event_name":
          return data.event_name;
        case "castle_name":
          return data.castle_name || "";
        case "event_description":
          return data.event_description;
        case "event_date":
          return new Date(data.event_date).toLocaleDateString("en-US", {
            timeZone: "UTC",
          });
        case "event_start":
          return data.event_start;
        case "event_end":
          return data.event_end;
        case "action":
          return (
            <div className="flex flex-row gap-2">
              <Tooltip content="Edit">
                <Button
                  onPress={() => {
                    onDrawerOpen();
                    setEventId(data.event_id);
                    setEventName(data.event_name);
                    setCastleName(data.castle_name);
                    setDescription(data.event_description);
                    setDateTime(new Date(data.event_date));
                    setCastleId(data.castle_id);

                    const [startHour, startMinute] = data.event_start.split(":");
                    const [endHour, endMinute] = data.event_end.split(":");
                    setStartTime(new Time(parseInt(startHour), parseInt(startMinute)));
                    setEndTime(new Time(parseInt(endHour), parseInt(endMinute)));
                  }}
                  isIconOnly
                  className="text-tone-oldgray bg-white hover:text-tone-oldgray hover:bg-tone-cream"
                  size="sm"
                >
                  <Settings size={16} />
                </Button>
              </Tooltip>
              <Tooltip content="Delete">
                <Button
                  onPress={() => {
                    setEventId(data.event_id);
                    onModalOpen();
                  }}
                  isIconOnly
                  className="text-tone-red bg-white hover:bg-tone-red hover:text-white"
                  size="sm"
                >
                  <Trash2 size={16} />
                </Button>
              </Tooltip>
            </div>
          );
        default:
          const cellValue = data[columnKey as keyof EventData];
          if (typeof cellValue === "object" && cellValue !== null) {
            return "";
          }
          return cellValue as React.ReactNode;
      }
    },
    [onDrawerOpen, onModalOpen],
  );

  return (
    <section>
      <div>
        <AdminBar />
      </div>
      <div className="bg-white rounded-2xl mt-5">
        <div className="p-5">
          <div className="flex-1 gap-4 items-center">
            <Searching
              items={eventData.map((event) => ({
                key: event.event_id,
                title: event.event_name,
              }))}
              placeholder="Search events name..."
              onInputChange={(value) => {
                setSearchTerm(value);
              }}
              onSelectionChange={(key: React.Key | null) => {
                if (key) {
                  const selectedEvent = eventData.find((event) => event.event_id === key);
                  if (selectedEvent) {
                    setSearchTerm(selectedEvent.event_name);
                  }
                }
              }}
            />
          </div>
          <div className="mt-5 font-bold">Events Table</div>
          <div className="overflow-x-auto mt-5">
            <Table
              aria-label="Events Data"
              removeWrapper
              classNames={{
                wrapper: "min-w-full",
                table: "min-w-full",
                th: "bg-gray-50 text-gray-700 font-semibold",
                td: "border-b border-gray-100",
              }}
              bottomContent={
                <div className="flex w-full justify-center mt-2">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    classNames={{
                      cursor: "bg-tone-orange",
                    }}
                    page={page}
                    total={pages}
                    onChange={(page) => {
                      setPage(page);
                    }}
                  />
                </div>
              }
            >
              <TableHeader columns={headCol}>
                {(column) => (
                  <TableColumn key={column.uid} align="center">
                    {column.name}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody emptyContent={"Don't Have History..."} items={filteredEvents}>
                {(item) => (
                  <TableRow key={item.event_id}>
                    {(columnKey) => (
                      <TableCell>
                        {renderCell(item, columnKey as keyof EventData | "action")}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <Drawer isOpen={isDrawerOpen} onOpenChange={onDrawerOpenChange}>
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
                  <div>
                    <Form onSubmit={updateEvent}>
                      <Input
                        className="font-bold pb-5"
                        label="Event Name"
                        labelPlacement="outside-top"
                        placeholder={event?.items[0]?.event_name}
                        startContent={<TextAlignJustify size={18} />}
                        variant="bordered"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                      />
                      <Input
                        className="font-bold pb-5"
                        label="Castle"
                        labelPlacement="outside-top"
                        placeholder={event?.items[0]?.castle?.castle_name}
                        startContent={<Map size={16} />}
                        variant="bordered"
                        value={castleName}
                        onChange={(e) => setCastleName(e.target.value)}
                      />
                      <DatePicker
                        className="font-bold pb-5"
                        label="Pick Date"
                        variant="bordered"
                        labelPlacement="outside-top"
                        selectorButtonPlacement="start"
                        value={dateTime ? parseDate(dateTime.toISOString().split("T")[0]) : undefined}
                        onChange={(e: CalendarDate | null) => {
                          if (e) {
                            const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                            const date = e.toDate(localTimeZone);
                            setDateTime(date);
                          }
                        }}
                      />
                      <TimeInput
                        defaultValue={new Time(0, 0)}
                        description="outside-top"
                        label="Start Time"
                        labelPlacement="outside-top"
                        className="font-bold"
                        startContent={<Timer size={16} />}
                        variant="bordered"
                        value={starTime}
                        onChange={(val: Time | null) => setStartTime(val)}
                      />
                      <TimeInput
                        defaultValue={new Time(0, 0)}
                        description="outside-top"
                        label="End Time"
                        labelPlacement="outside-top"
                        className="font-bold"
                        startContent={<Timer size={16} />}
                        variant="bordered"
                        value={endTime}
                        onChange={(val: Time | null) => setEndTime(val)}
                      />
                      <Textarea
                        disableAnimation
                        disableAutosize
                        classNames={{
                          base: "max-w-xs",
                          input: "resize-y min-h-[40px] mt-3",
                        }}
                        isClearable
                        startContent={<Type size={18} className="mt-3" />}
                        variant="bordered"
                        labelPlacement="outside-top"
                        className="max-w-xs font-bold"
                        label="Description"
                        placeholder={event?.items[0]?.event_description}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Form>
                  </div>
                </DrawerBody>
                <DrawerFooter>
                  <Button
                    onClick={onClose}
                    className="bg-white text-tone-red border-2 hover:bg-tone-red hover:text-white font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    color="success"
                    onClick={updateEvent}
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
        <ModalDelete
          isOpen={isModalOpen}
          onOpenChange={onModalOpenChange}
          onEvent={() => deleteEvent(eventId)}
          item={eventId}
          size="md"
        />
      </div>
    </section>
  );
}