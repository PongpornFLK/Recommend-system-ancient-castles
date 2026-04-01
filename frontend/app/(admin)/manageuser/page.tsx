"use client";
import { useEffect, useState } from "react";
import { useDisclosure } from "@heroui/react";
import AdminBar from "@/app/components/admin/adminbar";
import ModalDelete from "@/app/components/admin/modal";
import Searching from "@/app/components/admin/searching";
import UserTable from "@/app/components/admin/manageuser/UserTable";
import { useGetUsers } from "@/app/service/admin/manageuser/useGetUsers";
import { useDeleteUser } from "@/app/service/admin/manageuser/useDeleteUser";

export default function ManageUser() {
  const [page, setPage] = useState(1);
  const rowSize = 10;

  // Custom hooks
  const { users, loading, error, total, fetchUsers } = useGetUsers();
  const { deleteUser } = useDeleteUser();

  const pages = Math.ceil(total / rowSize);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [userId, setUserId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteClick = (id: string) => {
    setUserId(id);
    onOpen();
  };

  const deleteUserHandler = async (id: string) => {
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error("Delete Not success : ", err);
    }
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
                  items={users.map((user) => ({
                    key: user.user_id,
                    title: user.username,
                  }))}
                  placeholder="Search username..."
                  onInputChange={(value) => setSearchTerm(value)}
                  onSelectionChange={(key) => {
                    if (key) {
                      const selectedUser = users.find((user) => user.user_id === key);
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
            onEvent={() => deleteUserHandler(userId)}
            item={userId}
            size="md"
          />
        </div>
      </div>
    </section>
  );
}
