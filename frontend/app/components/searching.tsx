"use client";

import { Input, Autocomplete, AutocompleteItem } from "@heroui/react";
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
      {/* <Autocomplete label="ค้นหาปราสาท" placeholder="พิมพ์ชื่อปราสาท...">
        <AutocompleteItem key="1">ปราสาทตาควาย</AutocompleteItem>
        <AutocompleteItem key="2">ปราสาทพระวิหาร</AutocompleteItem>
      </Autocomplete> */}
    </div>
  );
}
