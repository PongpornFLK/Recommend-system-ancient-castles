"use client";
import { usePathname } from "next/navigation";
import { UserRound, Settings, Heart, LogOut } from "lucide-react";
import React, { useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/app/config";
import { useRouter } from "next/navigation";

export default function AdminBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<UserData | null>(null);

  const nameHeader = () => {
    switch (pathname) {
      case "/managecastle":
        return <div className="text-2xl font-bold">Manage Castle</div>;
      case "/manageevent":
        return <div className="text-2xl font-bold">Manage Event</div>;
      case "/manageuser":
        return <div className="text-2xl font-bold">Manage User</div>;
    }
  };

  interface UserData {
    user_id: string;
    username: string;
  }

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");

      console.log("Token:", token);
      console.log("User_id:", userId);

      try {
        const response = await axios.get(
          `${API_URL}/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const userData = response.data;
        console.log("User Data:", userData);

        setUser(userData);
      } catch (err) {
        console.error("Error fetching user", err);
      }
    };

    fetchUser();
  }, []);


  return (
    <div className="bg-white h-[75px] rounded-2xl">
      <div className="flex flex-row justify-between items-center h-full px-6">
        <div>{nameHeader()}</div>
        <div className="flex flex-row items-center gap-2">
          <h1 className="text-tone-orange font-bold">{user?.username || "Admin"}</h1>
          <UserRound
            size={34}
            className="bg-tone-orange text-white rounded-full p-1"
          />
        </div>
      </div>
    </div>
  );
}
