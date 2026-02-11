"use client";
import { Button } from "@heroui/react";
import { Images } from "lucide-react";

export default function Dropzone() {
  return (
    <div>
      <Button
        startContent={<Images />}
        className="bg-tone-orange text-white hover:bg-tone-orange/80"
      >
        Drop IMG
      </Button>
    </div>
  );
}
