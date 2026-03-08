"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
  ArrowRight, Upload, X, 
  ImageIcon, Search, Loader2, Sparkles 
} from "lucide-react";
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
function truncate(s: string, n = 160) {
  const t = (s || "").replace(/\r/g, "").trim();
  return t.length <= n ? t : t.slice(0, n).trimEnd() + "...";
}

function ResultCard({ c, idx }: { c: Castle; idx: number }) {
  const g = getCastleGalleryByName(c.castle_name);
  const cover = g.cover || "/assets/card/placeholder.jpg";

  return (
    <div className="group relative bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-52 overflow-hidden">
        <img
          src={cover}
          alt={c.castle_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Badge Rank */}
        <div className="absolute left-3 top-3 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur shadow-sm text-slate-900">
          <Sparkles className="w-3 h-3 text-amber-500" />
          MATCH #{idx + 1}
        </div>

        {/* ปุ่มหัวใจถูกนำออกแล้ว */}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
          {c.castle_name}
        </h3>
        <p className="text-xs font-medium text-indigo-600 mb-2">
          {c.era ? c.era.trim() : "ไม่ระบุสมัย"}
        </p>
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 h-[60px]">
          {c.castle_description ? truncate(c.castle_description) : "ไม่มีข้อมูลคำบรรยาย"}
        </p>

        <div className="mt-5 pt-4 border-t border-slate-50">
          <Link
            href={`/castles/${c.castle_id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-indigo-600 transition-colors"
          >
            ดูรายละเอียด <ArrowRight className="w-4 h-4" />
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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (f: File | null) => {
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      setCastles([]);
    } else if (f) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
    }
  };

  const onUploadSearch = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/zilliz/images?k=6`, { method: "POST", body: fd });
      const data = await res.json();
      setCastles(data.castles || []);
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Upload Section */}
      <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900">ค้นหาด้วยรูปภาพ</h2>
            <p className="text-slate-500">อัปโหลดรูปภาพโบราณสถานเพื่อค้นหาข้อมูลด้วย AI</p>
          </div>

          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files?.[0]); }}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative cursor-pointer py-12 px-6 border-2 border-dashed rounded-3xl transition-all
                ${isDragging ? "border-indigo-500 bg-indigo-50/50 scale-[0.99]" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"}
              `}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)} 
                className="hidden" 
                accept="image/*"
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-700">ลากไฟล์มาวางที่นี่</p>
                  <p className="text-sm text-slate-400">หรือคลิกเพื่อเลือกไฟล์จากเครื่อง</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative group max-w-sm mx-auto">
              <div className="overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
                <img src={previewUrl!} alt="preview" className="w-full h-64 object-cover" />
              </div>
              <button 
                onClick={() => { setFile(null); setCastles([]); }}
                className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onUploadSearch}
              disabled={!file || loading}
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {loading ? "กำลังวิเคราะห์..." : "เริ่มการค้นหา"}
            </button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {castles.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-black text-slate-900">พบโบราณสถานที่ใกล้เคียง</h3>
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{castles.length} Results</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {castles.map((c, idx) => (
              <ResultCard key={`${c.castle_id}-${idx}`} c={c} idx={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && file && castles.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[2rem]">
          <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">กดปุ่ม "เริ่มการค้นหา" เพื่อดูผลลัพธ์</p>
        </div>
      )}
    </div>
  );
}