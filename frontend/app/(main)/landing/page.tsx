"use client";

import { Compass, ScanSearch, Image, FileText } from "lucide-react";
import CardLanding from "@/app/components/landing/cardlanding";
import SlideImg from "@/app/components/landing/slideimg";
import Search from "@/app/components/landing/searching";
import Dropzone from "@/app/components/landing/dropzone";
import { Tabs, Tab, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import api from "@/app/service/api";
import useGoogle from "@/app/service/auth/login/useGoogle";

interface Castle {
  castle_id: number;
  castle_name: string;
  era: string;
  type_detail: string;
  architecture: string;
  is_recommended?: boolean;
}

export default function Landing() {
  const { isLoading: googleLoading } = useGoogle();
  const [recommendedCastles, setRecommendedCastles] = useState<Castle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);

      try {
        const response = await api.get("/recommend");

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

    window.addEventListener("auth-change", fetchRecommendations);
    return () => window.removeEventListener("auth-change", fetchRecommendations);
  }, []);

  return (
    <div>
      {loading ? (
        <div>
          <div className="flex flex-col items-center gap-2">
            <Spinner color="warning" />
            <span className="text-xs text-muted">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Full Bleed Slider Section */}
          <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-4">
            <SlideImg />
          </section>

          <section className="my-5 px-4 md:px-10 overflow-hidden">
            <div className="my-8 md:my-20 max-w-7xl mx-auto">
              <div className="mb-6 md:mb-10">
                <div className="flex flex-row gap-2 md:gap-3 items-center">
                  <ScanSearch size={28} className="text-tone-oldgray md:w-[38px] md:h-[38px]" />
                  <h1 className="font-bold text-xl md:text-3xl text-tone-oldgray uppercase tracking-tight leading-tight">
                    Castle Similarity Search
                  </h1>
                </div>
                <p className="text-stone-500 mt-2 text-xs md:text-base">
                  ค้นหาความคล้ายคลึงกันของปราสาทด้วยข้อความหรือรูปภาพ
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="p-1 md:p-5 overflow-x-auto scrollbar-hide">
                  <Tabs
                    aria-label="Search Options"
                    variant="underlined"
                    color="warning"
                    className="w-full"
                    classNames={{
                      tabList: "gap-4 md:gap-8 px-2 md:px-0",
                      tab: "px-0 pb-1 h-10 md:h-12",
                    }}
                  >
                    <Tab
                      key="text"
                      title={
                        <div className="flex items-center space-x-2">
                          <FileText size={18} className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                          <span className="text-xs md:text-md">Search with Text & Filters</span>
                        </div>
                      }
                    >
                      <div className="py-2 px-2 md:px-0">
                        <Search />
                      </div>
                    </Tab>
                    <Tab
                      key="image"
                      title={
                        <div className="flex items-center space-x-2">
                          <Image size={18} className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                          <span className="text-xs md:text-md">Search by Image</span>
                        </div>
                      }
                    >
                      <div className="py-2 px-2 md:px-0">
                        <Dropzone />
                      </div>
                    </Tab>
                  </Tabs>
                </div>
              </div>
            </div>
          </section>

          {/*Interesting Places */}
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

          {loading && (
            <div className="flex justify-center py-20">
              <Spinner
                color="warning"
                label="Checking for recommendations..."
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
