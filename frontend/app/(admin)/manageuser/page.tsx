"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useDisclosure } from "@heroui/react";
import AdminBar from "@/app/components/admin/adminbar";
import ModalDelete from "@/app/components/admin/modal";
import Searching from "@/app/components/admin/searching";
import UserTable from "@/app/components/admin/manageuser/UserTable";
import { UserData } from "@/app/(admin)/manageuser/types";
import { userService } from "@/app/service/admin/manageuser/userService";

export default function ManageUser() {
  const [userData, setUserData] = useState<UserData[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const rowSize = 10;
  const pages = Math.ceil(total / rowSize);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [userId, setUserId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredUsers = userData.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const fetchUser = useCallback(async () => {
    try {
      const data = await userService.getUsers(page, rowSize);
      setTotal(data.total);

      const mappedUsers = data.items.map((item: UserData) => ({
        user_id: item.user_id?.toString(),
        username: item.username || "",
        email: item.email || "",
        roles: item.roles || "",
      }));

      setUserData(mappedUsers);
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

  const deleteUser = useCallback(
    async (id: string) => {
      try {
        await userService.deleteUser(id);
        fetchUser();
      } catch (err) {
        console.error(err);
      }
    },
    [fetchUser],
  );

  const handleDeleteClick = (id: string) => {
    setUserId(id);
    onOpen();
  };

  return (
    <section className="min-h-screen bg-gray-50 pb-10">
      <AdminBar />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="w-full sm:max-w-md">
                <Searching
                  items={userData.map((user) => ({
                    key: user.user_id,
                    title: user.username,
                  }))}
                  placeholder="Search username..."
                  onInputChange={(value) => setSearchTerm(value)}
                  onSelectionChange={(key) => {
                    if (key) {
                      const selectedUser = userData.find((user) => user.user_id === key);
                      if (selectedUser) {
                        setSearchTerm(selectedUser.username);
                      }
                    }
                  }}
                />
              </div>
              <div className="font-bold text-xl text-gray-800">Users Management</div>
            </div>

            <UserTable
              users={filteredUsers}
              page={page}
              pages={pages}
              onPageChange={setPage}
              onDelete={handleDeleteClick}
            />
          </div>

          <ModalDelete
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onEvent={() => deleteUser(userId)}
            item={userId}
            size="md"
          />
        </div>
      </div>
    </section>
  );
}
