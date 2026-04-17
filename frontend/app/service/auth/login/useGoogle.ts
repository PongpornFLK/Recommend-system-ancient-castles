import { useEffect, useState } from "react";
import { supabase } from "@/app/service/auth/supabase";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { API_URL } from "@/app/config";
import { useRouter } from "next/navigation";

interface CustomToken {
  sub: string;
  user_id: number;
  roles: string;
  exp: number;
  auth_provider: "google";
}

export default function useGoogle() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isProcessing = false;

    // เช็คว่ามี Token อยู่แล้วไหม
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        const existingToken = localStorage.getItem("token");
        let isTokenValid = false;

        // Token ยังใช้ได้ไหม
        if (existingToken) {
          try {
            const decoded = jwtDecode<CustomToken>(existingToken); // ถอดรหัส Token
            const currentUserId = localStorage.getItem("user_id");

            // เช็คว่า exp && user_id
            if (decoded.exp * 1000 > Date.now() && decoded.user_id.toString() === currentUserId) {
              isTokenValid = true;
            }
          } catch (e) { isTokenValid = false; }
        }

        // ถ้า login ได้,Token ใช้ได้ และยังไม่เคย process จะทำงาน
        if (event == "SIGNED_IN" && session && !isTokenValid && !isProcessing) {
          isProcessing = true;
          setIsLoading(true);
          const supabaseToken = session.access_token;

          try {
            // ส่งไป backend เพื่อยืนยันตัวตนที่ supabase
            const response = await axios.post(`${API_URL}/users/auth/google_login`, {
              access_token: supabaseToken,
            });

            // รับข้อมูลจาก backend
            const token = response.data.access_token;
            const refreshToken = response.data.refresh_token;
            const decode = jwtDecode<CustomToken>(token);

            // เก็บข้อมูลลง Local Storage
            localStorage.setItem("token", token);
            localStorage.setItem("refresh_token", refreshToken);
            localStorage.setItem("user_id", decode.user_id.toString());
            localStorage.setItem("roles", decode.roles);
            localStorage.setItem("auth_provider", decode.auth_provider);
            localStorage.setItem("username", decode.sub);

            console.log("Login Success!");

            // ส่ง event ไปยัง navbar
            window.dispatchEvent(new Event("auth-change"));
            router.replace("/landing");
          } catch (err) {
            console.error("Login Error :", err);
          } finally {
            setIsLoading(false);
            isProcessing = false;
          }
        }
      },
    );
    // คืนค่าเพื่อ cancel การรอเมื่อเปลี่ยนหน้าเว็บ
    return () => listener.subscription.unsubscribe();
  }, [router]);

  return { isLoading };
}

// event บอกว่าทำอะไร 'SIGNED_IN', 'SIGNED_OUT'
// session จะเก็บข้อมูลบัตรชั่วคราวเอาไว้ session.access_token
