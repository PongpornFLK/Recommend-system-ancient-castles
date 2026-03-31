"use client";
import { Select, SelectItem, Button } from "@heroui/react";
import api from "@/app/service/api";
import { CirclePlus, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React from "react";
import { useEffect, useState } from "react";

interface SelectPlaceProps {
  boxSelect: { id: number; placeId: string; placeName: string, latitude: number, longitude: number }[];
  setBoxSelect: React.Dispatch<React.SetStateAction<{ id: number; placeId: string; placeName: string, latitude: number, longitude: number }[]>>;
}

export default function SelectPlace({ boxSelect, setBoxSelect }: SelectPlaceProps) {
  const searchParams = useSearchParams();
  const castle_id = searchParams.get("castle_id");
  // const castle_id = 10;
  const [nearPlace, setNearPlace] = useState<NearPlaceData[]>([]);

  interface NearPlaceData {
    nearplace_id: string;
    castle_id: string;
    place_name: string;
    latitude: number;
    longitude: number;
  }

  useEffect(() => {
    const fetchNearPlace = async () => {
      try {
        const response = await api.get(`/nearplace?castle_id=${castle_id}`);

        setNearPlace(response.data);
        console.log("NearPlaceData : ", response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNearPlace();
  }, [castle_id]);

  const addBox = () => {
    const findMax =
      boxSelect.length > 0 ? Math.max(...boxSelect.map((item) => item.id)) : 0;
    setBoxSelect([...boxSelect, { id: findMax + 1, placeId: "", placeName: "", latitude: 0, longitude: 0 }]);
    // console.log(findMax)
  };

  const deleteBox = (removeId: number) => {
    setBoxSelect(boxSelect.filter((item) => removeId !== item.id));
    // console.log(boxSelect.length)
  };

  // Disable Item
  const disItem = boxSelect.map((item) => item.placeId).filter((check) => check !== ""); // map & check ""

  const updateDis = (id: number, selectId: string, selectName: string, la: number, long: number) => {
    const updateBox = boxSelect.map((item) => {
      if (item.id == id) {
        return { ...item, placeId: selectId, placeName: selectName, latitude: la, longitude: long };
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
                const selectId = String(key.currentKey);
                const matchedPlace = nearPlace.find((p) => String(p.nearplace_id) === selectId);
                const selectName = matchedPlace ? matchedPlace.place_name : "";
                const selectla = matchedPlace ? matchedPlace.latitude : 0;
                const selectlong = matchedPlace ? matchedPlace.longitude : 0;

                updateDis(item.id, selectId, selectName, selectla, selectlong);
              }}
              disabledKeys={disItem}
              selectedKeys={item.placeId ? [item.placeId] : []}
            >
              {(place) => (
                <SelectItem key={place.nearplace_id}>
                  {place.place_name}
                </SelectItem>
              )}
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