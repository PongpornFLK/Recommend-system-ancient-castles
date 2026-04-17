/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowRight,
  Search,
  Sparkles,
  Filter as FilterIcon,
  MessageSquare,
  MapPin,
  RefreshCcw,
  Info,
  Route,
  CalendarDays,
  MapPinned,
} from "lucide-react";
import { addToast } from "@heroui/react";

import Filter, { type FilterValues } from "./filter";
import { getCastleGalleryByName } from "../../lib/castleImages";
import api from "@/app/service/api";

type Castle = {
  castle_id: number;
  castle_name: string;
  castle_description?: string;
  era?: string;
  type_id?: number;
  best_score?: number;
  type_detail?: string;
  architecture?: string;
  festivals?: string;
};

type NearbyPlace = {
  nearplace_id?: number;
  castle_id?: number;
  place_name: string;
  nearby_detail?: string;
  latitude?: number;
  longitude?: number;
};

type EventItem = {
  event_id?: number;
  castle_id?: number;
  event_name: string;
  event_description?: string;
  event_start_date?: string;
  event_end_date?: string;
  event_start_time?: string;
  event_end_time?: string;
};

type RouteInfo = {
  castle_id?: number;
  castle_name?: string;
  latitude?: number;
  longitude?: number;
  sub_district?: string;
  district?: string;
  province?: string;
};

type QAResponse = {
  answer?: string;
  intent?: string;
  castles?: Castle[];
  nearby_places?: NearbyPlace[];
  events?: EventItem[];
  route?: RouteInfo | null;
  plan_link?: string | null;
  map_link?: string | null;
};

type FilterResponse = {
  castles?: Castle[];
};

function cleanText(s: string) {
  return (s || "")
    .replace(/\r/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncate(s: string, n = 160) {
  const t = cleanText(s);
  return t.length <= n ? t : `${t.slice(0, n).trimEnd()}…`;
}

function dedupeCastles(list: Castle[]) {
  const seen = new Set<string>();
  return (list || []).filter((c) => {
    const key = `${c.castle_id}|${c.castle_name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ResultCard({ c, idx }: { c: Castle; idx: number }) {
  const g = getCastleGalleryByName(c.castle_name);
  const cover = g.cover || "/assets/card/placeholder.jpg";

  return (
    <div className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-slate-200 transition-all duration-300">
      <div className="relative h-48">
        <img
          src={cover}
          alt={c.castle_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute left-3 bottom-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white tracking-widest uppercase">
          Rank #{idx + 1}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-slate-900 leading-tight line-clamp-1">
          {c.castle_name}
        </h3>

        <p className="text-xs text-indigo-600 font-medium mt-1">
          {c.era || "ไม่ระบุสมัย"}
        </p>

        <p className="mt-3 text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {c.castle_description
            ? truncate(c.castle_description)
            : "ไม่มีคำอธิบายข้อมูล"}
        </p>

        <div className="mt-5">
          <Link
            href={`/castles/${c.castle_id}`}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            รายละเอียด <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Searching() {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [qaCastles, setQaCastles] = useState<Castle[]>([]);

  const [filterValue, setFilterValue] = useState<FilterValues>({});
  const [filterCastles, setFilterCastles] = useState<Castle[]>([]);

  const [activeMode, setActiveMode] = useState<"qa" | "filter">("qa");
  const [loading, setLoading] = useState(false);

  const [intent, setIntent] = useState<string>("");
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [planLink, setPlanLink] = useState<string | null>(null);
  const [mapLink, setMapLink] = useState<string | null>(null);

  const resetQaState = () => {
    setAnswer("");
    setIntent("");
    setQaCastles([]);
    setNearbyPlaces([]);
    setEvents([]);
    setRouteInfo(null);
    setPlanLink(null);
    setMapLink(null);
  };

  const onSearchQA = async () => {
    const query = q.trim();
    if (!query) return;

    setLoading(true);
    try {
      const { data } = await api.post<QAResponse>("/zilliz/qa", {
        query,
        k: 5,
      });

      setAnswer(cleanText(data.answer || ""));
      setQaCastles(dedupeCastles(data.castles || []));
      setIntent(data.intent || "");
      setNearbyPlaces(data.nearby_places || []);
      setEvents(data.events || []);
      setRouteInfo(data.route || null);
      setPlanLink(data.plan_link || null);
      setMapLink(data.map_link || null);
      setActiveMode("qa");
    } catch (err) {
      console.error("QA search failed:", err);
      addToast({
        title: "ค้นหาไม่สำเร็จ",
        description: "กรุณาลองใหม่อีกครั้ง",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const onApplyFilter = async (v: FilterValues) => {
    setFilterValue(v);
    setLoading(true);
    try {
      const { data } = await api.post<FilterResponse>("/filters/search", v);

      setFilterCastles(dedupeCastles(data.castles || []));
      setActiveMode("filter");
      resetQaState();
    } catch (err) {
      console.error("Filter search failed:", err);
      addToast({
        title: "กรองข้อมูลไม่สำเร็จ",
        description: "กรุณาลองใหม่อีกครั้ง",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const castlesToShow = useMemo(() => {
    return activeMode === "filter" ? filterCastles : qaCastles;
  }, [activeMode, filterCastles, qaCastles]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <section className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Sparkles className="h-5 w-5 text-indigo-500 transition-colors group-focus-within:text-indigo-600" />
            </div>

            <input
              className="w-full pl-12 pr-4 h-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700 placeholder:text-slate-400"
              placeholder="ค้นหาหรือถามคำถาม เช่น เทศกาลที่พิมาย / สถานที่ใกล้พิมาย / แนะนำการเดินทางพิมาย"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearchQA()}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={onSearchQA}
              disabled={loading || !q.trim()}
              className="flex-1 md:flex-none px-8 h-12 bg-[#5D4037] hover:bg-[#3E2723] text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-brown-900/20"
            >
              {loading && activeMode === "qa" ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              ค้นหา
            </button>

            <Filter
              value={filterValue}
              onApply={onApplyFilter}
              onClear={() => {
                setFilterValue({});
                setFilterCastles([]);
                setActiveMode("qa");
                resetQaState();
              }}
            />
          </div>
        </div>
      </section>

      {activeMode === "qa" && answer && (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#FDFDF0] text-slate-800 shadow-xl shadow-stone-200/40 border border-[#EADDCA]">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <MessageSquare className="w-32 h-32 text-[#8B4513]" />
          </div>

          <div className="relative p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6 text-[#8B4513]">
              <Sparkles className="h-6 w-6" />
              <span className="text-sm font-black uppercase tracking-[0.2em] opacity-80 text-stone-500">
                Your answer
              </span>
            </div>

            <div
              className="prose prose-stone prose-xl max-w-none
                         text-[#4E342E] leading-relaxed font-medium
                         prose-headings:text-[#3E2723] prose-headings:font-black
                         prose-p:text-lg prose-p:leading-loose
                         prose-li:text-lg prose-li:leading-relaxed"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {answer}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {activeMode === "qa" && qaCastles.length > 0 && (
        <div className="rounded-[2rem] bg-white border border-stone-200 shadow-md p-6 md:p-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                Trip Planning
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-stone-800 mt-1">
                วางแผนเที่ยวสำหรับ {qaCastles[0]?.castle_name}
              </h3>
              <p className="text-sm md:text-base text-stone-500 mt-2">
                ระบบพบข้อมูลสถานที่ที่คุณถามแล้ว สามารถไปยังหน้าวางแผนเที่ยวหรือหน้าดูเส้นทางต่อได้
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {mapLink && (
                <Link
                  href={mapLink}
                  className="inline-flex items-center justify-center gap-2 px-5 h-12 rounded-2xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-all"
                >
                  ดูแผนที่
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <Link
                href={planLink || `/plan?castle_id=${qaCastles[0]?.castle_id}`}
                className="inline-flex items-center justify-center gap-2 px-5 h-12 rounded-2xl bg-[#5D4037] hover:bg-[#3E2723] text-white font-bold transition-all"
              >
                วางแผนเที่ยว
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeMode === "qa" && intent === "travel" && routeInfo && (
        <div className="rounded-[2rem] bg-white border border-blue-100 shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Route className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-800">
              แนะนำการเดินทาง
            </h3>
          </div>

          <div className="space-y-2 text-slate-600">
            <p>
              <span className="font-semibold">จังหวัด:</span>{" "}
              {routeInfo.province || "-"}
            </p>
            <p>
              <span className="font-semibold">อำเภอ:</span>{" "}
              {routeInfo.district || "-"}
            </p>
            <p>
              <span className="font-semibold">ตำบล:</span>{" "}
              {routeInfo.sub_district || "-"}
            </p>
            <p>
              <span className="font-semibold">พิกัด:</span>{" "}
              {routeInfo.latitude ?? "-"}, {routeInfo.longitude ?? "-"}
            </p>

            {mapLink && (
              <Link
                href={mapLink}
                className="inline-flex items-center gap-2 mt-3 text-blue-600 font-semibold hover:underline"
              >
                ดูแผนที่และเส้นทาง
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}

      {activeMode === "qa" && intent === "nearby" && nearbyPlaces.length > 0 && (
        <div className="rounded-[2rem] bg-white border border-emerald-100 shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPinned className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-bold text-slate-800">
              สถานที่ใกล้เคียง
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyPlaces.map((place, index) => (
              <div
                key={`${place.place_name}-${index}`}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <h4 className="font-bold text-slate-800">{place.place_name}</h4>
                <p className="text-sm text-slate-500 mt-2">
                  {place.nearby_detail || "ไม่มีรายละเอียด"}
                </p>

                {place.latitude != null && place.longitude != null && (
                  <p className="mt-3 text-sm text-slate-600">
                    <span className="font-semibold">พิกัด:</span>{" "}
                    {place.latitude}, {place.longitude}
                  </p>
                )}
              </div>
            ))}
          </div>

          {mapLink && (
            <div className="mt-5">
              <Link
                href={mapLink}
                className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:underline"
              >
                ดูแผนที่และเส้นทาง
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {activeMode === "qa" && intent === "event" && events.length > 0 && (
        <div className="rounded-[2rem] bg-white border border-amber-100 shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-amber-600" />
            <h3 className="text-xl font-bold text-slate-800">
              เทศกาลและกิจกรรม
            </h3>
          </div>

          <div className="space-y-4">
            {events.map((event, index) => (
              <div
                key={`${event.event_name}-${index}`}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <h4 className="font-bold text-slate-800">{event.event_name}</h4>
                <p className="text-sm text-slate-500 mt-2">
                  {event.event_description || "ไม่มีรายละเอียด"}
                </p>

                <div className="mt-3 text-sm text-slate-600 space-y-1">
                  <p>
                    <span className="font-semibold">วันที่เริ่ม:</span>{" "}
                    {event.event_start_date || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">วันที่สิ้นสุด:</span>{" "}
                    {event.event_end_date || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">เวลาเริ่ม:</span>{" "}
                    {event.event_start_time || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">เวลาสิ้นสุด:</span>{" "}
                    {event.event_end_time || "-"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {mapLink && (
            <div className="mt-5">
              <Link
                href={mapLink}
                className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:underline"
              >
                ดูแผนที่และเส้นทาง
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                activeMode === "filter"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >
              {activeMode === "filter" ? (
                <FilterIcon className="w-4 h-4" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900 leading-none">
                {activeMode === "filter"
                  ? "ผลการกรองข้อมูล"
                  : "สถานที่ที่เกี่ยวข้อง"}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium tracking-tight">
                พบทั้งหมด {castlesToShow.length} สถานที่
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 bg-slate-100 animate-pulse rounded-[2rem]"
              />
            ))}
          </div>
        ) : castlesToShow.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {castlesToShow.map((c, idx) => (
              <ResultCard key={`${c.castle_id}-${idx}`} c={c} idx={idx} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="text-slate-300 w-8 h-8" />
            </div>
            <p className="text-slate-400 font-medium italic">
              ไม่พบข้อมูลที่ตรงกับการค้นหาของคุณ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}