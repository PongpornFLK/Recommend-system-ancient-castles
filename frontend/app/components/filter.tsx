"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Select,
  SelectItem,
} from "@heroui/react";
import { SlidersHorizontal, CheckCheck } from "lucide-react";

export type FilterValues = {
  province?: string | null;
  district?: string | null;
  subdistrict?: string | null;
  era?: string | null;
  architecture?: string | null;
  type_id?: string | null;
};

type Props = {
  value?: FilterValues;
  onApply: (v: FilterValues) => void;
  onClear?: () => void;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type FilterOptions = {
  provinces: string[];
  districts: string[];
  subdistricts: string[];
  eras: string[];
  architectures: string[];
  types: { type_id: number; type_detail: string }[];
};

export default function Filter({ value, onApply, onClear }: Props) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [opts, setOpts] = useState<FilterOptions | null>(null);
  const [optLoading, setOptLoading] = useState(false);

  const [province, setProvince] = useState<string | null>(value?.province ?? null);
  const [district, setDistrict] = useState<string | null>(value?.district ?? null);
  const [subdistrict, setSubdistrict] = useState<string | null>(value?.subdistrict ?? null);

  const [era, setEra] = useState<string | null>(value?.era ?? null);
  const [architecture, setArchitecture] = useState<string | null>(value?.architecture ?? null);
  const [typeId, setTypeId] = useState<string | null>(value?.type_id ?? null);

  // ✅ โหลด options จาก DB
  useEffect(() => {
    let alive = true;
    (async () => {
      setOptLoading(true);
      try {
        const res = await fetch(`${API_BASE}/filters/options`);
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as FilterOptions;
        if (alive) setOpts(data);
      } catch (e) {
        console.error(e);
        if (alive) setOpts(null);
      } finally {
        if (alive) setOptLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ✅ ทำ cascade แบบง่าย: district/subdistrict ให้กรองจากค่าที่เลือก
  // (หมายเหตุ: options ที่ backend ส่งมาเป็น list รวมทั้งหมด ยังไม่ผูกแบบ province->district)
  // ถ้าคุณอยากให้ผูกแบบจริง ๆ ต้องทำ backend ส่งแบบ mapping
  const provinces = useMemo(() => (opts?.provinces ?? []).map((x) => ({ key: x, label: x })), [opts]);
  const districts = useMemo(() => (opts?.districts ?? []).map((x) => ({ key: x, label: x })), [opts]);
  const subdistricts = useMemo(() => (opts?.subdistricts ?? []).map((x) => ({ key: x, label: x })), [opts]);
  const eras = useMemo(() => (opts?.eras ?? []).map((x) => ({ key: x, label: x })), [opts]);
  const architectures = useMemo(() => (opts?.architectures ?? []).map((x) => ({ key: x, label: x })), [opts]);
  const types = useMemo(
    () => (opts?.types ?? []).map((t) => ({ key: String(t.type_id), label: t.type_detail })),
    [opts]
  );

  function clearAll() {
    setProvince(null);
    setDistrict(null);
    setSubdistrict(null);
    setEra(null);
    setArchitecture(null);
    setTypeId(null);
    onClear?.();
  }

  return (
    <>
      <Button
        onPress={onOpen}
        startContent={<SlidersHorizontal />}
        className="bg-tone-green text-white hover:bg-tone-green/80"
      >
        Filter
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-2xl">Filter</ModalHeader>

              <ModalBody>
                {optLoading && (
                  <div className="text-sm text-gray-500">กำลังโหลดตัวเลือกจากฐานข้อมูล...</div>
                )}
                {!optLoading && !opts && (
                  <div className="text-sm text-red-500">
                    โหลดตัวเลือกไม่สำเร็จ (เช็คว่า backend เปิด /filters/options แล้ว)
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Location */}
                  <div className="w-full">
                    <p className="text-2xl font-bold text-tone-orange">Location</p>

                    <Select
                      className="w-full my-6"
                      label="Province"
                      placeholder="Select province"
                      labelPlacement="outside"
                      selectedKeys={province ? [province] : []}
                      onSelectionChange={(keys) => {
                        const v = Array.from(keys)[0] as string | undefined;
                        setProvince(v ?? null);
                        setDistrict(null);
                        setSubdistrict(null);
                      }}
                    >
                      {provinces.map((p) => (
                        <SelectItem key={p.key}>{p.label}</SelectItem>
                      ))}
                    </Select>

                    <Select
                      className="w-full my-6"
                      label="District"
                      placeholder="Select district"
                      labelPlacement="outside"
                      selectedKeys={district ? [district] : []}
                      onSelectionChange={(keys) => {
                        const v = Array.from(keys)[0] as string | undefined;
                        setDistrict(v ?? null);
                        setSubdistrict(null);
                      }}
                    >
                      {districts.map((d) => (
                        <SelectItem key={d.key}>{d.label}</SelectItem>
                      ))}
                    </Select>

                    <Select
                      className="w-full"
                      label="Subdistrict"
                      placeholder="Select subdistrict"
                      labelPlacement="outside"
                      selectedKeys={subdistrict ? [subdistrict] : []}
                      onSelectionChange={(keys) => {
                        const v = Array.from(keys)[0] as string | undefined;
                        setSubdistrict(v ?? null);
                      }}
                    >
                      {subdistricts.map((s) => (
                        <SelectItem key={s.key}>{s.label}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Characteristics */}
                  <div className="w-full">
                    <p className="text-2xl font-bold text-tone-orange mb-2">Characteristics</p>

                    <Select
                      className="w-full my-6"
                      label="Era"
                      placeholder="Select era"
                      labelPlacement="outside"
                      selectedKeys={era ? [era] : []}
                      onSelectionChange={(keys) => {
                        const v = Array.from(keys)[0] as string | undefined;
                        setEra(v ?? null);
                      }}
                    >
                      {eras.map((x) => (
                        <SelectItem key={x.key}>{x.label}</SelectItem>
                      ))}
                    </Select>

                    <Select
                      className="w-full my-6"
                      label="Architecture"
                      placeholder="Select architecture"
                      labelPlacement="outside"
                      selectedKeys={architecture ? [architecture] : []}
                      onSelectionChange={(keys) => {
                        const v = Array.from(keys)[0] as string | undefined;
                        setArchitecture(v ?? null);
                      }}
                    >
                      {architectures.map((x) => (
                        <SelectItem key={x.key}>{x.label}</SelectItem>
                      ))}
                    </Select>

                    <Select
                      className="w-full"
                      label="Type of castle"
                      placeholder="Select type"
                      labelPlacement="outside"
                      selectedKeys={typeId ? [typeId] : []}
                      onSelectionChange={(keys) => {
                        const v = Array.from(keys)[0] as string | undefined;
                        setTypeId(v ?? null);
                      }}
                    >
                      {types.map((x) => (
                        <SelectItem key={x.key}>{x.label}</SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="justify-between">
                <Button variant="flat" onPress={clearAll}>
                  Clear
                </Button>

                <Button
                  onPress={() => {
                    onApply({
                      province,
                      district,
                      subdistrict,
                      era,
                      architecture,
                      type_id: typeId,
                    });
                    onClose();
                  }}
                  className="text-white font-bold bg-tone-green"
                  startContent={<CheckCheck />}
                >
                  Apply
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}