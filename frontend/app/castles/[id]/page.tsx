"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, Heart, CalendarPlus, Route, 
  MapPin, Landmark, Info, History, Map as MapIcon,
  AlertCircle, RefreshCw
} from "lucide-react";
import { getCastleGalleryByName } from "../../lib/castleImages";
import axios from "axios";

// --- Types ---
type NearbyPlace = {
  place_name: string;
  nearby_detail?: string;
};

type CastleDetail = {
  castle_id: number;
  castle_name: string;
  castle_description?: string;
  era?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  architecture?: string;
  type_detail?: string;
  nearby_places?: NearbyPlace[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

function cleanText(s: string) {
  return (s || "").replace(/\r/g, "").replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Chip({ icon, children, className }: { icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border bg-white/50 px-3 py-1 text-xs font-medium text-[#5D4037] backdrop-blur-sm", className)}>
      {icon}
      {children}
    </span>
  );
}

function ActionButton({ variant, active, icon, children, onClick }: { variant: "brown" | "blue" | "amber"; active?: boolean; icon: React.ReactNode; children: React.ReactNode; onClick?: () => void }) {
  const themes = {
    brown: "bg-[#5D4037] hover:bg-[#3E2723] shadow-[#5D4037]/20",
    blue: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
    amber: "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95",
        themes[variant],
        active && "ring-4 ring-[#D2B48C]/30"
      )}
    >
      <span className={cn("transition-transform group-hover:scale-110")}>{icon}</span>
      {children}
    </button>
  );
}

export default function CastleDetailPage() {
  const params = useParams();
  
  const id = useMemo(() => {
    if (!params?.id) return "";
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params]);

  const [fav, setFav] = useState(false);
  const [interestId, setInterestId] = useState<number | null>(null); // เก็บ ID สำหรับใช้ลบ
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; url: string } | null>(null);
  const [data, setData] = useState<CastleDetail | null>(null);

  {/* ดึง user_id จาก localStorage เพื่อใช้จัดการรายการโปรด */}
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  const fetchData = async () => {
    if (!id || id === "undefined" || id === "[id]") return;

    setLoading(true);
    setError(null);
    const targetUrl = `${API_BASE}/castles/${id}`;

    try {
      const res = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 0 } 
      } as any);

      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const d = await res.json();
      setData(d);

      {/* ตรวจสอบสถานะการกดถูกใจและดึง ID จากฐานข้อมูล */}
      if (userId) {
        try {
          const favCheck = await axios.get(`${API_BASE}/interests/check`, {
            params: { user_id: userId, castle_id: d.castle_id }
          });
          setFav(favCheck.data.is_favorite);
          if (favCheck.data.interest_id) {
            setInterestId(favCheck.data.interest_id);
          }
        } catch (fErr) {
          console.error("Favorite check error:", fErr);
        }
      }

    } catch (e: any) {
      setError({ 
        message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Backend ได้",
        url: targetUrl
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  {/* ฟังก์ชันจัดการการเพิ่มและลบ รายการโปรดแบบ Toggle */}
  const toggleFavorite = async () => {
    if (!userId) {
      alert("กรุณาเข้าสู่ระบบก่อนทำรายการ");
      return;
    }

    try {
      if (!fav) {
        {/* กรณี: ยังไม่เป็นรายการโปรด -> ให้เพิ่ม (POST) */}
        const res = await axios.post(`${API_BASE}/interests`, {
          user_id: parseInt(userId),
          castle_id: data?.castle_id,
          interest_name: data?.castle_name
        });
        
        if (res.data.interest_id) {
          setInterestId(res.data.interest_id);
        }
        setFav(true);
      } else {
        {/* กรณี: เป็นรายการโปรดอยู่แล้ว -> ให้ลบออก (DELETE) */}
        if (interestId) {
          await axios.delete(`${API_BASE}/interests/${interestId}`);
          setFav(false);
          setInterestId(null);
        } else {
          // ถ้าไม่มี ID ให้ลองดึงข้อมูลใหม่อีกครั้ง
          fetchData();
        }
      }
    } catch (err) {
      console.error("Toggle favorite failed:", err);
    }
  };

  const gallery = useMemo(() => getCastleGalleryByName(data?.castle_name || ""), [data?.castle_name]);
  const hero = gallery.cover || "/assets/card/placeholder.jpg";
  const side = gallery.others?.length ? gallery.others : [hero, hero, hero];
  const locationText = [data?.subdistrict, data?.district, data?.province].filter(Boolean).join(" • ") || "ไม่ระบุตำแหน่ง";

  if (loading) return (
    <div className="mx-auto max-w-7xl p-8 space-y-6 animate-pulse">
      <div className="h-10 w-32 bg-stone-200 rounded-lg" />
      <div className="h-[500px] bg-stone-200 rounded-3xl" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 max-w-lg shadow-xl shadow-rose-100/50">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-stone-800 mb-2">Failed to Fetch</h2>
        <p className="text-stone-600 mb-6 leading-relaxed">
          {error.message} <br/> 
          <code className="bg-rose-100 px-2 py-1 rounded text-xs font-mono text-rose-700 break-all">{error.url}</code>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => fetchData()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" /> ลองใหม่อีกครั้ง
          </button>
          <Link href="/landing" className="px-6 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl font-bold hover:bg-stone-50 transition-all text-center">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="mx-auto max-w-7xl pb-12 space-y-8 p-4 md:p-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/landing" className="group flex items-center gap-3 text-sm font-bold text-[#5D4037] transition-colors hover:text-[#3E2723]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EADDCA] shadow-sm ring-1 ring-[#D2B48C]/50 transition-transform group-hover:-translate-x-1">
            <ArrowLeft className="h-5 w-5 text-[#5D4037]" />
          </div>
          <span className="text-base font-bold">กลับ</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight text-[#3E2723] lg:text-5xl">{data.castle_name}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <Chip icon={<Landmark className="h-3.5 w-3.5" />} className="bg-[#F5F5DC] border-[#D2B48C]/30 text-[#8B4513]">
                {data.era ? cleanText(data.era) : "สมัยโบราณ"}
              </Chip>
              <Chip icon={<MapPin className="h-3.5 w-3.5" />} className="bg-emerald-50 text-emerald-700 border-emerald-100">
                {locationText}
              </Chip>
            </div>
          </div>

          {/* Image Display */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:grid-rows-2 h-[450px]">
            <div className="sm:col-span-3 sm:row-span-2 overflow-hidden rounded-3xl border-4 border-white shadow-xl">
              <img src={hero} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" alt="Hero" />
            </div>
            {side.slice(0, 2).map((src, i) => (
              <div key={i} className="hidden sm:block overflow-hidden rounded-2xl border-4 border-white shadow-lg">
                <img src={src} className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" alt="Sub" />
              </div>
            ))}
          </div>

          {/* Description Sections */}
          <div className="space-y-8">
            <section className="relative overflow-hidden rounded-3xl bg-[#F5F5DC] p-8 shadow-sm ring-1 ring-[#EADDCA]">
              <div className="flex items-center gap-3 mb-4 text-[#5D4037]">
                <History className="h-6 w-6" />
                <h2 className="text-2xl font-bold">ประวัติความเป็นมา</h2>
              </div>
              <p className="text-lg leading-relaxed text-[#5D4037]/90 first-letter:text-4xl first-letter:font-bold first-letter:text-[#3E2723]">
                {data.castle_description ? cleanText(data.castle_description) : "ไม่มีข้อมูลประวัติศาสตร์ระบุไว้"}
              </p>
            </section>

            <section className="rounded-3xl bg-white p-8 ring-1 ring-[#EADDCA] shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-[#3E2723]">
                <Info className="h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-bold">ความสำคัญและสถาปัตยกรรม</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-bold text-[#5D4037]">ลักษณะโครงสร้าง</h3>
                  <p className="text-stone-600 leading-relaxed">{data.architecture || "—"}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-[#5D4037]">คติความเชื่อ</h3>
                  <p className="text-stone-600 leading-relaxed">{data.type_detail || "—"}</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Sidebar Actions */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-8 space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-xl shadow-stone-200/50 ring-1 ring-stone-100">
              <h3 className="mb-4 text-center font-bold text-stone-400 uppercase tracking-widest text-xs text-[#8B4513]/50">วางแผนการเดินทาง</h3>
              <div className="flex flex-col gap-3">
                {/* ปุ่ม Favorite ที่รองรับทั้งการเพิ่มและลบรายการ */}
                <ActionButton 
                  variant="brown" 
                  active={fav} 
                  icon={<Heart className={cn("h-5 w-5", fav && "fill-current text-rose-500")} />} 
                  onClick={toggleFavorite}
                >
                  {fav ? "บันทึกแล้ว" : "เพิ่มในรายการโปรด"}
                </ActionButton>
                <ActionButton variant="blue" icon={<CalendarPlus className="h-5 w-5" />}>สร้างแผนท่องเที่ยว</ActionButton>
                <ActionButton variant="amber" icon={<Route className="h-5 w-5" />}>ดูเส้นทางบนแผนที่</ActionButton>
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-[#D2B48C] p-6 bg-[#F5F5DC]/30">
              <div className="flex items-center gap-2 mb-4 font-bold text-[#5D4037]">
                <MapIcon className="h-5 w-5 text-emerald-600" />
                <h3>สถานที่ใกล้เคียง</h3>
              </div>
              <div className="space-y-3">
                {data.nearby_places?.length ? (
                  data.nearby_places.map((p, i) => (
                    <div key={i} className="group rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#EADDCA] transition-hover hover:bg-[#F5F5DC]">
                      <div className="font-bold text-[#5D4037] group-hover:text-[#8B4513] transition-colors">{p.place_name}</div>
                      {p.nearby_detail && <p className="mt-1 text-xs text-stone-500 leading-relaxed">{p.nearby_detail}</p>}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-sm text-stone-400 italic">ไม่มีข้อมูลสถานที่ใกล้เคียง</div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}