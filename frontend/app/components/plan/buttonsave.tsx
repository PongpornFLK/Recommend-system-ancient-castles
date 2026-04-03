"use client";

import { Button } from "@heroui/react";
import { List } from "lucide-react";

interface ButtonProps {
  planName: string;
  onSave: () => void;        
}

export default function ButtonSave({ 
  planName, 
  onSave, 
}: ButtonProps) {

  const isDisabled = !planName || planName.trim() === "";

  return (
    <Button
      startContent={<List size={16} />}
      className={`w-full text-white font-bold ${
        isDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-tone-lightgreen"
      }`}
      isDisabled={isDisabled}
      onClick={() => {
        onSave(); 
      }}
    >
      บันทึกแผนการเดินทาง
    </Button>
  );
}