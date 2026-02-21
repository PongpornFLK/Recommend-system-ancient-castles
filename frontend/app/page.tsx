"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {Spinner} from "@heroui/react";


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" color="warning" label="Loading Login..." variant="gradient"/>;
    </div>
  );
}
