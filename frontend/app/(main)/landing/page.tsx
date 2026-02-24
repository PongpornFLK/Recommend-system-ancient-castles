"use client";

import { Compass, ScanSearch, Image, FileText } from "lucide-react";
import CardLanding from "@/app/components/cardlanding";
import SlideImg from "@/app/components/slideimg";
import Search from "@/app/components/searching";
import Dropzone from "@/app/components/dropzone";
import { Tabs, Tab } from "@heroui/react";

export default function Landing() {
  return (
    <div>
      <section className="p-0 m-0">
        <SlideImg />
      </section>

      <section className="my-5">
        <div className=" my-20">
          <div className="flex flew-row gap-3 my-10">
            <ScanSearch size={38} color="var(--color-tone-oldgray)" />
            <h1 className="font-bold text-3xl text-tone-oldgray">
              Castle Similarity Search
            </h1>
          </div>

          <div className="bg-white max-h max-w rounded-2xl">
            <div className="p-5">
              <Tabs>
                <Tab
                  key="text"
                  title={
                    <div className="flex items-center space-x-2 ">
                      <FileText size={18} />
                      <span>Search with Text & Filters</span>
                    </div>
                  }
                >
                  {/* ✅ ให้ Search จัดการ Filter เอง (จะเหลือปุ่มเดียว) */}
                  <Search />
                </Tab>

                <Tab
                  key="image"
                  title={
                    <div className="flex items-center space-x-2 ">
                      <Image size={18} />
                      <span>Search by Image</span>
                    </div>
                  }
                >
                  <Dropzone />
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      <section className="my-5">
        <div>
          <div className="flex flew-row gap-3">
            <Compass size={38} color="var(--color-tone-oldgray)" />
            <h1 className="font-bold text-3xl text-tone-oldgray">
              Recommended nearby places
            </h1>
          </div>
        </div>
        <div>
          <CardLanding />
        </div>
      </section>
    </div>
  );
}