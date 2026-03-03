"use client";

import { Card, CardBody, CardHeader, Image } from "@heroui/react";

export default function CradErr() {
  return (
    <>
      <Card className="max-w-md mx-auto mt-3 mb-5 p-4" shadow="sm">
        <CardHeader className="flex-col items-center">
          <div className="text-xl font-bold">
            จำเป็นต้องอนุญาตการเข้าถึงตำแหน่ง
          </div>
          <Image
            className="my-5"
            alt="Card background"
            src="/assets/map/map.png"
            width={100}
          />
          <div className="text-lg mt-2 font-semibold">
            ทำตามขั้นตอนด้านล่างเพื่อเปิดใช้งานนะ
          </div>
        </CardHeader>
        <CardBody className="overflow-visible">
          <div>
            <p>1. คลิกที่ไอคอนการตั้งค่า</p>
            <p>2. ซ้ายบนสุดของแถบ URL มองหาเมนู ตำแหน่ง (Location)</p>
            <p>3. เปลี่ยนสิทธิ์การเข้าถึงเป็น อนุญาต (Allow)</p>
            <p>4. กดยืนยันหรือรีเฟรชหน้าเว็บอีกครั้ง</p>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
