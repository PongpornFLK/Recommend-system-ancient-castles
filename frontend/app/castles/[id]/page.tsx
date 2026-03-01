"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Heart, CalendarPlus, Route } from "lucide-react";
import { getCastleGalleryByName } from "../../lib/castleImages";

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function cleanText(s: string) {
  return (s || "")
    .replace(/\r/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function CastleDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const id = useMemo(() => {
    const raw = params?.id;
    if (Array.isArray(raw)) return raw[0] || "";
    return raw || "";
  }, [params]);

  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<CastleDetail | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        if (!id || id === "undefined" || id === "null") {
          throw new Error(`Invalid id: ${id}`);
        }

        const url = `${API_BASE}/castles/${encodeURIComponent(id)}`;
        const res = await fetch(url, { cache: "no-store" });

        if (!res.ok) throw new Error(await res.text());

        const d = (await res.json()) as CastleDetail;
        if (alive) setData(d);
      } catch (e: any) {
        console.error(e);
        if (alive) setErr("โหลดข้อมูลไม่สำเร็จ (เช็คว่า GET /castles/{id} ตอบ 200 ได้)");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  const gallery = useMemo(() => {
    const name = data?.castle_name || "";
    return getCastleGalleryByName(name);
  }, [data?.castle_name]);

  const hero = gallery.cover || "/assets/card/placeholder.jpg";
  const side = gallery.others?.length ? gallery.others : [hero, hero, hero];

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      {loading && (
        <div className="bg-white border rounded-2xl p-6 shadow-sm text-sm text-gray-600">
          กำลังโหลดข้อมูล...
        </div>
      )}

      {!loading && err && (
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="text-red-600 font-semibold">{err}</div>
          <div className="mt-2 text-sm text-gray-600">
            ลองทดสอบด้วย: <code>curl -i http://localhost:8000/castles/{id || "{id}"}</code>
          </div>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Header + Gallery */}
          <div className="bg-white border rounded-2xl shadow-sm p-5">
            <div className="text-2xl font-extrabold">{data.castle_name}</div>
            <div className="text-sm text-gray-500 mt-1">
              {data.era ? cleanText(data.era) : "—"}
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* big */}
              <div className="lg:col-span-2">
                <img
                  src={hero}
                  alt={data.castle_name}
                  className="w-full h-[320px] lg:h-[360px] object-cover rounded-xl border bg-gray-100"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/assets/card/placeholder.jpg";
                  }}
                />
              </div>

              {/* right column */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {side.slice(0, 3).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`img-${i}`}
                    className="w-full h-[165px] lg:h-[112px] object-cover rounded-xl border bg-gray-100"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/assets/card/placeholder.jpg";
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFav((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-red-500 hover:opacity-90"
              >
                <Heart className={`w-4 h-4 ${fav ? "fill-white" : ""}`} />
                Favourite
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-blue-500 hover:opacity-90"
              >
                <CalendarPlus className="w-4 h-4" />
                Create Plan
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-yellow-500 hover:opacity-90"
              >
                <Route className="w-4 h-4" />
                View Route
              </button>
            </div>
          </div>

          {/* Details castle section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* left big */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border rounded-2xl shadow-sm p-5">
                <div className="text-lg font-bold mb-2">ประวัติความเป็นมา</div>
                <div className="text-sm text-gray-700 leading-7 whitespace-pre-wrap">
                  {data.castle_description
                    ? cleanText(data.castle_description)
                    : "ไม่มีข้อมูล"}
                </div>
              </div>

              <div className="bg-white border rounded-2xl shadow-sm p-5">
                <div className="text-lg font-bold mb-2">
                  งานสำคัญทางประวัติศาสตร์และศาสนา
                </div>
                <div className="text-sm text-gray-700 leading-7 whitespace-pre-wrap">
                  {data.type_detail ? cleanText(data.type_detail) : "—"}
                </div>
              </div>
            </div>

            {/* right */}
            <div className="space-y-4">
              <div className="bg-white border rounded-2xl shadow-sm p-5">
                <div className="text-lg font-bold mb-2">ลักษณะทางสถาปัตยกรรม</div>
                <div className="text-sm text-gray-700 leading-7 whitespace-pre-wrap">
                  {data.architecture ? cleanText(data.architecture) : "—"}
                </div>
              </div>

              <div className="bg-white border rounded-2xl shadow-sm p-5">
                <div className="text-lg font-bold mb-2">สถานที่ตั้งโดยย่อ</div>
                <div className="text-sm text-gray-700 leading-7">
                  <div className="text-gray-500">
                    {data.subdistrict || "—"} • {data.district || "—"} •{" "}
                    {data.province || "—"}
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-2xl shadow-sm p-5">
                <div className="text-lg font-bold mb-2">สถานที่ใกล้เคียง</div>
                {data.nearby_places && data.nearby_places.length > 0 ? (
                  <ul className="text-sm text-gray-700 leading-7 list-disc pl-5 space-y-1">
                    {data.nearby_places.map((p, i) => (
                      <li key={i}>
                        <span className="font-semibold">
                          {cleanText(p.place_name)}
                        </span>
                        {p.nearby_detail ? (
                          <span className="text-gray-500">
                            {" "}
                            — {cleanText(p.nearby_detail)}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500">—</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}