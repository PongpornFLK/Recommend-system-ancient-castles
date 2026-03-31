"use client";

import dynamic from "next/dynamic";
import { supabase } from "@/app/service/auth/supabase";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

const ButtonGoogleContent = () => {
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
    <div className="flex justify-center w-full">
      <Button
        variant="bordered"
        className="w-full text-stone-700 font-medium border-stone-200"
        onClick={handleLogin}
        startContent={<Icon icon="flat-color-icons:google" width={22} />}
      >
        Sign in with Google
      </Button>
    </div>
  );
};

// dynamic ปิด ssr: false
export default dynamic(() => Promise.resolve(ButtonGoogleContent), {
  ssr: false
});
