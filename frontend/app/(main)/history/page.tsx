"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { FolderClock } from "lucide-react";
import React from "react";


export default function History() {
  interface HistoryData {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: string;
    planName: string;
    eventDescription: string;
  }

  const headCol = [
    { name: "Date", uid: "date" },
    { name: "Start-Time", uid: "startTime" },
    { name: "End-Time", uid: "endTime" },
    { name: "Duration", uid: "duration" },
    { name: "Plan name", uid: "planName" },
    { name: "Event description", uid: "eventDescription" },
    { name: "Action", uid: "action" },
];

  const renderCell = React.useCallback((data :  HistoryData, columnKey : keyof HistoryData | "action") => {
    const cellValue = data[columnKey as keyof HistoryData];

    switch (columnKey) {
      case "date":
        return <TableCell>{data.date}</TableCell>;
      case "startTime":
        return <TableCell>{data.startTime}</TableCell>;
      case "endTime":
        return <TableCell>{data.endTime}</TableCell>;
      case "duration":
        return <TableCell>{data.duration}</TableCell>;
      case "planName":
        return <TableCell>{data.planName}</TableCell>;
      case "eventDescription":
        return <TableCell>{data.eventDescription}</TableCell>;
      case "action":
        return (
          <TableCell>
            <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
              View
            </button>
          </TableCell>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <section>
      <div className="flex flex-row gap-3 my-5">
        <FolderClock size={38} color="var(--color-tone-oldgray)" />
        <h1 className="font-bold text-3xl text-tone-oldgray">History</h1>
      </div>
      <div>
        <Table aria-label="Example static collection table">
          <TableHeader columns={headCol}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={"Don't Have History..."} items={[] as HistoryData[]}>
            {(item) => (
              <TableRow>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey as keyof HistoryData | "action")}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
