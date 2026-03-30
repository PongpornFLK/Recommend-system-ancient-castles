"use client";
import { supabase } from "@/app/service/auth/supabase";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function ButtonGoogle() {
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/landing`,
      },
    });
    if (error) {
      console.error("Login failed:", error.message);
    }
  };

  return (
    <div className="flex justify-center w-full px-8">
      <Button variant="bordered" className="w-full" onClick={handleLogin}>
        <Icon icon="devicon:google" />
        Sign in with google
      </Button>
    </div>
  );
}
