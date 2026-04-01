"use client";
import React, { useCallback } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Pagination,
  Tooltip,
  Button,
} from "@heroui/react";
import { Settings, Trash2 } from "lucide-react";
import { EventData } from "../../../(admin)/manageevent/types";

interface EventTableProps {
  events: EventData[];
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
  onEdit: (data: EventData) => void;
  onDelete: (eventId: string) => void;
}

const headCol: { name: string; uid: keyof EventData | "action" | "event_date" | "event_time" }[] = [
  { name: "Event ID", uid: "event_id" },
  { name: "Event Name", uid: "event_name" },
  { name: "Castle Name", uid: "castle_name" },
  { name: "Event Description", uid: "event_description" },
  { name: "Event Date", uid: "event_date" },
  { name: "Event Time", uid: "event_time" },
  { name: "Action", uid: "action" },
];

export default function EventTable({
  events,
  page,
  pages,
  onPageChange,
  onEdit,
  onDelete,
}: EventTableProps) {
  const renderCell = useCallback(
    (data: EventData, columnKey: keyof EventData | "action" | "event_date" | "event_time") => {
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
          return (
            <div className="flex flex-row gap-2 text-xs">
              <span>
                {new Date(data.event_start_date).toLocaleDateString("en-GB", {
                  timeZone: "UTC",
                })}
              </span>
              <span className="text-gray-400">to</span>
              <span>
                {new Date(data.event_end_date).toLocaleDateString("en-GB", {
                  timeZone: "UTC",
                })}
              </span>
            </div>
          );
        case "event_time":
          return (
            <div className="flex flex-row items-center gap-1">
              <span>{data.event_start_time || "--:--"}</span>
              <span>-</span>
              <span>{data.event_end_time || "--:--"}</span>
            </div>
          );
        case "action":
          return (
            <div className="flex flex-row gap-2">
              <Tooltip content="Edit">
                <Button
                  onPress={() => onEdit(data)}
                  isIconOnly
                  className="text-tone-oldgray bg-white hover:text-tone-oldgray hover:bg-tone-cream"
                  size="sm"
                >
                  <Settings size={16} />
                </Button>
              </Tooltip>
              <Tooltip content="Delete">
                <Button
                  onPress={() => onDelete(data.event_id)}
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
    [onEdit, onDelete]
  );

  return (
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
              onChange={onPageChange}
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
        <TableBody emptyContent={"Don't Have History..."} items={events}>
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
  );
}
