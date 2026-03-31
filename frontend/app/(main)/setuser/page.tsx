"use client";
import React, { useState, useEffect } from "react";
import { Tabs, Tab } from "@heroui/react";
import { UserCog, LockKeyhole } from "lucide-react";
import ProfileTab from "@/app/components/setuser/profile-tab";
import PasswordTab from "@/app/components/setuser/password-tab";

export default function Setuser() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check screen size on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile(); // Initial check
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="justify-items-center w-full px-4">
      <div className="flex flex-col gap-4 my-5 w-full max-w-5xl">
        <div className="flex flex-row justify-center md:justify-start">
          <div className="font-bold text-3xl md:ml-7 text-center">Settings</div>
        </div>
        <div className="flex flex-col w-full">
          <Tabs
            aria-label="Options"
            placement={isMobile ? "top" : "start"}
            size="lg"
            variant="light"
            classNames={{
              cursor: "bg-tone-orange",
              tabContent: "group-data-[selected=true]:text-white",
              base: "bg-white rounded-xl mx-auto md:mx-0",
              tabList: "w-full md:w-auto overflow-x-auto",
              panel: "w-full h-full",
            }}
          >
            <Tab
              key="profile"
              title={
                <div className="flex items-center space-x-2">
                  <UserCog size={18} />
                  <span>My Profile</span>
                </div>
              }
            >
              <ProfileTab />
            </Tab>
            <Tab
              key="auth"
              title={
                <div className="flex items-center space-x-2">
                  <LockKeyhole size={18} />
                  <span>Authentication</span>
                </div>
              }
            >
              <PasswordTab />
            </Tab>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
