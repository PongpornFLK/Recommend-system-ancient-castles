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
} from "@heroui/react";
import React from "react";

export default function Navbars() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    "Home",
    "History",
    "Map",
    "About",
    "Setting",
    "Favorite",
    "Log Out",
  ];

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} className="shadow-xl">
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <p className="font-bold text-inherit text-tone-orange text-2xl">
            Ancient Castles
          </p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem isActive>
          <Link color="foreground" href="/landing" className="text-tone-gray">
            {menuItems[0]}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link aria-current="page" href="/history" className="text-tone-gray">
            {menuItems[1]}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/map" className="text-tone-gray">
            {menuItems[2]}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/about" className="text-tone-gray">
            {menuItems[3]}
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
              <div className="px-2 py-3">
                <div className="text-small font-bold flex flex-row gap-2 pl-4">
                  <UserRound size={18}/>
                  Pongporn Yampradit
                </div>
                <Divider className="my-4" orientation="horizontal" />
                <div className="text-tiny grid grid-cols-1 gap-2 mt-2">
                  <Button
                    color="default"
                    variant="light"
                    startContent={<Settings size={16} />}
                    className="justify-start pr-30"
                  >
                    Setting
                  </Button>
                  <Button
                    color="default"
                    variant="light"
                    startContent={<Heart size={16} />}
                    className="justify-start pr-30"
                  >
                    Favorite
                  </Button>
                  <Button
                    color="danger"
                    startContent={<LogOut size={16} />}
                    className="justify-start pr-30"
                    variant="ghost"
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
