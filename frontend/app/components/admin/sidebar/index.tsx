"use client";
import {
  LucideIcon,
  LibraryBig,
  Database,
  UserCog,
  LogOut,
} from "lucide-react";
import SidebarItem from "./item";
import { Image } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import React, { useEffect } from "react";
import axios from "axios";



export default function Sidebar() {
    const [user, setUser] = React.useState<UserData | null>(null);
  const router = useRouter();

  interface ISidebarItem {
    name: string;
    path: string;
    icon: LucideIcon;
  }

  interface UserData {
    user_id: string;
  }

  const items: ISidebarItem[] = [
    {
      name: "Manage Castle",
      path: "/managecastle",
      icon: Database,
    },
    {
      name: "Manage Event",
      path: "/manageevent",
      icon: LibraryBig,
    },
    {
      name: "Manage User",
      path: "/manageuser",
      icon: UserCog,
    },
  ];

   useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");

      console.log("Token:", token);
      console.log("User_id:", userId);

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/users/${userId}`,
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


  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    setUser(null);
    router.push("/login");
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-white z-10 p-4">
      <div className="flex flex-col space-y-10 w-full h-full">
        <div className="flex flex-row gap-2">
          <Image src="/assets/logo/logo-nav.png" width={35} />
          <p className="font-bold text-inherit text-tone-orange text-2xl">
            Ancient Castles
          </p>
        </div>

        <div className="flex flex-col space-y-2">
          {items.map((item, index) => (
            <SidebarItem key={index} item={item} />
          ))}
        </div>

        <div className="mt-auto">
          <Button
            // color="danger"
            startContent={<LogOut size={16} />}
            className="justify-start pr-30 bg-white hover:bg-tone-red text-tone-red hover:text-white border-2 font-bold"
            // variant="ghost"
            onClick={handleLogOut}
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
