"use client";

import { Input } from "@heroui/react";
import { Search } from "lucide-react";

export default function Searching() {
  return (
    <div>
      <Input
        labelPlacement="outside"
        placeholder="Search..."
        startContent={<Search />}
        type="text"
      />
    </div>
  );
}
