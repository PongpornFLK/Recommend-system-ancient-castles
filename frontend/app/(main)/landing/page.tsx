"use client";

import { Compass, ScanSearch } from "lucide-react";
import CardLanding from "@/app/components/cardlanding";
import Filter from "@/app/components/filter";
import SlideImg from "@/app/components/slideimg";
import Search from "@/app/components/searching";
import Dropzone from "@/app/components/dropzone";

export default function Landing() {
  return (
    <div>
      {/* Section  : Silde img */}
      <section className="p-0 m-0">
        <SlideImg />
      </section>

      {/* Section : Searching*/}
      <section className="my-5">
        <div className=" my-20">
          <div className="flex flew-row gap-3 my-20">
            <ScanSearch size={38} color="var(--color-tone-oldgray)" />
            <h1 className="font-bold text-3xl text-tone-oldgray">
              Search similar castle
            </h1>
          </div>
          <div className="flex flex-row gap-3">
            <div className="flex-1">
              <Search />
            </div>
            <Filter />
            <Dropzone />
          </div>
        </div>
      </section>

      {/* Section : Recommended nearby places */}
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
