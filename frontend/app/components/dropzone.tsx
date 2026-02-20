"use client";
import { useState } from "react";

type Castle = {
  castle_id: number;
  castle_name: string;
  castle_description?: string;
  era?: string;
  type_id?: number;
};

export default function Dropzone() {
  const [file, setFile] = useState<File | null>(null);
  const [hits, setHits] = useState<any[]>([]);
  const [castles, setCastles] = useState<Castle[]>([]);
  const [loading, setLoading] = useState(false);

  async function onUploadSearch() {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("http://localhost:8000/zilliz/images?k=5", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setHits(data.hits || []);
      setCastles(data.castles || []);
    } catch (e) {
      console.error(e);
      alert("ค้นหาด้วยรูปไม่สำเร็จ ดู console/log backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />

      <button className="bg-black text-white px-4 py-2 rounded" onClick={onUploadSearch}>
        ค้นหาด้วยรูป
      </button>

      {loading && <div>กำลังค้นหา...</div>}

      {/* ✅ Castle จาก DB */}
      <div className="space-y-2">
        {castles.map((c) => (
          <div key={c.castle_id} className="border rounded p-3">
            <div className="font-semibold">
              #{c.castle_id} {c.castle_name} {c.era ? `(${c.era})` : ""}
            </div>
            {c.castle_description && <div className="text-sm">{c.castle_description}</div>}
          </div>
        ))}
      </div>

      {/* hits จาก vector */}
      <div className="space-y-2">
        {hits.map((h, i) => (
          <div key={i} className="border rounded p-3">
            <div>score: {Number(h.score).toFixed(4)}</div>
            <div>castle_id: {h.castle_id}</div>
            <div className="break-all">url: {h.image_url}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
