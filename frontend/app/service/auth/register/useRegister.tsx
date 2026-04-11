"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";
import { X } from "lucide-react";
import api from "@/app/service/api";

export default function useRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister( // ส่งข้อมูลไปยัง API
    e: React.FormEvent,
    username: string,
    email: string,
    tel: string,
    password: string,
    confirmpwd: string
  ) {
    e.preventDefault();

    if (password === confirmpwd) {
      setIsLoading(true);
      try { // ส่ง HTTP POST Request ไปยัง Endpoint
        const res = await api.post("/users", {
          username: username,
          email: email,
          tel: tel,
          roles: "user",
          password: password,
        });

        console.log("Register success", res.status);

        addToast({
          hideIcon: true,
          title: "Create Success",
          classNames: {
            closeButton:
              "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
          },
          closeIcon: <X />,
          color: "success",
        });

        router.push("/login");
      } catch (err) {
        console.error("Register Error", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    } else {
      addToast({
        hideIcon: true,
        title: "Password not match",
        classNames: {
          closeButton:
            "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
        },
        closeIcon: <X />,
        color: "danger",
      });
    }
  }

  return { handleRegister, isLoading };
}
