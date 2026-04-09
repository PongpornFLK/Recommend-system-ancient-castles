"use client";

import { Navigation, Pagination, Scrollbar, A11y, Keyboard, Autoplay } from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";
import { Image, Button } from "@heroui/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SlideImg() {
  const castles = [
    { id: 1, title: "ปราสาทหินพิมาย", img: "/assets/phimai/phimai.jpg" },
    { id: 2, title: "ปราสาทพนมรุ้ง", img: "/assets/phanomRung/pnr3.jpg" },
    { id: 3, title: "ปราสาทเมืองต่ำ", img: "/assets/muangTam/mtam.jpg" },
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
          delay: 7500,
          disableOnInteraction: false,
        }}
        navigation
        pagination={{ clickable: true }}
        scrollbar={{ draggable: true }}
        className="h-96"
      >
        {castles.map((castle, index) => (
          <SwiperSlide key={index} className="relative group overflow-hidden">
            <Image
              removeWrapper
              src={castle.img}
              alt={castle.title}
              className="w-full h-96 object-cover transition-transform duration-1000 group-hover:scale-110"
              width={"100%"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

            <div className="absolute bottom-10 left-10 z-20 flex flex-col items-start">
              <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-xl tracking-tight mb-2">
                {castle.title}
              </h2>

              <Button
                as={Link}
                href={`/castles/${castle.id}`}
                endContent={<ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />}
                className="group/btn bg-white/20 backdrop-blur-xl border border-white/30 text-white font-bold px-8 py-6 rounded-2xl hover:bg-white hover:text-stone-900 transition-all duration-300 shadow-2xl"
              >
                See Details
              </Button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
