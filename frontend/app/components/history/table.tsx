"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
} from "@heroui/react";
import React from "react";
import useHistory, { HistoryData } from "@/app/service/history/useHistory";
import Buttonview from "./buttonview";

export default function TableHistory() {
  const { historyData } = useHistory();

  const headCol = [
    { name: "Date", uid: "date" },
    { name: "Start-Time", uid: "start_date" },
    { name: "End-Time", uid: "end_date" },
    { name: "Duration", uid: "duration" },
    { name: "Plan name", uid: "plan_name" },
    { name: "Event description", uid: "event_description" },
    { name: "Action", uid: "action" },
  ];

  const renderCell = React.useCallback(
    (data: HistoryData, columnKey: keyof HistoryData | "action") => {
      const cellValue = data[columnKey as keyof HistoryData];

      console.log("Render Cell:", columnKey, data);

      switch (columnKey) {
        case "date":
          return (
            <div>
              <Chip radius="md" color="warning" variant="bordered">
                {data.date}
              </Chip>
            </div>
          );
        case "start_date":
          return data.start_date;
        case "end_date":
          return data.end_date;
        case "duration":
          return data.duration;
        case "plan_name":
          return data.plan_name;
        case "event_description":
          return data.event_description;
        case "action":
          return <Buttonview plan_id={data.plan_id} />;
        default:
          return cellValue;
      }
    },
    [],
  );

  return (
    <div>
      <Table aria-label="Example static collection table">
        <TableHeader columns={headCol}>
          {(column) => (
            <TableColumn key={column.uid} align="center">
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"Don't Have History..."} items={historyData}>
          {(item) => (
            <TableRow key={item.plan_id}>
              {(columnKey) => (
                <TableCell>
                  {renderCell(item, columnKey as keyof HistoryData | "action")}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
