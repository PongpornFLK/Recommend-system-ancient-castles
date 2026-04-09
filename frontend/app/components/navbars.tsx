"use client";

import Link from "next/link";
import {
  UserRound,
  Settings,
  Heart,
  LogOut,
  House,
  Map,
  Info,
  ChessRook,
  MapPin,
  BellRing,
} from "lucide-react";
import {
  Badge,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Divider,
  Image,
} from "@heroui/react";
import api from "@/app/service/api";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import GlobalTracker from "./trip/global-tracker";

interface Trip {
  status: string;
}

export default function Navbars() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState<UserData | null>(null);
  const [arrived, setArrived] = React.useState<string | null>(null);

  interface UserData {
    user_id: string;
    username: string;
    email: string;
  }

  const menuItems = [
    { label: "Home", href: "/landing", icon: <House size={16} /> },
    { label: "Plan", href: "/tripplan", icon: <MapPin size={16} /> },
    { label: "History", href: "/history", icon: <ChessRook size={16} /> },
    { label: "Map", href: "/map", icon: <Map size={16} /> },
    { label: "About", href: "/about", icon: <Info size={16} /> },
    { label: "Setting", href: "/setuser", icon: <Settings size={16} /> },
    { label: "Favorite", href: "/favorite", icon: <Heart size={16} /> },
    {
      label: "Notification",
      href: "/tripplan",
      icon: (
        <Badge
          color="success"
          content="!"
          isInvisible={arrived !== "success"}
          shape="circle"
          size="sm"
        >
          <BellRing size={16} />
        </Badge>
      ),
    },
  ];

  const fetchUser = React.useCallback(async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId || userId === "null" || userId === "") return;

    try {
      const response = await api.get(`/users/${userId}`);
      setUser(response.data);

      const tripResponse = await api.get("/trip/user");
      const activeTrip = tripResponse.data.find((t: Trip) => t.status === "travelling");

      if (activeTrip) {
        const currentStatus = localStorage.getItem("arrived");
        setArrived(currentStatus === "success" ? "success" : "travelling");
      } else {
        setArrived(null);
      }
    } catch (err) {
      console.error("Error fetching user/trip data", err);
    }
  }, []);

  useEffect(() => {
    // ฟังก์ชันสำหรับ Sync ข้อมูลทั้งหมด
    const syncAll = () => {
      fetchUser();
      const localStatus = localStorage.getItem("arrived");
      setArrived(localStatus);
    };

    // รันครั้งแรกตอนโหลด
    syncAll();

    // ดักฟังเหตุการณ์ต่างๆ
    window.addEventListener("auth-change", fetchUser);
    window.addEventListener("trip-status-changed", fetchUser);
    window.addEventListener("arrived", syncAll);

    return () => {
      window.removeEventListener("auth-change", fetchUser);
      window.removeEventListener("trip-status-changed", fetchUser);
      window.removeEventListener("arrived", syncAll);
    };
  }, [fetchUser]);

  const handleLogOut = () => {
    localStorage.clear();
    setUser(null);
    setArrived(null);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/login");
  };

  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className=""
      maxWidth="full"
    >
      <GlobalTracker />
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand className="gap-4">
          <Image
            alt="HeroUI hero Image"
            src="/assets/logo/logo-nav.png"
            width={35}
          />
          <p className="font-bold text-inherit text-tone-orange text-2xl">
            Ancient Castles
          </p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="end">
        <NavbarItem>
          <Link
            href="/landing"
            className="text-tone-gray hover:text-tone-orange transition-colors"
          >
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/tripplan"
            className="text-tone-gray hover:text-tone-orange transition-colors"
          >
            Plan
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/history"
            className="text-tone-gray hover:text-tone-orange transition-colors"
          >
            History
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/map"
            className="text-tone-gray hover:text-tone-orange transition-colors"
          >
            Map
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/about"
            className="text-tone-gray hover:text-tone-orange transition-colors"
          >
            About
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Popover placement="bottom-start">
            <Badge
              color="danger"
              content={""}
              isInvisible={arrived !== "success"}
              shape="circle"
              placement="top-right"
            >
              <PopoverTrigger>
                <Button
                  isIconOnly
                  radius="full"
                  aria-label="User profile"
                  className="bg-tone-orange text-white"
                  suppressHydrationWarning
                >
                  <UserRound />
                </Button>
              </PopoverTrigger>
            </Badge>
            <PopoverContent>
              <div className="px-1 py-2">
                <div className="text-small font-bold flex flex-row gap-2 pl-4 pt-2">
                  <UserRound size={18} />
                  {user?.username || "User"}
                </div>
                <Divider className="my-3" orientation="horizontal" />
                <div className="text-tiny grid grid-cols-1 gap-2 mt-2">
                  <Link href="/setuser">
                    <Button
                      color="default"
                      variant="light"
                      startContent={<Settings size={16} />}
                      className="justify-start w-full"
                    >
                      Setting
                    </Button>
                  </Link>
                  <Link href="/favorite" className="w-full">
                    <Button
                      color="default"
                      variant="light"
                      startContent={<Heart size={16} />}
                      className="justify-start w-full"
                    >
                      Favorite
                    </Button>
                  </Link>

                  <Link href="/tripplan" className="w-full">
                    <Button
                      color="default"
                      variant="light"
                      startContent={
                        <Badge
                          color="success"
                          content="!"
                          isInvisible={arrived !== "success"}
                          shape="circle"
                          placement="top-right"
                          classNames={{
                            badge: "text-white",
                          }}
                        >
                          <BellRing size={16} />
                        </Badge>
                      }
                      className="justify-start w-full"
                    >
                      Notification
                    </Button>
                  </Link>

                  <Button
                    startContent={<LogOut size={16} />}
                    className="justify-start bg-white hover:bg-tone-red text-tone-red hover:text-white w-full"
                    onClick={handleLogOut}
                  >
                    Log Out
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
        <div className="flex flex-col gap-2 mt-4">
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              <Link
                className="w-full text-lg flex items-center gap-3 py-2 text-slate-700 hover:text-tone-orange font-medium"
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="text-slate-400">{item.icon}</div>
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          {user && (
            <NavbarMenuItem key="logout">
              <Button
                startContent={<LogOut size={16} />}
                className="w-full justify-start text-lg py-2 pl-0 font-bold text-tone-red bg-opacity-100 "
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogOut();
                }}
              >
                Log Out
              </Button>
            </NavbarMenuItem>
          )}
        </div>
      </NavbarMenu>
    </Navbar>
  );
}
