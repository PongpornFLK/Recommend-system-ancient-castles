"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  ArrowRight, Heart, Search, Sparkles, 
  Filter as FilterIcon, MessageSquare, MapPin, 
  RefreshCcw, Info
} from "lucide-react";

import Filter, { type FilterValues } from "./filter";
import { getCastleGalleryByName } from "../lib/castleImages";

type Castle = {
  castle_id: number;
  castle_name: string;
  castle_description?: string;
  era?: string;
  type_id?: number;
  best_score?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Helpers ---
function cleanText(s: string) {
  return (s || "").replace(/\r/g, "").replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function truncate(s: string, n = 160) {
  const t = cleanText(s);
  return t.length <= n ? t : t.slice(0, n).trimEnd() + "…";
}

function dedupeCastles(list: Castle[]) {
  const seen = new Set<string>();
  return (list || []).filter(c => {
    const key = `${c.castle_id}|${c.castle_name}`;
    return seen.has(key) ? false : seen.add(key);
  });
}

function ResultCard({ c, idx }: { c: Castle; idx: number }) {
  const [fav, setFav] = useState(false);
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
        <button
          onClick={() => setFav(!fav)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          <Heart className={`w-4 h-4 ${fav ? "fill-rose-500 text-rose-500" : "text-slate-400"}`} />
        </button>
        <div className="absolute left-3 bottom-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white tracking-widest uppercase">
          Rank #{idx + 1}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-slate-900 leading-tight line-clamp-1">{c.castle_name}</h3>
        <p className="text-xs text-indigo-600 font-medium mt-1">{c.era || "ไม่ระบุสมัย"}</p>
        <p className="mt-3 text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {c.castle_description ? truncate(c.castle_description) : "ไม่มีคำอธิบายข้อมูล"}
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

  const onSearchQA = async () => {
    const query = q.trim();
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/zilliz/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, k: 5 }),
      });
      const data = await res.json();
      setAnswer(cleanText(data.answer || ""));
      setQaCastles(dedupeCastles(data.castles || []));
      setActiveMode("qa");
    } catch (e) {
      alert("ค้นหาไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const onApplyFilter = async (v: FilterValues) => {
    setFilterValue(v);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/filters/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = await res.json();
      setFilterCastles(dedupeCastles(data.castles || []));
      setActiveMode("filter");
      setAnswer("");
    } catch (e) {
      alert("กรองข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const castlesToShow = useMemo(() => {
    return activeMode === "filter" ? filterCastles : qaCastles;
  }, [activeMode, filterCastles, qaCastles]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Search Section */}
      <section className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Sparkles className="h-5 w-5 text-indigo-500 transition-colors group-focus-within:text-indigo-600" />
            </div>
            <input
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700 placeholder:text-slate-400"
              placeholder="ค้นหาหรือถามคำถาม"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearchQA()}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onSearchQA}
              disabled={loading || !q}
              className="flex-1 md:flex-none px-8 py-4 bg-[#5D4037] hover:bg-[#3E2723] text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-brown-900/20"
            >
              {loading && activeMode === 'qa' ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              ค้นหา
            </button>
            <Filter value={filterValue} onApply={onApplyFilter} onClear={() => { setFilterValue({}); setFilterCastles([]); setActiveMode("qa"); }} />
          </div>
        </div>
      </section>

      {/* AI Answer Display - ปรับปรุงตัวอักษรให้ใหญ่ขึ้น (ประมาณ 18px+) */}
        {activeMode === "qa" && answer && (
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#FDFDF0] text-slate-800 shadow-xl shadow-stone-200/40 border border-[#EADDCA]">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <MessageSquare className="w-32 h-32 text-[#8B4513]" />
            </div>
            
            <div className="relative p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6 text-[#8B4513]">
                <Sparkles className="h-6 w-6" />
                <span className="text-sm font-black uppercase tracking-[0.2em] opacity-80 text-stone-500">Your answer</span>
              </div>
              
              {/* ปรับแต่งส่วน ReactMarkdown ให้ใหญ่ขึ้นชัดเจน */}
              {/* prose-xl ปรับฟอนต์พื้นฐานเป็น 1.25rem (~20px) พร้อมระยะห่างที่สวยงาม */}
              <div className="prose prose-stone prose-xl max-w-none 
                            text-[#4E342E] leading-relaxed font-medium
                            prose-headings:text-[#3E2723] prose-headings:font-black
                            prose-p:text-lg prose-p:leading-loose
                            prose-li:text-lg prose-li:leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

      {/* Results Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${activeMode === 'filter' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {activeMode === 'filter' ? <FilterIcon className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-none">
                {activeMode === "filter" ? "ผลการกรองข้อมูล" : "สถานที่ที่เกี่ยวข้อง"}
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
              <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-[2rem]" />
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
            <p className="text-slate-400 font-medium italic">ไม่พบข้อมูลที่ตรงกับการค้นหาของคุณ</p>
          </div>
        )}
      </div>
    </div>
  );
}