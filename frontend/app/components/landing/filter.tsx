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
  Spinner,
  Divider,
} from "@heroui/react";
import { SlidersHorizontal, CheckCheck, Map, History, Trash2 } from "lucide-react";

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

  // States
  const [province, setProvince] = useState<string | null>(value?.province ?? null);
  const [district, setDistrict] = useState<string | null>(value?.district ?? null);
  const [subdistrict, setSubdistrict] = useState<string | null>(value?.subdistrict ?? null);
  const [era, setEra] = useState<string | null>(value?.era ?? null);
  const [architecture, setArchitecture] = useState<string | null>(value?.architecture ?? null);
  const [typeId, setTypeId] = useState<string | null>(value?.type_id ?? null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setOptLoading(true);
      try {
        const res = await fetch(`${API_BASE}/filters/options`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (alive) setOpts(data);
      } catch (err) {
        if (alive) setOpts(null);
        console.error(err)
      } finally {
        if (alive) setOptLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Format options for Select components
  const format = (arr?: string[]) => (arr ?? []).map((x) => ({ key: x, label: x }));
  const provinces = useMemo(() => format(opts?.provinces), [opts]);
  const districts = useMemo(() => format(opts?.districts), [opts]);
  const subdistricts = useMemo(() => format(opts?.subdistricts), [opts]);
  const eras = useMemo(() => format(opts?.eras), [opts]);
  const architectures = useMemo(() => format(opts?.architectures), [opts]);
  const types = useMemo(
    () => (opts?.types ?? []).map((t) => ({ key: String(t.type_id), label: t.type_detail })),
    [opts]
  );

  const handleClear = () => {
    setProvince(null); setDistrict(null); setSubdistrict(null);
    setEra(null); setArchitecture(null); setTypeId(null);
    onClear?.();
  };

  return (
    <>
      <Button
        onPress={onOpen}
        startContent={<SlidersHorizontal className="w-4 h-4" />}
        className="bg-white border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 px-6 h-12 rounded-2xl transition-all"
      >
        ตัวกรอง
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="3xl"
        scrollBehavior="inside"
        backdrop="blur"
        classNames={{
          base: "rounded-[2.5rem] border border-slate-100 p-2",
          header: "text-2xl font-black text-slate-900 px-6 pt-6",
          body: "px-6 py-4",
          footer: "px-6 pb-6 pt-2"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-3">
                
                กรองข้อมูลสถานที่
              </ModalHeader>

              <ModalBody>
                {optLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Spinner size="lg" className="text-indigo-600" classNames={{ circle1: "border-b-indigo-600", circle2: "border-b-indigo-600" }} />
                    <p className="text-sm font-medium text-slate-400">กำลังดึงข้อมูลตัวเลือก...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Section: Location */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                          <Map className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">ที่ตั้ง / ตำแหน่ง</h3>
                      </div>

                      <div className="space-y-5 mt-10">
                        <Select
                          label="จังหวัด"
                          placeholder="เลือกจังหวัด"
                          labelPlacement="outside"
                          selectedKeys={province ? [province] : []}
                          onSelectionChange={(keys) => {
                            setProvince(Array.from(keys)[0] as string || null);
                            setDistrict(null); setSubdistrict(null);
                          }}
                          variant="flat"
                          classNames={{ trigger: "rounded-2xl bg-slate-50 border-none" }}
                        >
                          {provinces.map((p) => <SelectItem key={p.key}>{p.label}</SelectItem>)}
                        </Select>

                        <Select
                          label="อำเภอ"
                          placeholder="เลือกอำเภอ"
                          labelPlacement="outside"
                          selectedKeys={district ? [district] : []}
                          onSelectionChange={(keys) => {
                            setDistrict(Array.from(keys)[0] as string || null);
                            setSubdistrict(null);
                          }}
                          variant="flat"
                          isDisabled={!province}
                          classNames={{ trigger: "rounded-2xl bg-slate-50 border-none" }}
                        >
                          {districts.map((d) => <SelectItem key={d.key}>{d.label}</SelectItem>)}
                        </Select>

                        <Select
                          label="ตำบล"
                          placeholder="เลือกตำบล"
                          labelPlacement="outside"
                          selectedKeys={subdistrict ? [subdistrict] : []}
                          onSelectionChange={(keys) => setSubdistrict(Array.from(keys)[0] as string || null)}
                          variant="flat"
                          isDisabled={!district}
                          classNames={{ trigger: "rounded-2xl bg-slate-50 border-none" }}
                        >
                          {subdistricts.map((s) => <SelectItem key={s.key}>{s.label}</SelectItem>)}
                        </Select>
                      </div>
                    </div>

                    <Divider className="md:hidden" />

                    {/* Section: Characteristics */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                          <History className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">ลักษณะเฉพาะ</h3>
                      </div>

                      <div className="space-y-5 mt-10">
                        <Select
                          label="ยุคสมัย"
                          placeholder="ระบุยุคสมัย"
                          labelPlacement="outside"
                          selectedKeys={era ? [era] : []}
                          onSelectionChange={(keys) => setEra(Array.from(keys)[0] as string || null)}
                          variant="flat"
                          classNames={{ trigger: "rounded-2xl bg-slate-50 border-none" }}
                        >
                          {eras.map((x) => <SelectItem key={x.key}>{x.label}</SelectItem>)}
                        </Select>

                        <Select
                          label="สถาปัตยกรรม"
                          placeholder="ระบุรูปแบบ"
                          labelPlacement="outside"
                          selectedKeys={architecture ? [architecture] : []}
                          onSelectionChange={(keys) => setArchitecture(Array.from(keys)[0] as string || null)}
                          variant="flat"
                          classNames={{ trigger: "rounded-2xl bg-slate-50 border-none" }}
                        >
                          {architectures.map((x) => <SelectItem key={x.key}>{x.label}</SelectItem>)}
                        </Select>

                        <Select
                          label="ประเภทโบราณสถาน"
                          placeholder="ระบุประเภท"
                          labelPlacement="outside"
                          selectedKeys={typeId ? [typeId] : []}
                          onSelectionChange={(keys) => setTypeId(Array.from(keys)[0] as string || null)}
                          variant="flat"
                          classNames={{ trigger: "rounded-2xl bg-slate-50 border-none" }}
                        >
                          {types.map((x) => <SelectItem key={x.key}>{x.label}</SelectItem>)}
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>

              <ModalFooter className="flex items-center justify-between border-t border-slate-50 pt-6">
                <Button
                  onPress={handleClear}
                  startContent={<Trash2 className="w-4 h-4" />}
                  className="font-bold rounded-xl bg-white text-tone-red hover:bg-tone-red hover:text-white"
                >
                  ล้างทั้งหมด
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="flat"
                    onPress={onClose}
                    className="rounded-xl font-bold"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    onPress={() => {
                      onApply({ province, district, subdistrict, era, architecture, type_id: typeId });
                      onClose();
                    }}
                    className="bg-slate-900 text-white font-bold rounded-xl px-8 shadow-lg shadow-slate-200 transition-transform active:scale-95"
                    startContent={<CheckCheck className="w-4 h-4" />}
                  >
                    บันทึกตัวกรอง
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}