"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Heart,
  CalendarPlus,
  Route,
  MapPin,
  Landmark,
  Info,
  FileText,
  Map as MapIcon,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";
import { getCastleGalleryByName } from "../../lib/castleImages";
import api from "@/app/service/api";
import { Chip, Button } from "@heroui/react";
import Navbars from "@/app/components/navbars";

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

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

function cleanText(s: string) {
  return (s || "")
    .replace(/\r/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function CastleDetailPage() {
  const router = useRouter();
  const params = useParams();

  const id = useMemo(() => {
    if (!params?.id) return "";
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params]);

  const [fav, setFav] = useState(false);
  const [interestId, setInterestId] = useState<number | null>(null); // เก็บ ID สำหรับใช้ลบ
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; url: string } | null>(
    null,
  );
  const [data, setData] = useState<CastleDetail | null>(null);

  {
    /* ดึง user_id จาก localStorage เพื่อใช้จัดการรายการโปรด */
  }
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  const fetchData = async () => {
    if (!id || id === "undefined" || id === "[id]") return;

    setLoading(true);
    setError(null);
    const targetUrl = `${API_BASE}/castles/${id}`;

    try {
      const res = await fetch(targetUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 0 },
      } as RequestInit);

      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const d = await res.json();
      setData(d);

      {
        /* ตรวจสอบสถานะการกดถูกใจและดึง ID จากฐานข้อมูล */
      }
      if (userId) {
        try {
          const favCheck = await api.get(`/interests/check?user_id=${userId}&castle_id=${d.castle_id}`);
          setFav(favCheck.data.is_favorite);
          if (favCheck.data.interest_id) {
            setInterestId(favCheck.data.interest_id);
          }
        } catch (fErr) {
          console.error("Favorite check error:", fErr);
        }
      }
    } catch (err) {
      console.error("Fetch failure:", err);
      setError({
        message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Backend ได้",
        url: targetUrl,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  {
    /* ฟังก์ชันจัดการการเพิ่มและลบ รายการโปรดแบบ Toggle */
  }
  const toggleFavorite = async () => {
    if (!userId) {
      alert("กรุณาเข้าสู่ระบบก่อนทำรายการ");
      return;
    }

    try {
      if (!fav) {
        {
          /* กรณี: ยังไม่เป็นรายการโปรด -> ให้เพิ่ม (POST) */
        }
        const res = await api.post("/interests", {
          user_id: parseInt(userId),
          castle_id: data?.castle_id,
          interest_name: data?.castle_name,
        });

        if (res.data.interest_id) {
          setInterestId(res.data.interest_id);
        }
        setFav(true);
      } else {
        {
          /* กรณี: เป็นรายการโปรดอยู่แล้ว -> ให้ลบออก (DELETE) */
        }
        if (interestId) {
          await api.delete(`/interests/${interestId}`);
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

  const gallery = useMemo(
    () => getCastleGalleryByName(data?.castle_name || ""),
    [data?.castle_name],
  );
  const hero = gallery.cover || "/assets/card/placeholder.jpg";
  const side = gallery.others?.length ? gallery.others : [hero, hero, hero];
  const locationText =
    [data?.subdistrict, data?.district, data?.province]
      .filter(Boolean)
      .join(" • ") || "ไม่ระบุตำแหน่ง";

  if (loading)
    return (
      <div className="mx-auto max-w-7xl p-8 space-y-6 animate-pulse">
        <div className="h-10 w-32 bg-stone-200 rounded-lg" />
        <div className="h-[500px] bg-stone-200 rounded-3xl" />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 max-w-lg shadow-xl shadow-rose-100/50">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-stone-800 mb-2">
            Failed to Fetch
          </h2>
          <p className="text-stone-600 mb-6 leading-relaxed">
            {error.message} <br />
            <code className="bg-rose-100 px-2 py-1 rounded text-xs font-mono text-rose-700 break-all">
              {error.url}
            </code>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onPress={() => fetchData()}
              className="bg-stone-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 px-6 h-12"
              startContent={<RefreshCw className="w-4 h-4" />}
            >
              ลองใหม่อีกครั้ง
            </Button>
            <Button
              as={Link}
              href="/landing"
              variant="bordered"
              className="px-6 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl font-bold hover:bg-stone-50 transition-all text-center h-12"
            >
              กลับหน้าหลัก
            </Button>
          </div>
        </div>
      </div>
    );

  if (!data) return null;

  return (
    <div>
      <Navbars />
      <div className="mx-auto max-w-7xl pb-12 space-y-8 p-4 md:p-8">
        {/* 1. Back Button - บนสุด */}
        <div className="flex">
          <Button
            as={Link}
            href="/landing"
            variant="light"
            className="group flex h-auto p-0 flex-start items-center gap-3 text-sm font-bold text-[#5D4037] hover:bg-transparent min-w-0"
            disableAnimation={false}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 ring-[#D2B48C]/40 transition-transform group-hover:-translate-x-1">
              <ChevronLeft className="h-6 w-6 text-[#5D4037]" />
            </div>
            <span className="text-lg font-bold hidden sm:block">กลับ</span>
          </Button>
        </div>

        {/* 2. Title & Chips - อยู่ใต้ปุ่มย้อนกลับ */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#3E2723]">
            {data.castle_name}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <Chip
              variant="bordered"
              startContent={<Landmark className="h-3.5 w-3.5" />}
              className="bg-white border-[#D2B48C]/30 text-[#8B4513] py-2 px-4 text-sm"
            >
              {data.era ? cleanText(data.era) : "สมัยโบราณ"}
            </Chip>
            <Chip
              variant="bordered"
              startContent={<MapPin className="h-3.5 w-3.5" />}
              className="bg-white text-emerald-700 border-emerald-100 py-2 px-4 text-sm"
            >
              {locationText}
            </Chip>
          </div>
        </div>

        {/* 3. Main Content Grid - รูปภาพและ Sidebar เริ่มต้นระดับเดียวกัน */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-8">
            {/* Image Display */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:grid-rows-2 h-[450px]">
              <div className="sm:col-span-3 sm:row-span-2 overflow-hidden rounded-2xl border-4 border-white shadow-2xl shadow-stone-200/50">
                <img
                  src={hero}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  alt="Hero"
                />
              </div>
              {side.slice(0, 2).map((src, i) => (
                <div
                  key={i}
                  className="hidden sm:block overflow-hidden rounded-2xl border-4 border-white shadow-xl shadow-stone-200/40"
                >
                  <img
                    src={src}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                    alt="Sub"
                  />
                </div>
              ))}
            </div>

            {/* Description Sections */}
            <div className="space-y-8">
              <section className="relative overflow-hidden rounded-2xl bg-white p-8 ring-1 ring-stone-200 shadow-sm shadow-stone-100">
                <div className="flex items-center gap-3 mb-6 text-[#8B4513]">
                  <div className="p-2 bg-stone-100 rounded-lg">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-black text-[#3E2723]">
                    ประวัติความเป็นมา
                  </h2>
                </div>
                <p className="text-lg leading-relaxed text-stone-600 first-letter:text-4xl first-letter:font-bold first-letter:text-[#8B4513] first-letter:mr-1">
                  {data.castle_description
                    ? cleanText(data.castle_description)
                    : "ไม่มีข้อมูลประวัติศาสตร์ระบุไว้"}
                </p>
              </section>

              <section className="rounded-2xl bg-stone-50/30 p-8 ring-1 ring-stone-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6 text-[#3E2723]">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Info className="h-5 w-5 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-black">
                    ความสำคัญและสถาปัตยกรรม
                  </h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="font-bold text-[#5D4037]">
                      ลักษณะโครงสร้าง
                    </h3>
                    <p className="text-stone-600 leading-relaxed">
                      {data.architecture || "—"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-[#5D4037]">คติความเชื่อ</h3>
                    <p className="text-stone-600 leading-relaxed">
                      {data.type_detail || "—"}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar Actions */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-8 space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] ring-1 ring-stone-100">
                <h3 className="mb-4 text-center font-bold text-stone-400 uppercase tracking-widest text-xs text-[#8B4513]/50">
                  วางแผนการเดินทาง
                </h3>
                <div className="flex flex-col gap-3">
                  {/* ปุ่ม Favorite ที่รองรับทั้งการเพิ่มและลบรายการ */}
                  <Button
                    fullWidth
                    size="md"
                    onPress={toggleFavorite}
                    startContent={
                      <Heart
                        className={cn(
                          "h-5 w-5",
                          fav ? "fill-current text-rose-500" : "text-white",
                        )}
                      />
                    }
                    className={cn(
                      "bg-[#5D4037] text-white font-bold transition-all justify-start px-6",
                      fav && "ring-4 ring-[#D2B48C]/30",
                    )}
                  >
                    {fav ? "บันทึกแล้ว" : "เพิ่มในรายการโปรด"}
                  </Button>

                  <Button
                    fullWidth
                    size="md"
                    startContent={<CalendarPlus className="h-5 w-5" />}
                    onPress={() =>
                      router.push(`/plan?castle_id=${data.castle_id}`)
                    }
                    className="bg-blue-600 hover:bg-blue-700 font-bold text-white justify-start px-6"
                  >
                    สร้างแผนการเดินทาง
                  </Button>

                  <Button
                    fullWidth
                    size="md"
                    startContent={<Route className="h-5 w-5 text-white" />}
                    onPress={() => router.push(`/tripplan`)}
                    className="bg-amber-500 hover:bg-amber-600 font-bold text-white justify-start px-6"
                  >
                    แผนการเดินทางของเรา
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-100 p-6 bg-white shadow-sm ring-1 ring-stone-100">
                <div className="flex items-center gap-2 mb-6 font-bold text-stone-800">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <MapIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3>สถานที่ใกล้เคียง</h3>
                </div>
                <div className="space-y-3">
                  {data.nearby_places?.length ? (
                    data.nearby_places.map((p, i) => (
                      <div
                        key={i}
                        className="group rounded-xl bg-stone-50/50 p-4 border border-stone-100 transition-all hover:bg-white hover:shadow-md hover:border-stone-200"
                      >
                        <div className="font-bold text-stone-700 group-hover:text-[#8B4513] transition-colors">
                          {p.place_name}
                        </div>
                        {p.nearby_detail && (
                          <p className="mt-1 text-xs text-stone-500 leading-relaxed uppercase tracking-wider font-medium">
                            {p.nearby_detail}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-stone-400 italic">
                      ไม่มีข้อมูลสถานที่ใกล้เคียง
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
