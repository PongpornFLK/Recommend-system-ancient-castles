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
  useDisclosure,
} from "@heroui/react";
import { Search, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminBar from "@/app/components/admin/adminbar";
import ModalDelete from "@/app/components/admin/modal";
import Searching from "@/app/components/admin/searching";

export default function ManageUser() {
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const rowSize = 10;
  const pages = Math.ceil(total / rowSize);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [userData, setUserData] = React.useState<UserData[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredUsers = userData.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  interface UserData {
    user_id: string;
    username: string;
    email: string;
    roles: string;
  }

  const headCol = [
    { name: "User ID", uid: "user_id" },
    { name: "Username", uid: "username" },
    { name: "Email", uid: "email" },
    { name: "Roles", uid: "roles" },
    { name: "Action", uid: "action" },
  ];

  const fetchUser = React.useCallback(async () => {
    const token = localStorage.getItem("token");
    // console.log("Page :", page);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: page,
          size: rowSize,
        },
      });

      setTotal(response.data.total);

      const userData = response.data.items.map((item: UserData) => ({
        user_id: item.user_id?.toString(),
        username: item.username || "",
        email: item.email || "",
        roles: item.roles || "",
      }));

      setUserData(userData);
      console.log(userData);
    } catch (err) {
      console.error(err);
    }
  }, [page, rowSize]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await fetchUser();
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [page, rowSize, fetchUser]);

  const deleteUser = React.useCallback(
    async (user_id: string) => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.delete(
          `http://127.0.0.1:8000/users/${user_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        fetchUser();
      } catch (err) {
        console.error(err);
      }
    },
    [fetchUser],
  );

  const renderCell = React.useCallback(
    (data: UserData, columnKey: keyof UserData | "action") => {
      const cellValue = data[columnKey as keyof UserData];

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
                  onPress={() => {
                    setUserId(data.user_id);
                    onOpen();
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
          if (typeof cellValue === "object" && cellValue !== null) {
            return "";
          }
          return cellValue as React.ReactNode;
      }
    },
    [deleteUser, onOpen, onOpenChange],
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
              items={userData.map((user) => ({
                key: user.user_id,
                title: user.username,
              }))}
              placeholder="Search username..."
              onInputChange={(value) => {
                setSearchTerm(value);
              }}
              onSelectionChange={(key: React.Key | null) => {
                if (key) {
                  const selectedUser = userData.find(
                    (user) => user.user_id === key,
                  );
                  if (selectedUser) {
                    setSearchTerm(selectedUser.username);
                  }
                }
              }}
            />
          </div>
          <div className="mt-5 font-bold">Users Table</div>
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
              <TableBody
                emptyContent={"Don't Have History..."}
                items={filteredUsers}
              >
                {(item) => (
                  <TableRow key={item.user_id}>
                    {(columnKey) => (
                      <TableCell key={columnKey}>
                        {renderCell(
                          item,
                          columnKey as keyof UserData | "action",
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div>
          <ModalDelete
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onEvent={() => {
              deleteUser(userId);
            }}
            item={userId}
            size="md"
          />
        </div>
      </div>
    </section>
  );
}
