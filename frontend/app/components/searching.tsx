"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Filter, { type FilterValues } from "./filter";

type Castle = {
  castle_id: number;
  castle_name: string;
  castle_description?: string;
  era?: string;
  type_id?: number;
  best_score?: number;
};

function cleanText(s: string) {
  return (s || "")
    .replace(/\r/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncate(s: string, n = 320) {
  const t = cleanText(s);
  if (t.length <= n) return t;
  return t.slice(0, n).trimEnd() + "…";
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
      setQaCastles((data.castles || []) as Castle[]);

      // สลับโหมดเป็น QA
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
        type_id: v.type_id ? Number(v.type_id) : null, // ✅ แปลงเป็น int
      };

      const res = await fetch(`${API_BASE}/filters/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setFilterCastles((data.castles || []) as Castle[]);
      setActiveMode("filter");

      // ไม่บังคับ แต่ทำให้ UX ชัด: เมื่อใช้ filter ให้ซ่อน answer ของ QA
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
    // กลับไป QA mode (หรือจะปล่อยไว้ก็ได้)
    setActiveMode("qa");
  }

  const castlesToShow = activeMode === "filter" ? filterCastles : qaCastles;

  return (
    <div className="space-y-5">
      {/* Search bar + Filter */}
      <div className="flex gap-2 items-center">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="พิมพ์คำถาม เช่น 'ปราสาทหินพิมายสร้างขึ้นสมัยใด'"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearchQA();
          }}
        />

        <button
          className="bg-black text-white px-4 rounded disabled:opacity-60"
          onClick={onSearchQA}
          disabled={loading}
        >
          {loading ? "กำลังค้นหา..." : "ค้นหา"}
        </button>

        {/* ✅ Filter */}
        <Filter value={filterValue} onApply={onApplyFilter} onClear={onClearFilter} />
      </div>

      {/* ✅ แสดงคำตอบ QA เฉพาะตอนโหมด QA */}
      {activeMode === "qa" && answer && (
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <div className="text-base font-semibold">คำตอบ</div>
          <div className="mt-3 text-sm leading-7">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {answer}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* ✅ แสดงสถานที่ที่เกี่ยวข้อง (ทั้ง QA/Filter ใช้กล่องเดียวกัน) */}
      {castlesToShow.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-semibold">
            สถานที่ที่เกี่ยวข้อง {activeMode === "filter" ? "(จาก Filter)" : ""}
          </div>

          {castlesToShow.map((c, idx) => (
            <div
              key={c.castle_id}
              className="border rounded-xl p-4 bg-white shadow-sm"
            >
              <div className="text-lg font-semibold">
                {idx + 1}. {c.castle_name}{" "}
                {c.era ? (
                  <span className="text-sm font-normal text-gray-500">
                    ({String(c.era).trim()})
                  </span>
                ) : null}
              </div>

              {c.castle_description ? (
                <div className="mt-2 text-sm text-gray-700 leading-6 whitespace-pre-wrap">
                  {truncate(c.castle_description, 360)}
                </div>
              ) : (
                <div className="mt-2 text-sm text-gray-500">
                  ไม่มีคำอธิบายในฐานข้อมูล
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && activeMode === "filter" && castlesToShow.length === 0 && (
        <div className="border rounded p-4 text-sm">
          ไม่พบสถานที่
        </div>
      )}
    </div>
  );
}