"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminBar from "@/app/components/admin/adminbar";
import AddCastleForm from "@/app/components/admin/managecastle/AddCastleForm";
import {
  PlusCircle,
  Database,
  MapPinned,
  Search,
  Pencil,
  Trash2,
  X,
  TextAlignJustify
} from "lucide-react";
import {
  CastleType,
  getCastles,
  getCastleId,
  deleteCastle,
  updateCastle,
  uploadImageVector,
  uploadDocumentVector,
  addNearbyPlace,
} from "@/app/service/admin/managecastle/castleService";
import { useDisclosure, Form, Input, Button, addToast, Select, SelectItem, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import ModalDelete from "@/app/components/admin/modal";

export default function ManageCastle() {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [castles, setCastles] = useState<CastleType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCastle, setSelectedCastle] = useState<CastleType | null>(null);

  // Delete modal state
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
  const [castleToDelete, setCastleToDelete] = useState<CastleType | null>(null);

  const [selectedVectorCastleId, setSelectedVectorCastleId] =
    useState<string>("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [vectorLoading, setVectorLoading] = useState(false);

  const [selectedDocCastleId, setSelectedDocCastleId] = useState<string>("");
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  const [nearbyCastleId, setNearbyCastleId] = useState<string>("");
  const [nearbyPlaceName, setNearbyPlaceName] = useState("");
  const [nearbyDetail, setNearbyDetail] = useState("");
  const [nearbyLatitude, setNearbyLatitude] = useState("");
  const [nearbyLongitude, setNearbyLongitude] = useState("");
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const resetNearbyModal = () => {
    setNearbyCastleId("");
    setNearbyPlaceName("");
    setNearbyDetail("");
    setNearbyLatitude("");
    setNearbyLongitude("");
  };
  const menuButtons = [
    { id: 1, title: "Add New Castle", icon: PlusCircle, color: "bg-tone-orange" },
    {
      id: 3,
      title: "Add Nearby Place",
      icon: MapPinned,
      color: "bg-tone-orange",
    },
    {
      id: 2,
      title: "Export Data Vector",
      icon: Database,
      color: "border-tone-orange text-tone-orange",
    },
  ];

  const fetchCastles = async () => {
    try {
      setLoading(true);
      const data = await getCastles();
      setCastles(data);
    } catch (error) {
      console.error("Fetch Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCastles();
  }, []);

  const filteredCastles = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return castles;

    return castles.filter((castle) =>
      [
        castle.castle_name,
        castle.province,
        castle.district,
        castle.sub_district,
        castle.era,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [castles, searchTerm]);

  const handleDeleteClick = (castle: CastleType) => {
    setCastleToDelete(castle);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!castleToDelete) return;

    const castleId = getCastleId(castleToDelete);
    if (!castleId) return;

    try {
      await deleteCastle(castleId);
      fetchCastles();
      onDeleteOpenChange();
    } catch (error) {
      console.error("Delete Error", error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCastle) return;

    const castleId = getCastleId(selectedCastle);
    if (!castleId) return;

    try {
      const payload = {
        castle_name: selectedCastle.castle_name,
        castle_description: selectedCastle.castle_description || "",
        era: selectedCastle.era || "",
        architecture_detail: selectedCastle.architecture_detail || "",
        type_id: Number(selectedCastle.type_id) || 0,
        province: selectedCastle.province || "",
        district: selectedCastle.district || "",
        sub_district: selectedCastle.sub_district || "",
        latitude: Number(selectedCastle.latitude) || 0,
        longitude: Number(selectedCastle.longitude) || 0,
      };

      await updateCastle(castleId, payload);

      addToast({ title: "แก้ไขสำเร็จ", color: "success" });
      setIsEditOpen(false);
      setSelectedCastle(null);
      fetchCastles();
    } catch (error) {
      console.log("Update Error", error);
    }
  };

  const openEditModal = (castle: CastleType) => {
    setSelectedCastle(castle);
    setIsEditOpen(true);
  };

  const resetVectorModal = () => {
    setSelectedVectorCastleId("");
    setSelectedImageFile(null);
    setSelectedDocCastleId("");
    setSelectedDocFile(null);
  };

  return (
    <section className="min-h-screen bg-stone-50 relative">
      <AdminBar />

      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-[#3E2723] mb-10 tracking-tight">
          Castle Management System
        </h1>

        <div className="bg-white rounded-[2rem] shadow-lg border border-stone-200 p-6 mb-10">
          <div className="relative mb-8">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              placeholder="Search castle name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-stone-300 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="flex items-center justify-between w-full mb-6 gap-4">
            <h2 className="text-2xl font-bold text-[#3E2723] whitespace-nowrap">Table</h2>
            <div className="flex items-center justify-end gap-3 flex-wrap">
              {menuButtons.map((btn) => (
                <Button
                  key={btn.id}
                  onClick={() => setActiveTab(btn.id)}
                  variant={btn.title === "Export Data Vector" ? "bordered" : "solid"}
                  className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold transition-all transform hover:scale-[1.03] shadow-md ${btn.title !== "Export Data Vector" ? "text-white " + btn.color : btn.color
                    }`}
                >
                  <btn.icon size={18} />
                  <span>{btn.title}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center border-separate border-spacing-y-2">
              <thead className="bg-stone-100 text-stone-700">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Castle ID</th>
                  <th className="px-4 py-3">Castle Name</th>
                  <th className="px-4 py-3">Era</th>
                  <th className="px-4 py-3">Province</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Sub District</th>
                  <th className="px-4 py-3">Latitude</th>
                  <th className="px-4 py-3">Longitude</th>
                  <th className="px-4 py-3 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-stone-400">
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : filteredCastles.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-stone-400">
                      ไม่พบข้อมูลสถานที่
                    </td>
                  </tr>
                ) : (
                  filteredCastles.map((castle) => (
                    <tr
                      key={getCastleId(castle)}
                      className="bg-white shadow-sm border border-stone-100"
                    >
                      <td className="px-4 py-3">{getCastleId(castle)}</td>
                      <td className="px-4 py-3 font-semibold text-[#3E2723]">
                        {castle.castle_name}
                      </td>
                      <td className="px-4 py-3">{castle.era || "-"}</td>
                      <td className="px-4 py-3">{castle.province || "-"}</td>
                      <td className="px-4 py-3">{castle.district || "-"}</td>
                      <td className="px-4 py-3">
                        {castle.sub_district || "-"}
                      </td>
                      <td className="px-4 py-3">{castle.latitude || "-"}</td>
                      <td className="px-4 py-3">{castle.longitude || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            isIconOnly
                            onClick={() => openEditModal(castle)}
                            className="text-stone-600 hover:text-orange-600 bg-white"
                          >
                            <Pencil size={18} />
                          </Button>
                          <Button
                            isIconOnly
                            onClick={() => handleDeleteClick(castle)}
                            className="text-red-500 hover:text-red-700 bg-white"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {activeTab === 1 && (
        <AddCastleForm
          onClose={() => {
            setActiveTab(null);
            fetchCastles();
          }}
        />
      )}

      {activeTab === 2 && (
        <Modal
          isOpen={true}
          onOpenChange={(open) => {
            if (!open) {
              setActiveTab(null);
              resetVectorModal();
            }
          }}
          size="3xl"
          scrollBehavior="inside"
          classNames={{ base: "rounded-[2rem]" }}
          backdrop="blur"
        >
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="flex flex-col items-center justify-center pt-8 pb-2">
                  <Database size={48} className="text-stone-300 mb-4" />
                  <h2 className="text-xl font-bold text-stone-700 text-center">
                    Add New Vector Data
                  </h2>
                </ModalHeader>
                <ModalBody className="pb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-stone-200 rounded-2xl p-5">
                      <h3 className="text-lg font-bold text-[#3E2723] mb-4">
                        Upload Image Vector
                      </h3>

                      <div className="space-y-4">
                        <div className="flex flex-col gap-1 w-full">
                          <label className="text-sm font-bold text-stone-700">Select Castle</label>
                          <Select
                            variant="bordered"
                            placeholder="-- เลือกปราสาท --"
                            selectedKeys={selectedVectorCastleId ? new Set([selectedVectorCastleId]) : new Set([])}
                            onSelectionChange={(keys) => {
                              const selectedValue = Array.from(keys)[0] as string;
                              if (selectedValue) {
                                setSelectedVectorCastleId(selectedValue);
                              }
                            }}
                          >
                            {castles.map((castle) => (
                              <SelectItem
                                key={String(getCastleId(castle))}
                              >
                                {`${getCastleId(castle)} - ${castle.castle_name}${castle.province ? ` (${castle.province})` : ""}`}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                          <label className="text-sm font-bold text-stone-700">Upload Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setSelectedImageFile(e.target.files?.[0] || null)
                            }
                            className="w-full border-2 border-stone-100 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>

                        <Button
                          onClick={async () => {
                            if (!selectedVectorCastleId) {
                              addToast({ title: "กรุณาเลือกปราสาทก่อน", color: "warning" });
                              return;
                            }

                            if (!selectedImageFile) {
                              addToast({ title: "กรุณาเลือกรูปภาพก่อน", color: "warning" });
                              return;
                            }

                            try {
                              setVectorLoading(true);

                              const res = await uploadImageVector(
                                Number(selectedVectorCastleId),
                                selectedImageFile,
                              );

                              addToast({ title: `${res.message}\nimg_id: ${res.img_id}`, color: "success" });
                              setSelectedVectorCastleId("");
                              setSelectedImageFile(null);
                            } catch (error) {
                              console.log("Error", error);
                            } finally {
                              setVectorLoading(false);
                            }
                          }}
                          isLoading={vectorLoading}
                          className="w-full px-4 py-3 rounded-xl bg-tone-brownold text-white font-bold hover:opacity-90 disabled:opacity-50"
                        >
                          {vectorLoading
                            ? "กำลังเพิ่มข้อมูล..."
                            : "Upload and Convert Image"}
                        </Button>
                      </div>
                    </div>

                    <div className="border border-stone-200 rounded-2xl p-5">
                      <h3 className="text-lg font-bold text-[#3E2723] mb-4">
                        Upload Document Vector
                      </h3>

                      <div className="space-y-4">
                        <div className="flex flex-col gap-1 w-full">
                          <label className="text-sm font-bold text-stone-700">Select Castle</label>
                          <Select
                            variant="bordered"
                            placeholder="-- เลือกปราสาท --"
                            selectedKeys={selectedDocCastleId ? new Set([selectedDocCastleId]) : new Set([])}
                            onSelectionChange={(keys) => {
                              const selectedValue = Array.from(keys)[0] as string;
                              if (selectedValue) {
                                setSelectedDocCastleId(selectedValue);
                              }
                            }}
                          >
                            {castles.map((castle) => (
                              <SelectItem
                                key={String(getCastleId(castle))}
                              >
                                {`${getCastleId(castle)} - ${castle.castle_name}${castle.province ? ` (${castle.province})` : ""}`}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                          <label className="text-sm font-bold text-stone-700">Upload Document (.pdf, .txt)</label>
                          <input
                            type="file"
                            accept=".pdf,.txt"
                            onChange={(e) =>
                              setSelectedDocFile(e.target.files?.[0] || null)
                            }
                            className="w-full border-2 border-stone-100 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>

                        <Button
                          onClick={async () => {
                            if (!selectedDocCastleId) {
                              addToast({ title: "กรุณาเลือกปราสาทก่อน", color: "warning" });
                              return;
                            }

                            if (!selectedDocFile) {
                              addToast({ title: "กรุณาเลือกไฟล์เอกสารก่อน", color: "warning" });
                              return;
                            }

                            try {
                              setDocLoading(true);

                              const res = await uploadDocumentVector(
                                Number(selectedDocCastleId),
                                selectedDocFile,
                              );

                              addToast({ title: `${res.message || "เพิ่ม document vector สำเร็จ"}\nChunks inserted: ${res.chunks_inserted ?? res.inserted ?? 0}`, color: "success" });
                              setSelectedDocCastleId("");
                              setSelectedDocFile(null);
                            } catch (error) {
                              console.log("Error", error);
                            } finally {
                              setDocLoading(false);
                            }
                          }}
                          isLoading={docLoading}
                          className="w-full px-4 py-3 rounded-xl bg-tone-brownold text-white font-bold hover:opacity-90 disabled:opacity-50 shadow-lg shadow-[#8C5A3C]/20"
                        >
                          {docLoading
                            ? "กำลังเพิ่มข้อมูล..."
                            : "Upload and Convert Document"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      )}

      {activeTab === 3 && (
        <Modal
          isOpen={true}
          onOpenChange={(open) => {
            if (!open) {
              setActiveTab(null);
              resetNearbyModal();
            }
          }}
          size="2xl"
          scrollBehavior="inside"
          classNames={{ base: "rounded-[2rem]" }}
          backdrop="blur"
        >
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="flex flex-col items-center justify-center pt-8 pb-2">
                  <MapPinned size={48} className="text-stone-300 mb-4" />
                  <h2 className="text-xl font-bold text-stone-700 text-center">
                    Add Nearby Place
                  </h2>
                </ModalHeader>
                <ModalBody className="pb-8">

                  <Form
                    className="space-y-4 w-full"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!nearbyCastleId) {
                        addToast({ title: "กรุณาเลือกปราสาทก่อน", color: "warning" });
                        return;
                      }

                      if (!nearbyPlaceName.trim()) {
                        addToast({ title: "กรุณากรอกชื่อสถานที่ใกล้เคียง", color: "warning" });
                        return;
                      }

                      const lat = Number(nearbyLatitude);
                      const lng = Number(nearbyLongitude);

                      if (isNaN(lat) || isNaN(lng)) {
                        addToast({ title: "Latitude และ Longitude ต้องเป็นตัวเลข", color: "danger" });
                        return;
                      }

                      try {
                        setNearbyLoading(true);

                        const res = await addNearbyPlace({
                          castle_id: Number(nearbyCastleId),
                          place_name: nearbyPlaceName.trim(),
                          nearby_detail: nearbyDetail.trim(),
                          latitude: lat,
                          longitude: lng,
                        });

                        addToast({ title: res.message || "เพิ่มสถานที่ใกล้เคียงสำเร็จ", color: "success" });
                        resetNearbyModal();
                        setActiveTab(null);
                      } catch (error) {
                        console.log("Error", error);
                      } finally {
                        setNearbyLoading(false);
                      }
                    }}
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <label className="text-sm font-bold text-stone-700">Select Castle</label>
                      <Select
                        variant="bordered"
                        placeholder="-- เลือกปราสาท --"
                        selectedKeys={nearbyCastleId ? new Set([nearbyCastleId]) : new Set([])}
                        onSelectionChange={(keys) => {
                          const selectedValue = Array.from(keys)[0] as string;
                          if (selectedValue) {
                            setNearbyCastleId(selectedValue);
                          }
                        }}
                      >
                        {castles.map((castle) => (
                          <SelectItem
                            key={String(getCastleId(castle))}
                          >
                            {`${getCastleId(castle)} - ${castle.castle_name}${castle.province ? ` (${castle.province})` : ""}`}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                      <label className="text-sm font-bold text-stone-700">Place Name</label>
                      <Input
                        variant="bordered"
                        value={nearbyPlaceName}
                        onChange={(e) => setNearbyPlaceName(e.target.value)}
                        placeholder="เช่น พิพิธภัณฑสถานแห่งชาติพิมาย"
                      />
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                      <label className="text-sm font-bold text-stone-700">Nearby Detail</label>
                      <Textarea
                        variant="bordered"
                        value={nearbyDetail}
                        onChange={(e) => setNearbyDetail(e.target.value)}
                        placeholder="รายละเอียดสถานที่ใกล้เคียง..."
                        minRows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-bold text-stone-700">Latitude</label>
                        <Input
                          type="number"
                          step="any"
                          variant="bordered"
                          value={nearbyLatitude}
                          onChange={(e) => setNearbyLatitude(e.target.value)}
                          placeholder="15.223599"
                        />
                      </div>

                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-bold text-stone-700">Longitude</label>
                        <Input
                          type="number"
                          step="any"
                          variant="bordered"
                          value={nearbyLongitude}
                          onChange={(e) => setNearbyLongitude(e.target.value)}
                          placeholder="102.4919033"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      isLoading={nearbyLoading}
                      className="w-full mt-4 px-4 py-3 rounded-xl shadow-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-green-600/20 disabled:opacity-50"
                    >
                      {nearbyLoading ? "กำลังเพิ่มข้อมูล..." : "Add Nearby Place"}
                    </Button>
                  </Form>
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      )}

      {isEditOpen && selectedCastle && (
        <Modal
          isOpen={true}
          onOpenChange={(open) => {
            if (!open) {
              setIsEditOpen(false);
              setSelectedCastle(null);
            }
          }}
          size="2xl"
          scrollBehavior="inside"
          classNames={{ base: "rounded-[2rem]" }}
          backdrop="opaque"
          placement="center"
        >
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="text-2xl font-bold text-[#3E2723] pt-8">
                  Edit Castle
                </ModalHeader>
                <ModalBody className="pb-4">
                  <Form id="edit" className="w-full flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-bold text-stone-700">Castle Name</label>
                        <Input
                          className="font-bold"
                          placeholder="Type Castle Name"
                          startContent={<TextAlignJustify size={18} className="text-stone-400" />}
                          variant="bordered"
                          value={selectedCastle.castle_name}
                          onChange={(e) =>
                            setSelectedCastle({
                              ...selectedCastle,
                              castle_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-bold text-stone-700">Era</label>
                        <Input
                          className="font-bold"
                          placeholder="Type Era"
                          startContent={<TextAlignJustify size={18} className="text-stone-400" />}
                          variant="bordered"
                          value={selectedCastle.era || ""}
                          onChange={(e) =>
                            setSelectedCastle({ ...selectedCastle, era: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-bold text-stone-700">Architecture</label>
                        <Input
                          className="font-bold"
                          placeholder="Type Architecture"
                          startContent={<TextAlignJustify size={18} className="text-stone-400" />}
                          variant="bordered"
                          value={selectedCastle.architecture_detail || ""}
                          onChange={(e) =>
                            setSelectedCastle({
                              ...selectedCastle,
                              architecture_detail: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-bold text-stone-700">Province</label>
                        <Input
                          className="font-bold"
                          placeholder="Type Province"
                          startContent={<TextAlignJustify size={18} className="text-stone-400" />}
                          variant="bordered"
                          value={selectedCastle.province || ""}
                          onChange={(e) =>
                            setSelectedCastle({
                              ...selectedCastle,
                              province: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-bold text-stone-700">District</label>
                        <Input
                          className="font-bold"
                          placeholder="Type District"
                          startContent={<TextAlignJustify size={18} className="text-stone-400" />}
                          variant="bordered"
                          value={selectedCastle.district || ""}
                          onChange={(e) =>
                            setSelectedCastle({
                              ...selectedCastle,
                              district: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-bold text-stone-700">Sub District</label>
                        <Input
                          className="font-bold"
                          placeholder="Type Sub District"
                          startContent={<TextAlignJustify size={18} className="text-stone-400" />}
                          variant="bordered"
                          value={selectedCastle.sub_district || ""}
                          onChange={(e) =>
                            setSelectedCastle({
                              ...selectedCastle,
                              sub_district: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-bold text-stone-700">Latitude</label>
                        <Input
                          type="number"
                          step="any"
                          className="font-bold"
                          placeholder="14.9685"
                          startContent={<TextAlignJustify size={18} className="text-stone-400" />}
                          variant="bordered"
                          value={String(selectedCastle.latitude || "")}
                          onChange={(e) =>
                            setSelectedCastle({
                              ...selectedCastle,
                              latitude: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-bold text-stone-700">Longitude</label>
                        <Input
                          type="number"
                          step="any"
                          className="font-bold"
                          placeholder="102.4949"
                          startContent={<TextAlignJustify size={18} className="text-stone-400" />}
                          variant="bordered"
                          value={String(selectedCastle.longitude || "")}
                          onChange={(e) =>
                            setSelectedCastle({
                              ...selectedCastle,
                              longitude: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="md:col-span-2 flex flex-col gap-1 w-full">
                        <label className="text-sm font-bold text-stone-700">Description</label>
                        <Textarea
                          className="font-bold"
                          placeholder="รายละเอียดโบราณสถาน..."
                          variant="bordered"
                          minRows={3}
                          value={selectedCastle.castle_description || ""}
                          onChange={(e) =>
                            setSelectedCastle({
                              ...selectedCastle,
                              castle_description: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </Form>
                </ModalBody>
                <ModalFooter className="pb-8">
                  <Button
                    variant="light"
                    onClick={() => {
                      setIsEditOpen(false);
                      setSelectedCastle(null);
                    }}
                    className="text-stone-500 font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    className="bg-tone-orange text-white font-bold"
                  >
                    Save Changes
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}

      <ModalDelete
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        onEvent={handleDelete}
        item={castleToDelete?.castle_name || ""}
        label="CastleName"
        size="md"
      />
    </section>
  );
}
