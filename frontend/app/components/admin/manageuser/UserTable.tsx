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
import { Trash2 } from "lucide-react";
import { UserData } from "../../../(admin)/manageuser/types";

interface UserTableProps {
  users: UserData[];
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
  onDelete: (userId: string) => void;
}

const headCol = [
  { name: "User ID", uid: "user_id" },
  { name: "Username", uid: "username" },
  { name: "Email", uid: "email" },
  { name: "Roles", uid: "roles" },
  { name: "Action", uid: "action" },
];

export default function UserTable({
  users,
  page,
  pages,
  onPageChange,
  onDelete,
}: UserTableProps) {
  const renderCell = useCallback(
    (data: UserData, columnKey: keyof UserData | "action") => {
      switch (columnKey) {
        case "user_id":
          return data.user_id;
        case "username":
          return data.username;
        case "email":
          return data.email;
        case "roles":
          return data.roles;
        case "action":
          return (
            <div>
              <Tooltip content="Delete">
                <Button
                  onPress={() => onDelete(data.user_id)}
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
          const cellValue = data[columnKey as keyof UserData];
          if (typeof cellValue === "object" && cellValue !== null) {
            return "";
          }
          return cellValue as React.ReactNode;
      }
    },
    [onDelete]
  );

  return (
    <div className="overflow-x-auto mt-5">
      <Table
        aria-label="Users Data"
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
        <TableBody emptyContent={"Don't Have Users..."} items={users}>
          {(item) => (
            <TableRow key={item.user_id}>
              {(columnKey) => (
                <TableCell key={columnKey}>
                  {renderCell(item, columnKey as keyof UserData | "action")}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
