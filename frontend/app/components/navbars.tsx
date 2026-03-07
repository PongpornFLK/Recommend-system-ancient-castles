"use client";

import Link from "next/link";
import { UserRound, Settings, Heart, LogOut } from "lucide-react";
import {
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
import React, { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Navbars() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState<UserData | null>(null);

  interface UserData {
    user_id: string;
    username: string;
    email: string;
  }

  const menuItems = [
    "Home",
    "My Plan",
    "History",
    "Map",
    "About",
    "Setting",
    "Favorite",
    "Log Out",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");

      // console.log("Token:", token);
      // console.log("User_id:", userId);

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
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      className=""
      maxWidth="full"
    >
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
          <Link color="foreground" href="/landing" className="text-tone-gray">
            {menuItems[0]}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/tripplan" className="text-tone-gray">
            {menuItems[1]}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link aria-current="page" href="/history" className="text-tone-gray">
            {menuItems[2]}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/map" className="text-tone-gray">
            {menuItems[3]}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/about" className="text-tone-gray">
            {menuItems[4]}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Popover placement="bottom-start">
            <PopoverTrigger>
              <Button
                isIconOnly
                radius="full"
                aria-label="User profile"
                className="bg-tone-orange text-white"
              >
                <UserRound />
              </Button>
            </PopoverTrigger>
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
                      className="justify-start pr-30"
                    >
                      Setting
                    </Button>
                  </Link>
                 <Link href="/favorite" className="w-full">
                      <Button
                        color="default"
                        variant="light"
                        startContent={<Heart size={16} />}
                        className="justify-start pr-30 w-full"
                      >
                        Favorite
                      </Button>
                    </Link>
                  <Button
                    // color="danger"
                    startContent={<LogOut size={16} />}
                    className="justify-start pr-30 bg-white hover:bg-tone-red text-tone-red hover:text-white "
                    // variant="ghost"
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
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              color={
                index === 0
                  ? "success"
                  : index === menuItems.length - 1
                    ? "danger"
                    : "foreground"
              }
              href={`/${item.toLowerCase()}`}
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
