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
import React, { useEffect , useState } from "react";
import axios from "axios";

export default function History() {
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  interface HistoryData {
    plan_id: string;
    date: string;
    start_date: string;
    end_date: string;
    duration: string;
    plan_name: string;
    event_description: string;
  }

  const headCol = [
    { name: "Date", uid: "date" },
    { name: "Start-Time", uid: "start_date" },
    { name: "End-Time", uid: "end_date" },
    { name: "Duration", uid: "duration" },
    { name: "Plan name", uid: "plan_name" },
    { name: "Event description", uid: "event_description" },
    { name: "Action", uid: "action" },
  ];
  
  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");

      console.log("Token:", token);
      console.log("User_id:", userId);

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/history/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              page: 1,
              size: 20,
            },
          },
        );

        console.log("API Response:", response.data);
        console.log("Items:", response.data.items);

        const historyData = response.data.items.map((item: HistoryData) => ({
          plan_id: item.plan_id?.toString(),
          date: new Date(item.start_date).toLocaleDateString(),
          start_date: new Date(item.start_date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          end_date: new Date(item.end_date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          duration: item.duration?.toString() || "",
          plan_name: item.plan_name || "",
          event_description: item.event_description || "",
        }));

        console.log("Transformed Data:", historyData);

        setHistoryData(historyData);
      } catch (err) {
        console.error("Login Error", err);
      }
    };

    fetchHistory();
  }, []);

  const renderCell = React.useCallback(
    (data: HistoryData, columnKey: keyof HistoryData | "action") => {
      const cellValue = data[columnKey as keyof HistoryData];

      console.log("Render Cell:", columnKey, data);

      switch (columnKey) {
        case "date":
          return data.date;
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
          return (
            <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
              View
            </button>
          );
        default:
          return cellValue;
      }
    },
    [],
  );

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
                    {renderCell(
                      item,
                      columnKey as keyof HistoryData | "action",
                    )}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
    </section>
  );
}
