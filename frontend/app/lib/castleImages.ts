export type CastleGallery = {
  cover?: string;
  others?: string[];
};

// ทำ normalize ให้ทนกับช่องว่าง/วงเล็บ/เครื่องหมาย/คำต่อท้าย
function norm(raw: string) {
  return (raw || "")
    .toLowerCase()
    .trim()
    // ลบวงเล็บ/เครื่องหมายที่มักติดมากับชื่อ
    .replace(/[\s()（）\[\]{}.,，\-–—_•·|/\\'"“”‘’:+!?]/g, "")
    // ลบคำว่า จังหวัด/อำเภอ/ตำบล ที่อาจถูกต่อท้าย (เผื่อเคส)
    .replace(/จังหวัด|อำเภอ|ตำบล/g, "");
}

const MAP: Record<string, CastleGallery> = {
  // Phimai
  [norm("ปราสาทหินพิมาย")]: {
    cover: "/assets/phimai/phimai.jpg",
    others: [
      "/assets/phimai/phimai2.jpg",
      "/assets/phimai/phimai3.jpg",
      "/assets/phimai/phimai4.png",
    ],
  },

  // Phanom Rung (ใส่ alias เผื่อ backend ส่งชื่อไม่เหมือนกัน)
  [norm("ปราสาทหินพนมรุ้ง")]: {
    cover: "/assets/phanomRung/pnr.jpg",
    others: [
      "/assets/phanomRung/pnr2.jpg",
      "/assets/phanomRung/pnr3.jpg",
      "/assets/phanomRung/pnr4.jpg",
    ],
  },
  [norm("ปราสาทพนมรุ้ง")]: {
    cover: "/assets/phanomRung/pnr.jpg",
    others: [
      "/assets/phanomRung/pnr2.jpg",
      "/assets/phanomRung/pnr3.jpg",
      "/assets/phanomRung/pnr4.jpg",
    ],
  },

  // Muang Tam
  [norm("ปราสาทเมืองต่ำ")]: {
    cover: "/assets/muangTam/mtam.jpg",
    others: [
      "/assets/muangTam/mtam2.png",
      "/assets/muangTam/mtam3.jpg",
      "/assets/muangTam/mtam4.jpg",
    ],
  },
};

// fallback แบบ “ใกล้เคียง” ถ้าชื่อมีคำต่อท้าย
function findByFuzzyName(name: string): CastleGallery | null {
  const n = norm(name);
  if (!n) return null;

  if (MAP[n]) return MAP[n];

  // ถ้า name มีคำต่อท้าย เช่น "ปราสาทหินพนมรุ้ง จังหวัดบุรีรัมย์"
  for (const k of Object.keys(MAP)) {
    if (n.includes(k) || k.includes(n)) return MAP[k];
  }
  return null;
}

export function getCastleGalleryByName(name: string): CastleGallery {
  const g = findByFuzzyName(name);
  if (g) return g;

  return {
    cover: "/assets/card/placeholder.jpg",
    others: [
      "/assets/card/placeholder.jpg",
      "/assets/card/placeholder.jpg",
      "/assets/card/placeholder.jpg",
    ],
  };
}