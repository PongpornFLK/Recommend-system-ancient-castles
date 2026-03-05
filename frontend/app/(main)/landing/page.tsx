"use client";

import { Compass, ScanSearch, Image, FileText } from "lucide-react";
import CardLanding from "@/app/components/cardlanding";
import SlideImg from "@/app/components/slideimg";
import Search from "@/app/components/searching";
import Dropzone from "@/app/components/dropzone";
import { Tabs, Tab } from "@heroui/react";

export default function Landing() {
  // ข้อมูลตัวอย่างสำหรับแสดงในหน้าแรก (Mock Data)
  const featuredCastles = [
    {
      castle_id: 1,
      castle_name: "ปราสาทหินพิมาย",
      era: "ยุคเมืองพระนคร",
      type_detail: "เทวสถาน (พุทธศาสนานิกายมหายาน)",
      architecture: "ศิลปะแบบปาปวนและนครวัด สร้างด้วยหินทรายและศิลาแลง"
    },
    {
      castle_id: 2,
      castle_name: "ปราสาทหินพนมรุ้ง",
      era: "ยุคเมืองพระนคร",
      type_detail: "ศาสนสถานในศาสนาฮินดู (ไศวนิกาย)",
      architecture: "สถาปัตยกรรมขอมโบราณแบบนครวัด ตั้งอยู่บนยอดภูเขาไฟ"
    }
  ];

  return (
    <div>
      <section className="p-0 m-0">
        <SlideImg />
      </section>

      <section className="my-5 px-4 md:px-10">
        <div className="my-20">
          <div className="flex flex-row gap-3 my-10 items-center">
            <ScanSearch size={38} className="text-tone-oldgray" />
            <h1 className="font-bold text-3xl text-tone-oldgray">
              Castle Similarity Search
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100">
            <div className="p-5">
              <Tabs aria-label="Search Options" variant="underlined" color="warning">
                <Tab
                  key="text"
                  title={
                    <div className="flex items-center space-x-2">
                      <FileText size={18} />
                      <span>Search with Text & Filters</span>
                    </div>
                  }
                >
                  <div className="py-4">
                    <Search />
                  </div>
                </Tab>

                <Tab
                  key="image"
                  title={
                    <div className="flex items-center space-x-2">
                      <Image size={18} />
                      <span>Search by Image</span>
                    </div>
                  }
                >
                  <div className="py-4">
                    <Dropzone />
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      <section className="my-10 px-4 md:px-10 pb-20">
        <div className="mb-10">
          <div className="flex flex-row gap-3 items-center">
            <Compass size={38} className="text-tone-oldgray" />
            <h1 className="font-bold text-3xl text-tone-oldgray uppercase tracking-tight">
              Interesting Places
            </h1>
          </div>
          <p className="text-stone-500 mt-2">โบราณสถานที่น่าสนใจและมีการสืบค้นมากที่สุด</p>
        </div>
        
        {/* ส่วนแสดง Card โดยใช้ข้อมูลเปรียบเทียบลักษณะเด่น */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCastles.map((castle) => (
            <CardLanding key={castle.castle_id} castle={castle} />
          ))}
        </div>
      </section>
    </div>
  );
}