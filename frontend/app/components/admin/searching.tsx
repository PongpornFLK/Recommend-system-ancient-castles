"use client";
import {
  Autocomplete,
  AutocompleteSection,
  AutocompleteItem,
} from "@heroui/react";
import { Search } from "lucide-react";

interface SearchItem {
  key: string;
  title: string;
}

interface SearchProps {
  items: SearchItem[];
  placeholder: string;
  onInputChange?: (value: string) => void;
  onSelectionChange?: (key: React.Key | null) => void;
}

export default function Searching({
  items,
  placeholder,
  onInputChange,
  onSelectionChange
}: SearchProps) {
  return (
    <div>
      <Autocomplete
        defaultItems={items}
        placeholder={placeholder}
        onInputChange={onInputChange}
        onSelectionChange={onSelectionChange}
        radius="full"
        variant="bordered"
        startContent={<Search />}
      >
        {(item) => (
          <AutocompleteItem key={item.key} textValue={item.title}>
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <div className="flex flex-col">
                  <span className="text-small">{item.title}</span>
                </div>
              </div>
            </div>
          </AutocompleteItem>
        )}
      </Autocomplete>
    </div>
  );
}
