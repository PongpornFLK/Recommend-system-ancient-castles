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
    let isProcessing = false; // กันโหลดซ้ำ

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        const existingToken = localStorage.getItem("token");
        let isTokenValid = false;

        if (existingToken) {
          try {
            const decoded = jwtDecode<CustomToken>(existingToken);
            const currentUserId = localStorage.getItem("user_id");

            if (decoded.exp * 1000 > Date.now() && decoded.user_id.toString() === currentUserId) { // เช็คว่า exp && user_id
              isTokenValid = true;
            }
          } catch (e) {
            isTokenValid = false;
          }
        }

        if (event == "SIGNED_IN" && session && !isTokenValid && !isProcessing) {
          isProcessing = true;
          setIsLoading(true);
          const supabaseToken = session.access_token;

          try {
            const response = await axios.post(
              `${API_URL}/users/auth/google_login`,
              {
                access_token: supabaseToken,
              }
            );

            const token = response.data.access_token;
            const refreshToken = response.data.refresh_token;
            const decode = jwtDecode<CustomToken>(token);

            localStorage.setItem("token", token);
            localStorage.setItem("refresh_token", refreshToken);
            localStorage.setItem("user_id", decode.user_id.toString());
            localStorage.setItem("roles", decode.roles);
            localStorage.setItem("auth_provider", decode.auth_provider);
            localStorage.setItem("username", decode.sub);

            console.log("Login Success!");

            window.dispatchEvent(new Event("auth-change")); // login success to navbar
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
