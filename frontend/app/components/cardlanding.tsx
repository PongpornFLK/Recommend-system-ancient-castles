"use client";
import {
  Card,
  CardFooter,
  Image,
  Button,
  Chip,
  CardHeader,
} from "@heroui/react";
import React from "react";
import { Heart } from "lucide-react";

export default function CardLanding() {
  const list = [
    {
      title: "ปราสาทตาควาย",
      img: "/assets/card/castle1.png",
      province: "จังหวัดสุรินทร์",
      architecture: "ปราสาทหินศาสนสถาน",
      location: "บ้านหนองคันนา ต.ตาเมียง อ.นมดงรัก จ.สุรินทร์",
      time: "09.00 - 17.00 น.",
      price: "ฟรี",
      traveling: "อยู่ห่างจากตัวเมืองสุรินทร์ 160 กม.",
    },
    {
      title: "ปราสาทตาควาย",
      img: "/assets/card/castle1.png",
      province: "จังหวัดสุรินทร์",
      architecture: "ปราสาทหินศาสนสถาน",
      location: "บ้านหนองคันนา ต.ตาเมียง อ.นมดงรัก จ.สุรินทร์",
      time: "09.00 - 17.00 น.",
      price: "ฟรี",
      traveling: "อยู่ห่างจากตัวเมืองสุรินทร์ 160 กม.",
    },
    {
      title: "ปราสาทตาควาย",
      img: "/assets/card/castle1.png",
      province: "จังหวัดสุรินทร์",
      architecture: "ปราสาทหินศาสนสถาน",
      location: "บ้านหนองคันนา ต.ตาเมียง อ.นมดงรัก จ.สุรินทร์",
      time: "09.00 - 17.00 น.",
      price: "ฟรี",
      traveling: "อยู่ห่างจากตัวเมืองสุรินทร์ 160 กม.",
    },
    {
      title: "ปราสาทตาควาย",
      img: "/assets/card/castle1.png",
      province: "จังหวัดสุรินทร์",
      architecture: "ปราสาทหินศาสนสถาน",
      location: "บ้านหนองคันนา ต.ตาเมียง อ.นมดงรัก จ.สุรินทร์",
      time: "09.00 - 17.00 น.",
      price: "ฟรี",
      traveling: "อยู่ห่างจากตัวเมืองสุรินทร์ 160 กม.",
    },
    {
      title: "ปราสาทตาควาย",
      img: "/assets/card/castle1.png",
      province: "จังหวัดสุรินทร์",
      architecture: "ปราสาทหินศาสนสถาน",
      location: "บ้านหนองคันนา ต.ตาเมียง อ.นมดงรัก จ.สุรินทร์",
      time: "09.00 - 17.00 น.",
      price: "ฟรี",
      traveling: "อยู่ห่างจากตัวเมืองสุรินทร์ 160 กม.",
    },
  ];

  const [liked, setLiked] = React.useState(false);

  return (
    <div>
      <div className="gap-5 grid grid-cols sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 mt-4">
        {list.map((item, index) => (
          /* eslint-disable no-console */
          <Card
            key={index}
            // isPressable
            shadow="sm"
            // onPress={() => {
            //   console.log("item pressed");
            //   // route push
            // }}
          >
            <CardHeader className="overflow-visible p-0 relative">
              <Image
                removeWrapper
                alt={item.title}
                className="w-full object-cover h-[250px] sm:h-[200px] lg:h-[300px]"
                radius="none"
                shadow="sm"
                src={item.img}
                width="100%"
              />

              <Button
                isIconOnly
                type="button"
                className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
                aria-label="Like"
                onPress={() => setLiked((v) => !v)}
              >
                <Heart
                  className={liked ? "text-red-500" : "text-red-300"}
                  fill={liked ? "red" : "none"}
                />
              </Button>
            </CardHeader>

            <CardFooter className="text-small">
              <div className="w-full">
                <div className="flex flex-row justify-between">
                  <b className="font-black text-xl text-tone-orange md:text-2xl">
                    {item.title}
                  </b>
                  <Chip
                    className="self-end"
                    classNames={{
                      base: "bg-tone-gray ",
                      content: "text-white",
                    }}
                    variant="shadow"
                  >
                    {item.province}
                  </Chip>
                </div>
                <div className="flex flex-col justify-start text-xs xl:text-base md:text-sm">
                  <div className="flex flex-row">
                    <b>สถาปัตยกรรม :</b>
                    <p>{item.architecture}</p>
                  </div>
                  <div className="flex flex-row">
                    <b>ที่ตั้ง :</b>
                    <p>{item.location}</p>
                  </div>
                  <div className="flex flex-row">
                    <b>เวลาเปิด-ปิด :</b>
                    <p>{item.time}</p>
                  </div>
                  <div className="flex flex-row">
                    <b>ค่าเข้าชม : </b>
                    <p>{item.price}</p>
                  </div>
                  <div className="flex flex-row">
                    <b>การเดินทาง :</b>
                    <p>{item.traveling}</p>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
