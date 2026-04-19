"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useDisclosure, addToast } from "@heroui/react";
import { Time } from "@internationalized/date";
import { X } from "lucide-react";
import AdminBar from "@/app/components/admin/adminbar";
import ModalDelete from "@/app/components/admin/modal";
import Searching from "@/app/components/admin/searching";
import EventTable from "../../components/admin/manageevent/EventTable";
import EditEventDrawer from "../../components/admin/manageevent/EditEventDrawer";
import { EventData } from "./types";
import { useGetEvents } from "@/app/service/admin/manageevent/useGetEvents";
import { useUpdateEvent } from "@/app/service/admin/manageevent/useUpdateEvent";
import { useDeleteEvent } from "@/app/service/admin/manageevent/useDeleteEvent";
import ModalAdd from "@/app/components/admin/manageevent/modalAdd";

export default function ManageEvent() {
  const [page, setPage] = useState(1);
  const rowSize = 20;

  // Custom hooks
  const { events, loading, error, total, fetchEvents } = useGetEvents();
  const { updateEvent: updateEventHook } = useUpdateEvent();
  const { deleteEvent: deleteEventHook } = useDeleteEvent();

  const pages = Math.ceil(total / rowSize);

  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onOpenChange: onDrawerOpenChange,
  } = useDisclosure();
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onOpenChange: onModalOpenChange,
  } = useDisclosure();

  // Form states
  const [eventName, setEventName] = useState("");
  const [starTime, setStartTime] = useState<Time | null>(null);
  const [endTime, setEndTime] = useState<Time | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [eventId, setEventId] = useState<string>("");
  const [castleId, setCastleId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredEvents = events.filter(
    (event) => {
      const searchLower = (searchTerm || "").toLowerCase();
      const eventNameLower = (event?.event_name || "").toLowerCase();
      const castleNameLower = (event?.castle_name || "").toLowerCase();

      return eventNameLower.includes(searchLower) || castleNameLower.includes(searchLower);
    }
  );

  useEffect(() => {
    fetchEvents(page, rowSize);
  }, [page, rowSize, fetchEvents]);

  const addEvent = async () => {
    try {
      fetchEvents(page, rowSize);

      addToast({
        hideIcon: true,
        title: "Add Event Success",
        classNames: {
          closeButton:
            "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
        },
        closeIcon: <X />,
        color: "success",
      });
    } catch (err) {
      console.error("Create Not success : ", err);
    }
  };

  const deleteEvent = useCallback(
    async (id: string) => {
      try {
        await deleteEventHook(id);
        fetchEvents(page, rowSize);
      } catch (err) {
        console.error("Delete Not success : ", err);
      }
    },
    [deleteEventHook, fetchEvents, page, rowSize],
  );

  const updateEvent = async () => {
    try {
      await updateEventHook(eventId, {
        event_name: eventName,
        event_description: description,
        event_start_date: startDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
        event_end_date: endDate.toISOString().split("T")[0],
        event_start_time: starTime?.toString(),
        event_end_time: endTime?.toString(),
        castle_id: parseInt(castleId),
      });

      fetchEvents(page, rowSize);

      addToast({
        hideIcon: true,
        title: "Update Success",
        classNames: {
          closeButton:
            "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
        },
        closeIcon: <X />,
        color: "success",
      });

      onDrawerOpenChange();
    } catch (err) {
      console.error("Update Event error : ", err);
    }
  };

  const handleEdit = (data: EventData) => {
    setEventId(data.event_id);
    setEventName(data.event_name);
    setDescription(data.event_description);
    setStartDate(new Date(data.event_start_date));
    setEndDate(new Date(data.event_end_date));
    setCastleId(data.castle_id.toString());

    if (data.event_start_time) {
      const [startHour, startMinute] = data.event_start_time.split(":");
      setStartTime(new Time(parseInt(startHour), parseInt(startMinute)));
    }
    if (data.event_end_time) {
      const [endHour, endMinute] = data.event_end_time.split(":");
      setEndTime(new Time(parseInt(endHour), parseInt(endMinute)));
    }
    onDrawerOpen();
  };

  const handleDeleteClick = (id: string) => {
    setEventId(id);
    onModalOpen();
  };

  return (
    <section className="min-h-screen bg-gray-50 pb-10">
      <AdminBar />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
              <div className="w-full flex flex-row gap-4 justify-between">
                <div className="flex-1">
                  <Searching
                    items={events.map((event: EventData) => ({
                      key: event.event_id,
                      title: event.event_name,
                    }))}
                    placeholder="Search events name..."
                    onInputChange={(value) => setSearchTerm(value)}
                    onSelectionChange={(key) => {
                      if (key) {
                        const selectedEvent = events.find(
                          (event) => event.event_id === key,
                        );
                        if (selectedEvent) {
                          setSearchTerm(selectedEvent.event_name);
                        }
                      }
                    }}
                  />
                </div>
                <ModalAdd onSuccess={addEvent} />
              </div>
              <div className="font-bold text-xl text-gray-800">
                Events Management
              </div>
            </div>

            <EventTable
              events={filteredEvents}
              page={page}
              pages={pages}
              onPageChange={setPage}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          </div>

          <EditEventDrawer
            isOpen={isDrawerOpen}
            onOpenChange={onDrawerOpenChange}
            eventName={eventName}
            setEventName={setEventName}
            castleId={castleId}
            setCastleId={setCastleId}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            starTime={starTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            description={description}
            setDescription={setDescription}
            onUpdate={updateEvent}
          />

          <ModalDelete
            isOpen={isModalOpen}
            onOpenChange={onModalOpenChange}
            onEvent={() => deleteEvent(eventId)}
            label="EventName"
            item={events.find((e) => e.event_id === eventId)?.event_name || ""}
            size="md"
          />
        </div>
      </div>
    </section>
  );
}
