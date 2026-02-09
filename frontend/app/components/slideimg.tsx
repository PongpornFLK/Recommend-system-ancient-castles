"use client";

import { Navigation, Pagination, Scrollbar, A11y , Keyboard, Autoplay } from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";
import { Card, CardBody, Image, Button } from "@heroui/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

export default function SlideImg() {
  const castles = [
    { title: "ปราสาทตาควาย", img: "/assets/card/castle1.png" },
    { title: "ปราสาทพระวิหาร", img: "/assets/card/castle1.png" },
    { title: "ปราสาทสด๊กก็อกธม", img: "/assets/card/castle1.png" },
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
              className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
              aria-label="Like"
            >
              see more
            </Button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
