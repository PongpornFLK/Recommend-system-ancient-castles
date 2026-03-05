"use client";
import React from "react";
import { Landmark, History, Info, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Castle {
  castle_id: number;
  castle_name: string;
  era: string;
  type_detail: string;
  architecture: string;
}

export default function CardLanding({ castle }: { castle: Castle }) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-[#D2B48C]/30">
      <div className="mb-4">
        <h3 className="text-xl font-black text-[#3E2723] line-clamp-1">{castle.castle_name}</h3>
      </div>
      
      <div className="space-y-4">
        {/* ยุคสมัย */}
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
            <History size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400">ยุคสมัย</p>
            <p className="text-sm font-semibold text-stone-700">{castle.era}</p>
          </div>
        </div>

        {/* คติความเชื่อ */}
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
            <Landmark size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400">คติความเชื่อ</p>
            <p className="text-sm font-semibold text-stone-700">{castle.type_detail}</p>
          </div>
        </div>

        {/* ลักษณะโครงสร้าง */}
        <div className="flex items-start gap-3 border-t border-stone-100 pt-4">
          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
            <Info size={18} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400">ลักษณะสถาปัตยกรรม</p>
            <p className="text-sm italic leading-relaxed text-stone-500 line-clamp-2">
              {castle.architecture}
            </p>
          </div>
        </div>
      </div>

      <Link 
        href={`/castles/${castle.castle_id}`}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5D4037] py-3 text-sm font-bold text-white transition-colors hover:bg-[#3E2723]"
      >
        ดูรายละเอียด <ArrowRight size={16} />
      </Link>
    </div>
  );
}