"use client";
import { useState } from "react";

type Castle = {
  castle_id: number;
  castle_name: string;
  castle_description?: string;
  era?: string;
  type_id?: number;
};

export default function Searching() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<any[]>([]);
  const [castles, setCastles] = useState<Castle[]>([]);
  const [loading, setLoading] = useState(false);

  async function onSearch() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/zilliz/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, k: 5, castle_id: null }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setHits(data.hits || []);
      setCastles(data.castles || []);
    } catch (e) {
      console.error(e);
      alert("ค้นหาไม่สำเร็จ ดู console/log backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="พิมพ์คำถาม เช่น 'ปราสาทหินพิมายสร้างสมัยใด'"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="bg-black text-white px-4 rounded" onClick={onSearch}>
          ค้นหา
        </button>
      </div>

      {loading && <div>กำลังค้นหา...</div>}

      {/* ✅ สรุปผล Castle จาก DB */}
      <div className="space-y-2">
        {castles.map((c) => (
          <div key={c.castle_id} className="border rounded p-3">
            <div className="font-semibold">
              #{c.castle_id} {c.castle_name} {c.era ? `(${c.era})` : ""}
            </div>
            {c.castle_description && (
              <div className="text-sm whitespace-pre-wrap">{c.castle_description}</div>
            )}
          </div>
        ))}
      </div>

      {/* hits จาก vector */}
      <div className="space-y-2">
        {hits.map((h, i) => (
          <div key={i} className="border rounded p-3">
            <div className="font-semibold">
              {h.document_name} (score {Number(h.score).toFixed(4)}) | castle_id: {h.castle_id}
            </div>
            <div className="text-sm whitespace-pre-wrap">{h.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
