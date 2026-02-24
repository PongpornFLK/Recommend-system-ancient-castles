"use client";
import { Select, SelectItem, Button, MenuItem } from "@heroui/react";
import axios from "axios";
import { CirclePlus, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React from "react";
import { useEffect, useState } from "react";


export default function SelectPlace() {
  const [boxSelect, setBoxSelect] = useState([{ id: 1, place: "" }]);
  // const searchParams = useSearchParams();
  // const castle_id = searchParams.get("castle_id");
  const castle_id = 3;
  const [nearPlace, setNearPlace] = React.useState<NearPlaceData[]>([]);

  interface NearPlaceData {
    nearplace_id : string
    castle_id : string ,
    place_name : string,
  }

  const addBox = () => {
    const findMax =
      boxSelect.length > 0 ? Math.max(...boxSelect.map((item) => item.id)) : 0;
    setBoxSelect([...boxSelect, { id: findMax + 1, place: "" }]);
    // console.log(findMax)
  };

  const deleteBox = (removeId: number) => {
    setBoxSelect(boxSelect.filter((item) => removeId !== item.id));
    // console.log(boxSelect.length)
  };

  // Disable Item
  const disItem = boxSelect
    .map((item) => item.place)
    .filter((check) => check !== ""); // map & check ""

  const updateDis = (id: number, selectPlace: string) => {
    const updateBox = boxSelect.map((item) => {
      if (item.id == id) {
        return { ...item, place: selectPlace };
      }
      return item;
    });
    setBoxSelect(updateBox);
  };

  return (
    <div className="flex flex-col gap-3">
      {boxSelect.map((item) => (
        <div
          className="flex flex-row gap-3 items-center place-content-center"
          key={item.id}
        >
          <div className="basis-128">
            <Select
              items={nearPlace}
              placeholder="Select place"
              aria-label="Select an place"
              onSelectionChange={(key) => {
                const selectPlace = String(key.currentKey);
                updateDis(item.id, selectPlace);
              }}
              disabledKeys={disItem}
              selectedKeys={item.place ? [item.place] : []}
            >
              {(place) => <SelectItem key={place.nearplace_id}>{place.place_name}</SelectItem>}
            </Select>
          </div>
          <Button
            isIconOnly
            onClick={() => deleteBox(item.id)}
            className="bg-white text-tone-red hover:bg-tone-red hover:text-white"
            radius="full"
            size="sm"
          >
            <X size={16} />
          </Button>
        </div>
      ))}
      <Button
        isIconOnly
        onClick={addBox}
        className="mx-auto bg-white text-tone-lightgreen"
      >
        <CirclePlus />
      </Button>
    </div>
  );
}
