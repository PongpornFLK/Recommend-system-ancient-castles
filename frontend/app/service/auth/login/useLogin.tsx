"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";
import { X } from "lucide-react";
import api from "@/app/service/api";
import { jwtDecode } from "jwt-decode";

interface CustomToken {
  sub: string;
  user_id: number;
  roles: string;
  exp: number;
  auth_provider : "local"
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
      const res = await api.post("/auth/token", formData);

      const { access_token, refresh_token } = res.data;
      const decode = jwtDecode<CustomToken>(access_token);

      localStorage.setItem("token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user_id", decode.user_id.toString());
      localStorage.setItem("roles", decode.roles);
      localStorage.setItem("auth_provider", decode.auth_provider);

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
