"use client";

import TableHistory from "@/app/components/history/table";
import { ChessRook } from "lucide-react";

export default function History() {
  return (
    <section>
      <div className="flex flex-row gap-3 my-5">
        <ChessRook size={38} color="var(--color-tone-oldgray)" />
        <div className="flex flex-col">
          <h1 className="font-bold text-3xl text-tone-oldgray">History</h1>
          <h1 className="text-md text-gray mt-3">
            ประวัติการเดินทางทั้งหมดของคุณ
          </h1>
        </div>
      </div>
      <TableHistory />
    </section>
  );
}
