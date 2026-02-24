"use client";
import { useEffect, useState } from "react";

type Castle = {
  castle_id: number;
  castle_name: string;
  castle_description?: string;
  era?: string;
  type_id?: number;
  best_score?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function truncate(s: string, n = 320) {
  const t = (s || "").trim();
  if (t.length <= n) return t;
  return t.slice(0, n).trimEnd() + "…";
}

export default function Dropzone() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [castles, setCastles] = useState<Castle[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // drag state (คอมใช้ได้ดี มือถือบางเบราว์เซอร์อาจจำกัด)
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

      // ✅ ไม่โชว์ hits ตามที่ขอ
      setCastles((data.castles || []) as Castle[]);
    } catch (e) {
      console.error(e);
      setErrorText("ค้นหาด้วยรูปไม่สำเร็จ ดู console/log backend");
      alert("ค้นหาด้วยรูปไม่สำเร็จ ดู console/log backend");
    } finally {
      setLoading(false);
    }
  }

  // ===== Drag & Drop =====
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
      {/* ===== กล่องดรอป/เลือกไฟล์ ===== */}
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
            <div className="font-semibold">อัปโหลด/ดรอปรูปเพื่อค้นหา</div>
            <div className="text-sm text-gray-500">
              มือถือ: กดเลือกไฟล์/รูปจากแกลเลอรี • คอม: ลากรูปมาวางได้
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
              onClick={onUploadSearch}
              disabled={loading || !file}
            >
              {loading ? "กำลังค้นหา..." : "ค้นหาด้วยรูป"}
            </button>

            <button
              type="button"
              className="border px-4 py-2 rounded"
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
              // เลือกไฟล์เดิมซ้ำได้
              e.currentTarget.value = "";
            }}
          />
        </div>
      </div>

      {/* ===== Preview รูปที่เลือก ===== */}
      {previewUrl && (
        <div className="border rounded-xl bg-white p-3 shadow-sm">
          <div className="text-sm font-semibold mb-2">รูปที่เลือก</div>
          <img
            src={previewUrl}
            alt="uploaded preview"
            className="w-full max-w-xl rounded-lg object-contain bg-gray-50"
          />
          <div className="mt-2 text-xs text-gray-500 break-all">
            {file?.name} • {(((file?.size ?? 0) / 1024)).toFixed(1)} KB
          </div>
        </div>
      )}

      {/* ===== Error ===== */}
      {errorText && <div className="text-sm text-red-600">{errorText}</div>}

      {/* ===== แสดงผล: เฉพาะสถานที่ที่เกี่ยวข้อง ===== */}
      {castles.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-semibold">สถานที่ที่เกี่ยวข้อง</div>

          {castles.map((c, idx) => (
            <div key={c.castle_id} className="border rounded-xl p-4 bg-white shadow-sm">
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
                <div className="mt-2 text-sm text-gray-500">ไม่มีคำอธิบายในฐานข้อมูล</div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && file && castles.length === 0 && (
        <div className="text-sm text-gray-500">ยังไม่มีผลลัพธ์</div>
      )}
    </div>
  );
}