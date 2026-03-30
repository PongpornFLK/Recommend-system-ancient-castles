"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";
import { X } from "lucide-react";
import axios from "axios";
import { API_URL } from "@/app/config";
import { jwtDecode } from "jwt-decode";

interface CustomToken {
  sub: string;
  user_id: number;
  roles: string;
  exp: number;
}

export default function useLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent, username: string, password: string) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const res = await axios.post(`${API_URL}/auth/token`, formData);

      const token = res.data.access_token;
      const decode = jwtDecode<CustomToken>(token);

      localStorage.setItem("token", token);
      localStorage.setItem("user_id", decode.user_id.toString());

      // console.log("Decode : ", decode.roles);
      // console.log("User_id : ", decode.user_id);
      // console.log("Token : ", token);

      if (decode.roles === "user") {
        addToast({
          hideIcon: true,
          title: "Login Success",
          description: "Role : User",
          classNames: {
            closeButton: "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
          },
          closeIcon: <X />,
          color: "success",
        });
        router.push("/landing");
      } else if (decode.roles === "admin") {
        addToast({
          hideIcon: true,
          title: "Login Success",
          description: "Role : Admin",
          classNames: {
            closeButton: "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
          },
          closeIcon: <X />,
          color: "success",
        });
        router.push("/managecastle");
      }

      return res.data;
    } catch (err) {
      console.error("Login Error", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return { handleLogin, isLoading };
}
