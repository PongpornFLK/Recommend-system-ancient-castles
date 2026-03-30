import axios from "axios";
import { API_URL } from "@/app/config";
import { useEffect, useState } from "react";
import { supabase } from "@/app/service/auth/supabase";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface CustomToken {
  sub: string;
  user_id: number;
  roles: string;
  exp: number;
}

export default function useGoogle() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event == "SIGNED_IN" && session) {
          setIsLoading(true);
          const supabaseToken = session.access_token;
          try {
            const response = await axios.post(
              `${API_URL}/users/auth/google_login`,
              {
                access_token: supabaseToken,
              },
            );

            const token = response.data.access_token;
            const decode = jwtDecode<CustomToken>(token);

            localStorage.setItem("token", token);
            localStorage.setItem("user_id", decode.user_id.toString());
            localStorage.setItem("roles", decode.roles);

            window.location.reload();
            // console.log("Supabase Token :", response.data);
            router.push("/landing");
          } catch (err) {
            console.error("Login Error :", err);
          } finally {
            setIsLoading(false);
          }
        }
      },
    );
    // คืนค่าเพื่อ cancel การรอเมื่อเปลี่ยนหน้าเว็บ
    return () => listener.subscription.unsubscribe();
  }, []);

  return { isLoading };
}

// event บอกว่าทำอะไร 'SIGNED_IN', 'SIGNED_OUT'
// session จะเก็บข้อมูลบัตรชั่วคราวเอาไว้ session.access_token
