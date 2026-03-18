"use client";
import { useEffect, useState } from "react";
import { Card, CardFooter, Button, Image, Skeleton } from "@heroui/react";
import { HeartOff, Eye, Heart } from "lucide-react";
import Link from "next/link";
import { getCastleGalleryByName } from "../../lib/castleImages";

interface FavoriteItem {
  interest_id: number;
  castle_id: number;
  castle_name: string;
  user_id: number;
}

export default function FavoritePage() {
  const [favList, setFavList] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const loadFav = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/interests/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch favorites");
      const data = await res.json();
      setFavList(data);
    } catch (err) {
      console.error("Error loading favorites:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFav = async (interestId: number) => {
    try {
      const res = await fetch(`${API_BASE}/interests/${interestId}`, { 
        method: "DELETE" 
      });
      if (res.ok) loadFav();
    } catch (err) {
      console.error("Delete favorite error:", err);
    }
  };

  useEffect(() => { 
    if (userId) loadFav(); 
    else setIsLoading(false);
  }, [userId]);

  return (
    <div className="min-h-screen">      
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-rose-100 rounded-2xl">
            <Heart className="w-8 h-8 text-rose-500 fill-current" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#3E2723]">รายการโปรด</h1>
            <p className="text-stone-500 font-medium mt-1 text-lg">สถานที่ที่คุณประทับใจ</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-[350px] rounded-[2.5rem] border-none">
                <Skeleton className="rounded-[2.5rem] h-full w-full" />
              </Card>
            ))}
          </div>
        ) : favList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {favList.map((item) => {

              const gallery = getCastleGalleryByName(item.castle_name);
              const displayImage = gallery.cover || "/assets/card/placeholder.jpg";

              return (
                <Card 
                  key={item.interest_id} 
                  isFooterBlurred 
                  className="h-[350px] border-none rounded-[2.5rem] shadow-xl group"
                >
                  <Image
                    removeWrapper
                    alt={item.castle_name}
                    className="z-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={displayImage}
                  />
                  
                  <CardFooter className="absolute bg-white/70 bottom-4 left-4 right-4 h-20 rounded-[2rem] border-1 border-white/50 z-10 justify-between backdrop-blur-md py-4 px-6">
                    <div className="flex flex-col flex-1 min-w-0 pr-2">
                      <p className="text-[#3E2723] font-black text-lg truncate">
                        {item.castle_name}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/castles/${item.castle_id}`}>
                        <Button isIconOnly radius="full" className="bg-[#5D4037] text-white shadow-lg">
                          <Eye size={20} />
                        </Button>
                      </Link>
                      
                      <Button 
                        isIconOnly 
                        radius="full" 
                        color="danger" 
                        variant="flat" 
                        className="bg-rose-100 text-rose-600"
                        onClick={() => removeFav(item.interest_id)}
                      >
                        <HeartOff size={20} />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-stone-100">
             <HeartOff className="w-12 h-12 text-stone-300 mb-6" />
             <h2 className="text-2xl font-bold text-stone-800 mb-2">ยังไม่มีรายการโปรด</h2>
             <Link href="/landing" className="mt-6">
               <Button className="bg-[#5D4037] text-white font-black px-10 h-14 rounded-2xl">
                 ค้นหาสถานที่
               </Button>
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}