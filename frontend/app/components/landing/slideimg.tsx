"use client";

import { Navigation, Pagination, Scrollbar, A11y , Keyboard, Autoplay } from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";
import { Image, Button } from "@heroui/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

export default function SlideImg() {
  const castles = [
    { title: "ปราสาทหินพิมาย", img: "/assets/phimai/phimai.jpg" },
    { title: "ปราสาทพนมรุ้ง", img: "/assets/phanomRung/pnr3.jpg" },
    { title: "ปราสาทเมืองต่ำ", img: "/assets/muangTam/mtam.jpg" },
  ];
  return (
    <div>
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Keyboard, Autoplay]}
        spaceBetween={50}
        slidesPerView={1}
        keyboard={{
            enabled: true,
        }}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        navigation
        pagination={{ clickable: true }}
        scrollbar={{ draggable: true }}
        onSwiper={(swiper) => console.log(swiper)}
        onSlideChange={() => console.log("slide change")}
        className="h-96"
      >
        {castles.map((castle, index) => (
          <SwiperSlide key={index}>
            <Image
              removeWrapper
              src={castle.img}
              alt={castle.title}
              className="w-full h-96 object-cover"
              width={"100%"}
              //   height={"100%"}
            />
            <Button
              type="button"
              className="absolute top-3 right-3 z-10 rounded-full p-2 hover:scale-110 transition-transform bg-opacity-0 border border-white text-white hover:bg-white-100"
              aria-label="Like"
            >
              See more
            </Button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
