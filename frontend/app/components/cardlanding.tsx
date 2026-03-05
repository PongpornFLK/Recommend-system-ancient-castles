"use client";
import React, { useMemo } from "react";
import { Landmark, History, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
// ดึงฟังก์ชันจัดการรูปภาพตามที่คุณตั้งค่าไว้
import { getCastleGalleryByName } from "../lib/castleImages";

interface Castle {
  castle_id: number;
  castle_name: string;
  era: string;
  type_detail: string;
  architecture: string;
}

export default function CardLanding({ castle }: { castle: Castle }) {
  // ค้นหารูปภาพที่ตรงกับชื่อปราสาท (รองรับระบบ Fuzzy Name ที่คุณเขียน)
  const gallery = useMemo(() => getCastleGalleryByName(castle.castle_name), [castle.castle_name]);
  const imageUrl = gallery.cover || "/assets/card/placeholder.jpg";

  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white shadow-sm transition-all hover:-translate-y-2 hover:shadow-2xl hover:ring-2 hover:ring-[#D2B48C]/30">
      
      {/* ส่วนแสดงรูปภาพ (Image Header) */}
      <div className="relative h-56 w-full overflow-hidden p-3">
        <img 
          src={imageUrl} 
          alt={castle.castle_name}
          className="h-full w-full rounded-[1.8rem] object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* เลเยอร์ตกแต่งขอบรูปภาพ */}
        <div className="absolute inset-0 rounded-[1.8rem] ring-1 ring-inset ring-black/5" />
      </div>

      <div className="px-6 pb-6 pt-2">
        <div className="mb-5">
          <h3 className="text-2xl font-black text-[#3E2723] line-clamp-1">
            {castle.castle_name}
          </h3>
        </div>
        
        <div className="space-y-4">
          {/* ข้อมูลยุคสมัย */}
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-50 p-2 text-amber-700 shadow-sm">
              <History size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400">ยุคสมัย</p>
              <p className="text-sm font-semibold text-stone-700">{castle.era || "ไม่ระบุ"}</p>
            </div>
          </div>

          {/* ข้อมูลคติความเชื่อ */}
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-700 shadow-sm">
              <Landmark size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400">คติความเชื่อ</p>
              <p className="text-sm font-semibold text-stone-700">{castle.type_detail || "ไม่ระบุ"}</p>
            </div>
          </div>

          {/* ข้อมูลลักษณะสถาปัตยกรรม */}
          <div className="flex items-start gap-3 border-t border-stone-100 pt-4">
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 shadow-sm">
              <Info size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400">สถาปัตยกรรมหลัก</p>
              <p className="text-sm italic leading-relaxed text-stone-500 line-clamp-2">
                {castle.architecture || "ไม่มีข้อมูลโครงสร้างระบุ"}
              </p>
            </div>
          </div>
        </div>

        {/* ปุ่มดูรายละเอียด */}
        <Link 
          href={`/castles/${castle.castle_id}`}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-[#5D4037] py-3.5 text-sm font-bold text-white transition-all hover:bg-[#3E2723] active:scale-95 shadow-lg shadow-stone-200"
        >
          ดูรายละเอียด <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}