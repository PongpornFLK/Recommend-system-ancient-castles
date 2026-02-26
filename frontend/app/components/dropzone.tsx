"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
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

function truncate(s: string, n = 260) {
  const t = (s || "").replace(/\r/g, "").trim();
  if (t.length <= n) return t;
  return t.slice(0, n).trimEnd() + "…";
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
          <Heart className={`w-5 h-5 ${fav ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
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
          {c.castle_description ? truncate(c.castle_description, 260) : "ไม่มีข้อมูล"}
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

export default function Dropzone() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [castles, setCastles] = useState<Castle[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function resetResults() {
    setCastles([]);
    setErrorText(null);
  }

  function setNewFile(f: File | null) {
    setFile(f);
    resetResults();
  }

  async function onUploadSearch() {
    if (!file) return;

    setLoading(true);
    setErrorText(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`${API_BASE}/zilliz/images?k=5`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCastles((data.castles || []) as Castle[]);
    } catch (e) {
      console.error(e);
      setErrorText("ค้นหาด้วยรูปไม่สำเร็จ ดู console/log backend");
      alert("ค้นหาด้วยรูปไม่สำเร็จ ดู console/log backend");
    } finally {
      setLoading(false);
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const f = e.dataTransfer.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    setNewFile(f);
  }

  return (
    <div className="space-y-4">
      <div
        className={[
          "border rounded-2xl p-4 bg-white shadow-sm transition",
          isDragging ? "border-black ring-2 ring-black/10" : "border-gray-200",
        ].join(" ")}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold">อัปโหลดรูปเพื่อค้นหา</div>
            <div className="text-sm text-gray-500">ลากมาวาง หรือเลือกไฟล์รูป</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="bg-tone-orange text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-60"
              onClick={onUploadSearch}
              disabled={loading || !file}
            >
              {loading ? "กำลังค้นหา..." : "ค้นหาด้วยรูป"}
            </button>

            <button
              type="button"
              className="border px-4 py-2 rounded-lg"
              onClick={() => {
                setFile(null);
                resetResults();
              }}
              disabled={!file && castles.length === 0}
            >
              ล้าง
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 items-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              if (f && !f.type.startsWith("image/")) {
                alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
                return;
              }
              setNewFile(f);
              e.currentTarget.value = "";
            }}
          />
        </div>
      </div>

      {previewUrl && (
        <div className="border rounded-2xl bg-white p-3 shadow-sm">
          <div className="text-sm font-semibold mb-2">รูปที่เลือก</div>
          <img
            src={previewUrl}
            alt="uploaded preview"
            className="w-full max-w-xl rounded-xl object-contain bg-gray-50"
          />
          <div className="mt-2 text-xs text-gray-500 break-all">
            {file?.name} • {(((file?.size ?? 0) / 1024)).toFixed(1)} KB
          </div>
        </div>
      )}

      {errorText && <div className="text-sm text-red-600">{errorText}</div>}

      {castles.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-semibold">Search results (found {castles.length})</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {castles.map((c, idx) => (
              <ResultCard key={`${c.castle_id}-${idx}`} c={c} idx={idx} />
            ))}
          </div>
        </div>
      )}

      {!loading && file && castles.length === 0 && (
        <div className="text-sm text-gray-500">ยังไม่มีผลลัพธ์</div>
      )}
    </div>
  );
}