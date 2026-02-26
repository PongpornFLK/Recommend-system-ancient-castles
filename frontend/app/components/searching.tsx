"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowRight, Heart } from "lucide-react";

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

function cleanText(s: string) {
  return (s || "")
    .replace(/\r/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncate(s: string, n = 260) {
  const t = cleanText(s);
  if (t.length <= n) return t;
  return t.slice(0, n).trimEnd() + "…";
}

// กันรายการซ้ำ/กัน id ซ้ำทำให้การ์ดทับกัน
function dedupeCastles(list: Castle[]) {
  const seen = new Set<string>();
  const out: Castle[] = [];
  for (const c of list || []) {
    const key = `${c.castle_id ?? "null"}|${(c.castle_name || "").trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

function ResultCard({ c, idx }: { c: Castle; idx: number }) {
  const [fav, setFav] = useState(false);
  const g = getCastleGalleryByName(c.castle_name);
  const cover = g.cover || "/assets/card/placeholder.jpg";

  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="relative">
        <img
          src={cover}
          alt={c.castle_name}
          className="w-full h-56 object-cover bg-gray-100"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/assets/card/placeholder.jpg";
          }}
        />

        <button
          type="button"
          onClick={() => setFav((v) => !v)}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur border flex items-center justify-center hover:bg-white"
          aria-label="favourite"
          title="Favourite"
        >
          <Heart
            className={`w-5 h-5 ${
              fav ? "fill-red-500 text-red-500" : "text-gray-700"
            }`}
          />
        </button>

        <div className="absolute left-3 top-3 text-xs px-2 py-1 rounded-full bg-black/70 text-white">
          #{idx + 1}
        </div>
      </div>

      <div className="p-4">
        <div className="text-lg font-semibold leading-6">
          {c.castle_name}
          {c.era ? (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({String(c.era).trim()})
            </span>
          ) : null}
        </div>

        <div className="mt-2 text-sm text-gray-600 leading-6 whitespace-pre-wrap">
          {c.castle_description
            ? truncate(c.castle_description, 260)
            : "ไม่มีคำอธิบายในฐานข้อมูล"}
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Link
            href={`/castles/${c.castle_id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-tone-orange text-white font-semibold hover:opacity-90"
          >
            View detail <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Searching() {
  const [q, setQ] = useState("");

  // QA results
  const [answer, setAnswer] = useState<string>("");
  const [qaCastles, setQaCastles] = useState<Castle[]>([]);

  // Filter results
  const [filterValue, setFilterValue] = useState<FilterValues>({});
  const [filterCastles, setFilterCastles] = useState<Castle[]>([]);
  const [activeMode, setActiveMode] = useState<"qa" | "filter">("qa");

  const [loading, setLoading] = useState(false);

  async function onSearchQA() {
    const query = q.trim();
    if (!query) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/zilliz/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, k: 5, castle_id: null }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setAnswer(cleanText(data.answer || ""));
      setQaCastles(dedupeCastles((data.castles || []) as Castle[]));
      setActiveMode("qa");
    } catch (e) {
      console.error(e);
      alert("ค้นหาไม่สำเร็จ ดู console/log backend");
    } finally {
      setLoading(false);
    }
  }

  async function onApplyFilter(v: FilterValues) {
    setFilterValue(v);
    setLoading(true);

    try {
      const payload = {
        province: v.province ?? null,
        district: v.district ?? null,
        subdistrict: v.subdistrict ?? null,
        era: v.era ?? null,
        architecture: v.architecture ?? null,
        type_id: v.type_id ? Number(v.type_id) : null,
      };

      const res = await fetch(`${API_BASE}/filters/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setFilterCastles(dedupeCastles((data.castles || []) as Castle[]));
      setActiveMode("filter");
      setAnswer("");
    } catch (e) {
      console.error(e);
      alert("กรองข้อมูลไม่สำเร็จ ดู console/log backend");
    } finally {
      setLoading(false);
    }
  }

  function onClearFilter() {
    setFilterValue({});
    setFilterCastles([]);
    setActiveMode("qa");
  }

  const castlesToShow = useMemo(() => {
    const list = activeMode === "filter" ? filterCastles : qaCastles;
    return dedupeCastles(list);
  }, [activeMode, filterCastles, qaCastles]);

  return (
    <div className="space-y-6">
      {/* Search bar + Filter */}
      <div className="bg-white border rounded-2xl shadow-sm p-4">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex-1 min-w-[260px]">
            <div className="text-sm font-semibold mb-2">Search similar castle</div>
            <input
              className="border rounded-lg px-4 py-2 w-full"
              placeholder="Type details of the location..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearchQA();
              }}
            />
          </div>

          <button
            className="bg-tone-orange text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-60"
            onClick={onSearchQA}
            disabled={loading}
          >
            {loading ? "กำลังค้นหา..." : "ค้นหา"}
          </button>

          <Filter value={filterValue} onApply={onApplyFilter} onClear={onClearFilter} />
        </div>
      </div>

      {/* คำตอบ */}
      {activeMode === "qa" && answer && (
        <div className="border rounded-2xl p-5 bg-white shadow-sm">
          <div className="text-base font-semibold">คำตอบ</div>
          <div className="mt-3 text-sm leading-7">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">
            Search results{" "}
            <span className="text-gray-500 font-normal">
              {castlesToShow.length > 0 ? `(Search found ${castlesToShow.length} location)` : ""}
              {activeMode === "filter" ? " • from Filter" : ""}
            </span>
          </div>
        </div>

        {castlesToShow.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {castlesToShow.map((c, idx) => (
              <ResultCard key={`${c.castle_id}-${idx}`} c={c} idx={idx} />
            ))}
          </div>
        ) : (
          !loading &&
          activeMode === "filter" && (
            <div className="border rounded-2xl p-4 text-sm bg-white">ไม่พบสถานที่</div>
          )
        )}
      </div>
    </div>
  );
}