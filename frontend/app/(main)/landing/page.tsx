"use client";

import { Compass, ScanSearch, Image, FileText } from "lucide-react";
import CardLanding from "@/app/components/landing/cardlanding";
import SlideImg from "@/app/components/landing/slideimg";
import Search from "@/app/components/landing/searching";
import Dropzone from "@/app/components/landing/dropzone";
import { Tabs, Tab, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import axios from "axios";

interface Castle {
  castle_id: number;
  castle_name: string;
  era: string;
  type_detail: string;
  architecture: string;
  is_recommended?: boolean;
}

export default function Landing() {
  const [recommendedCastles, setRecommendedCastles] = useState<Castle[]>([]);
  const [loading, setLoading] = useState(true);

  // ดึง API URL จาก env
  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchRecommendations = async () => {
      const token = localStorage.getItem("token");
      
      // ถ้าไม่มี Token (ยังไม่ Login) ไม่ต้องพยายามดึงข้อมูลแนะนำ
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE}/recommend`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // รับข้อมูลจาก recommend.py
        // ถ้าผู้ใช้ยังไม่กดถูกใจ Backend จะส่ง data: [] กลับมา
        setRecommendedCastles(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [API_BASE]);

  return (
    <div>
      <section className="p-0 m-0">
        <SlideImg />
      </section>

      {/* Section: ค้นหาปราสาท */}
      <section className="my-5 px-4 md:px-10">
        <div className="my-20">
          <div className="mb-10">
            <div className="flex flex-row gap-3 items-center">
              <ScanSearch size={38} className="text-tone-oldgray" />
              <h1 className="font-bold text-3xl text-tone-oldgray uppercase tracking-tight">
                Castle Similarity Search
              </h1>
            </div>
            <p className="text-stone-500 mt-2">
              ค้นหาความคล้ายคลึงกันของปราสาทด้วยข้อความหรือรูปภาพ
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100">
            <div className="p-5">
              <Tabs aria-label="Search Options" variant="underlined" color="warning">
                <Tab
                  key="text"
                  title={
                    <div className="flex items-center space-x-2">
                      <FileText size={18} />
                      <span>Search with Text & Filters</span>
                    </div>
                  }
                >
                  <div className="py-4"><Search /></div>
                </Tab>
                <Tab
                  key="image"
                  title={
                    <div className="flex items-center space-x-2">
                      <Image size={18} />
                      <span>Search by Image</span>
                    </div>
                  }
                >
                  <div className="py-4"><Dropzone /></div>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Section: สถานที่แนะนำ (Interesting Places) */}
      {/* ✅ เงื่อนไข: แสดงเฉพาะเมื่อมีข้อมูลแนะนำ (ถูกใจแล้วเท่านั้น) */}
      {!loading && recommendedCastles.length > 0 && (
        <section className="my-10 px-4 md:px-10 pb-20 animate-appearance-in">
          <div className="mb-10">
            <div className="flex flex-row gap-3 items-center">
              <Compass size={38} className="text-tone-oldgray" />
              <h1 className="font-bold text-3xl text-tone-oldgray uppercase tracking-tight">
                Interesting Places
              </h1>
            </div>
            <p className="text-stone-500 mt-2">
              โบราณสถานที่แนะนำตามความสนใจล่าสุดของคุณ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedCastles.map((castle) => (
              <CardLanding 
                key={castle.castle_id} 
                castle={{ ...castle, is_recommended: true }} 
              />
            ))}
          </div>
        </section>
      )}

      {/* กรณีที่กำลังโหลด แสดง Spinner เล็กน้อยเพื่อความลื่นไหล */}
      {loading && (
        <div className="flex justify-center py-20">
          <Spinner color="warning" label="Checking for recommendations..." />
        </div>
      )}
    </div>
  );
}