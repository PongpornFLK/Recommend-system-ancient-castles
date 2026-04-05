"use client";
import React, { useEffect, useMemo, useState } from "react";
import AdminBar from "@/app/components/admin/adminbar";
import AddCastleForm from "@/app/components/admin/AddCastleForm";
import {
  PlusCircle,
  Database,
  MapPinned,
  Search,
  Pencil,
  Trash2,
  X,
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
  getNearbyPlaces,
  deleteNearbyPlace,
  updateNearbyPlace,
  NearbyPlaceType,
} from "@/app/service/castle/managecastle";

export default function ManageCastle() {
  // =========================================================
  // 1. STATE: ทั่วไป & จัดการปราสาท (Castles)
  // =========================================================
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [castles, setCastles] = useState<CastleType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCastle, setSelectedCastle] = useState<CastleType | null>(null);

  // =========================================================
  // 2. STATE: จัดการข้อมูล Vector (รูปภาพ & เอกสาร)
  // =========================================================
  const [selectedVectorCastleId, setSelectedVectorCastleId] = useState<string>("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [vectorLoading, setVectorLoading] = useState(false);

  const [selectedDocCastleId, setSelectedDocCastleId] = useState<string>("");
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  // =========================================================
  // 3. STATE: เพิ่มสถานที่ใกล้เคียง (Add Nearby Place)
  // =========================================================
  const [nearbyCastleId, setNearbyCastleId] = useState<string>("");
  const [nearbyPlaceName, setNearbyPlaceName] = useState("");
  const [nearbyDetail, setNearbyDetail] = useState("");
  const [nearbyLatitude, setNearbyLatitude] = useState("");
  const [nearbyLongitude, setNearbyLongitude] = useState("");
  const [nearbyLoading, setNearbyLoading] = useState(false);

  // =========================================================
  // 4. STATE: แสดงและแก้ไขสถานที่ใกล้เคียง (Nearby Places Table & Edit)
  // =========================================================
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlaceType[]>([]);
  const [nearbyTableLoading, setNearbyTableLoading] = useState(false);
  const [isEditNearbyOpen, setIsEditNearbyOpen] = useState(false);
  const [selectedNearby, setSelectedNearby] = useState<NearbyPlaceType | null>(null);
  const [nearbySearchTerm, setNearbySearchTerm] = useState("");

  const menuButtons = [
    { id: 1, title: "Add New Castle", icon: PlusCircle, color: "bg-[#5D4037]" },
    { id: 2, title: "Add New Vector Data", icon: Database, color: "bg-[#8D6E63]" },
  ];

  // =========================================================
  // ฟังก์ชัน API: โหลดข้อมูล
  // =========================================================
  
  const fetchCastles = async () => {
    try {
      setLoading(true);
      const data = await getCastles();
      setCastles(data);
    } catch (error) {
      console.error("โหลดข้อมูลปราสาทไม่สำเร็จ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyPlaces = async () => {
    try {
      setNearbyTableLoading(true);
      const data = await getNearbyPlaces();
      setNearbyPlaces(data);
    } catch (error) {
      console.error("โหลด nearby ไม่สำเร็จ", error);
    } finally {
      setNearbyTableLoading(false);
    }
  };

  useEffect(() => {
    fetchCastles();
    fetchNearbyPlaces();
  }, []);

  // =========================================================
  // ฟังก์ชันช่วยค้นหา (Search Filters)
  // =========================================================
  
  // กรองปราสาท
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
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [castles, searchTerm]);

  // ⭐ เพิ่มฟังก์ชันกรอง Nearby Places
  const filteredNearbyPlaces = useMemo(() => {
    const keyword = nearbySearchTerm.trim().toLowerCase();
    if (!keyword) return nearbyPlaces;

    return nearbyPlaces.filter((item) =>
      [
        item.place_name,
        item.castle_name,
        String(item.castle_id),
        item.nearby_detail
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [nearbyPlaces, nearbySearchTerm]);

  // =========================================================
  // ฟังก์ชันจัดการ: ปราสาท (Castles)
  // =========================================================

  const openEditModal = (castle: CastleType) => {
    setSelectedCastle(castle);
    setIsEditOpen(true);
  };

  const handleDelete = async (castle: CastleType) => {
    const castleId = getCastleId(castle);
    if (!castleId || !window.confirm(`ต้องการลบ "${castle.castle_name}"?`)) return;

    try {
      await deleteCastle(castleId);
      fetchCastles();
    } catch (error) {
      console.error("ลบข้อมูลไม่สำเร็จ", error);
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
      alert("แก้ไขสำเร็จ");
      setIsEditOpen(false);
      setSelectedCastle(null);
      fetchCastles();
    } catch (error: any) {
      alert("แก้ไขไม่สำเร็จ: " + (error.response?.data?.detail || error.message));
    }
  };

  // =========================================================
  // ฟังก์ชันจัดการ: สถานที่ใกล้เคียง (Nearby Places)
  // =========================================================

  const openEditNearby = (item: NearbyPlaceType) => {
    setSelectedNearby(item);
    setIsEditNearbyOpen(true);
  };

  const handleDeleteNearbyPlace = async (item: NearbyPlaceType) => {
    if (!window.confirm(`ต้องการลบ "${item.place_name}"?`)) return;

    try {
      await deleteNearbyPlace(item.nearplace_id);
      fetchNearbyPlaces();
    } catch (error: any) {
      alert("ลบไม่สำเร็จ: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleUpdateNearby = async () => {
    if (!selectedNearby) return;

    try {
      await updateNearbyPlace(selectedNearby.nearplace_id, {
        castle_id: Number(selectedNearby.castle_id),
        place_name: selectedNearby.place_name,
        nearby_detail: selectedNearby.nearby_detail || "",
        latitude: Number(selectedNearby.latitude),
        longitude: Number(selectedNearby.longitude),
      });

      alert("แก้ไข Nearby สำเร็จ");
      setIsEditNearbyOpen(false);
      setSelectedNearby(null);
      fetchNearbyPlaces();
    } catch (error: any) {
      alert("แก้ไขไม่สำเร็จ: " + (error.response?.data?.detail || error.message));
    }
  };

  // =========================================================
  // ฟังก์ชัน Reset Modal ค่าต่างๆ
  // =========================================================

  const resetNearbyModal = () => {
    setNearbyCastleId("");
    setNearbyPlaceName("");
    setNearbyDetail("");
    setNearbyLatitude("");
    setNearbyLongitude("");
  };

  const resetVectorModal = () => {
    setSelectedVectorCastleId("");
    setSelectedImageFile(null);
    setSelectedDocCastleId("");
    setSelectedDocFile(null);
  };

  // =========================================================
  // ส่วนแสดงผล UI (Render)
  // =========================================================
  return (
    <section className="min-h-screen bg-stone-50 relative">
      <AdminBar />

      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-[#3E2723] mb-10 tracking-tight">
          Manage Castle System
        </h1>

        {/* ---------------------------------------------------------
            SECTION: ตารางรายชื่อปราสาท (Castle Table)
        ---------------------------------------------------------- */}
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

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-[#3E2723]">Castle Table</h2>
            <div className="flex flex-wrap gap-3">
              {menuButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setActiveTab(btn.id)}
                  className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-white text-sm font-bold transition-all transform hover:scale-[1.03] shadow-md ${btn.color}`}
                >
                  <btn.icon size={18} />
                  <span>{btn.title}</span>
                </button>
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
                      <td className="px-4 py-3">{castle.sub_district || "-"}</td>
                      <td className="px-4 py-3">{castle.latitude || "-"}</td>
                      <td className="px-4 py-3">{castle.longitude || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => openEditModal(castle)}
                            className="text-stone-600 hover:text-orange-600"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(castle)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------------------------------------------------------
            SECTION: ตารางสถานที่ใกล้เคียง (Nearby Places Table)
        ---------------------------------------------------------- */}
        <div className="bg-white rounded-[2rem] shadow-lg border border-stone-200 p-6 mb-10">
          
          {/* ⭐ ช่องค้นหา Nearby Places */}
          <div className="relative mb-8">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              placeholder="Search nearby place name, detail, or castle..."
              value={nearbySearchTerm}
              onChange={(e) => setNearbySearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-stone-300 outline-none focus:ring-2 focus:ring-[#A1887F]"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center relative mb-6">
            <h2 className="text-2xl font-bold text-[#3E2723] mb-4 md:mb-0 md:absolute md:left-0">
              Nearby Places Table
            </h2>
            
            <div className="w-full flex justify-center">
              <button
                onClick={() => setActiveTab(3)}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-white text-sm font-bold transition-all transform hover:scale-[1.03] shadow-md bg-[#A1887F]"
              >
                <MapPinned size={18} />
                <span>Add Nearby Places</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center border-separate border-spacing-y-2">
              <thead className="bg-stone-100 text-stone-700">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Nearby ID</th>
                  <th className="px-4 py-3">Castle</th>
                  <th className="px-4 py-3">Place Name</th>
                  <th className="px-4 py-3">Detail</th>
                  <th className="px-4 py-3">Latitude</th>
                  <th className="px-4 py-3">Longitude</th>
                  <th className="px-4 py-3 rounded-r-xl">Action</th>
                </tr>
              </thead>

              <tbody>
                {nearbyTableLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-stone-400">
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : filteredNearbyPlaces.length === 0 ? ( // ⭐ เปลี่ยนเป็น mapped จาก filteredNearbyPlaces
                  <tr>
                    <td colSpan={7} className="py-8 text-stone-400">
                      ไม่พบข้อมูลสถานที่ใกล้เคียง
                    </td>
                  </tr>
                ) : (
                  filteredNearbyPlaces.map((item) => ( // ⭐ เปลี่ยนเป็น mapped จาก filteredNearbyPlaces
                    <tr
                      key={item.nearplace_id}
                      className="bg-white shadow-sm border border-stone-100"
                    >
                      <td className="px-4 py-3">{item.nearplace_id}</td>
                      <td className="px-4 py-3">
                        {item.castle_name || item.castle_id}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#3E2723]">
                        {item.place_name}
                      </td>
                      <td className="px-4 py-3">
                        {item.nearby_detail || "-"}
                      </td>
                      <td className="px-4 py-3">{item.latitude || "-"}</td>
                      <td className="px-4 py-3">{item.longitude || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => openEditNearby(item)}
                            className="text-stone-600 hover:text-orange-600"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteNearbyPlace(item)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
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

      {/* ---------------------------------------------------------
          MODALS / POPUPS ส่วนต่างๆ
      ---------------------------------------------------------- */}
      {/* (โค้ด Modal ส่วนนี้เหมือนเดิมทุกประการ) */}
      
      {activeTab === 1 && (
        <AddCastleForm
          onClose={() => {
            setActiveTab(null);
            fetchCastles();
          }}
        />
      )}

      {activeTab === 2 && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setActiveTab(null);
                resetVectorModal();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>

            <Database size={48} className="mx-auto text-stone-300 mb-4" />
            <h2 className="text-xl font-bold text-stone-700 text-center mb-6">
              Add New Vector Data
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-stone-200 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-[#3E2723] mb-4">
                  Upload Image Vector
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                      Select Castle
                    </label>
                    <select
                      value={selectedVectorCastleId}
                      onChange={(e) => setSelectedVectorCastleId(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="">-- เลือกปราสาท --</option>
                      {castles.map((castle) => (
                        <option
                          key={getCastleId(castle)}
                          value={String(getCastleId(castle))}
                        >
                          {getCastleId(castle)} - {castle.castle_name}
                          {castle.province ? ` (${castle.province})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setSelectedImageFile(e.target.files?.[0] || null)
                      }
                      className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      if (!selectedVectorCastleId) {
                        alert("กรุณาเลือกปราสาทก่อน");
                        return;
                      }

                      if (!selectedImageFile) {
                        alert("กรุณาเลือกรูปภาพก่อน");
                        return;
                      }

                      try {
                        setVectorLoading(true);
                        const res = await uploadImageVector(
                          Number(selectedVectorCastleId),
                          selectedImageFile
                        );
                        alert(`${res.message}\nimg_id: ${res.img_id}`);
                        setSelectedVectorCastleId("");
                        setSelectedImageFile(null);
                      } catch (error: any) {
                        alert(
                          "เพิ่ม image vector ไม่สำเร็จ: " +
                            (error.response?.data?.detail || error.message)
                        );
                      } finally {
                        setVectorLoading(false);
                      }
                    }}
                    disabled={vectorLoading}
                    className="w-full px-4 py-3 rounded-xl bg-[#5D4037] text-white font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    {vectorLoading
                      ? "กำลังเพิ่มข้อมูล..."
                      : "Upload and Convert Image"}
                  </button>
                </div>
              </div>

              <div className="border border-stone-200 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-[#3E2723] mb-4">
                  Upload Document Vector
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                      Select Castle
                    </label>
                    <select
                      value={selectedDocCastleId}
                      onChange={(e) => setSelectedDocCastleId(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="">-- เลือกปราสาท --</option>
                      {castles.map((castle) => (
                        <option
                          key={getCastleId(castle)}
                          value={String(getCastleId(castle))}
                        >
                          {getCastleId(castle)} - {castle.castle_name}
                          {castle.province ? ` (${castle.province})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                      Upload Document (.pdf, .txt)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={(e) =>
                        setSelectedDocFile(e.target.files?.[0] || null)
                      }
                      className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      if (!selectedDocCastleId) {
                        alert("กรุณาเลือกปราสาทก่อน");
                        return;
                      }

                      if (!selectedDocFile) {
                        alert("กรุณาเลือกไฟล์เอกสารก่อน");
                        return;
                      }

                      try {
                        setDocLoading(true);
                        const res = await uploadDocumentVector(
                          Number(selectedDocCastleId),
                          selectedDocFile
                        );
                        alert(
                          `${res.message || "เพิ่ม document vector สำเร็จ"}\nChunks inserted: ${res.chunks_inserted ?? res.inserted ?? 0}`
                        );
                        setSelectedDocCastleId("");
                        setSelectedDocFile(null);
                      } catch (error: any) {
                        alert(
                          "เพิ่ม document vector ไม่สำเร็จ: " +
                            (error.response?.data?.detail || error.message)
                        );
                      } finally {
                        setDocLoading(false);
                      }
                    }}
                    disabled={docLoading}
                    className="w-full px-4 py-3 rounded-xl bg-[#8D6E63] text-white font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    {docLoading
                      ? "กำลังเพิ่มข้อมูล..."
                      : "Upload and Convert Document"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 3 && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setActiveTab(null);
                resetNearbyModal();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>

            <MapPinned size={48} className="mx-auto text-stone-300 mb-4" />
            <h2 className="text-xl font-bold text-stone-700 text-center mb-6">
              Add Nearby Place
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Select Castle
                </label>
                <select
                  value={nearbyCastleId}
                  onChange={(e) => setNearbyCastleId(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">-- เลือกปราสาท --</option>
                  {castles.map((castle) => (
                    <option
                      key={getCastleId(castle)}
                      value={String(getCastleId(castle))}
                    >
                      {getCastleId(castle)} - {castle.castle_name}
                      {castle.province ? ` (${castle.province})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Place Name
                </label>
                <input
                  type="text"
                  value={nearbyPlaceName}
                  onChange={(e) => setNearbyPlaceName(e.target.value)}
                  placeholder="เช่น พิพิธภัณฑสถานแห่งชาติพิมาย"
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Nearby Detail
                </label>
                <textarea
                  value={nearbyDetail}
                  onChange={(e) => setNearbyDetail(e.target.value)}
                  placeholder="รายละเอียดสถานที่ใกล้เคียง..."
                  rows={4}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={nearbyLatitude}
                    onChange={(e) => setNearbyLatitude(e.target.value)}
                    placeholder="15.223599"
                    className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={nearbyLongitude}
                    onChange={(e) => setNearbyLongitude(e.target.value)}
                    placeholder="102.4919033"
                    className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!nearbyCastleId) {
                    alert("กรุณาเลือกปราสาทก่อน");
                    return;
                  }

                  if (!nearbyPlaceName.trim()) {
                    alert("กรุณากรอกชื่อสถานที่ใกล้เคียง");
                    return;
                  }

                  const lat = Number(nearbyLatitude);
                  const lng = Number(nearbyLongitude);

                  if (isNaN(lat) || isNaN(lng)) {
                    alert("Latitude และ Longitude ต้องเป็นตัวเลข");
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
                    alert(res.message || "เพิ่มสถานที่ใกล้เคียงสำเร็จ");
                    resetNearbyModal();
                    setActiveTab(null);
                    fetchNearbyPlaces();
                  } catch (error: any) {
                    alert(
                      "เพิ่มสถานที่ใกล้เคียงไม่สำเร็จ: " +
                        (error.response?.data?.detail || error.message)
                    );
                  } finally {
                    setNearbyLoading(false);
                  }
                }}
                disabled={nearbyLoading}
                className="w-full px-4 py-3 rounded-xl bg-[#A1887F] text-white font-bold hover:opacity-90 disabled:opacity-50"
              >
                {nearbyLoading ? "กำลังเพิ่มข้อมูล..." : "Add Nearby Place"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && selectedCastle && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-[2rem] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#3E2723]">Edit Castle</h2>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedCastle(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Castle Name
                </label>
                <textarea
                  value={selectedCastle.castle_name || ""}
                  onChange={(e) =>
                    setSelectedCastle({
                      ...selectedCastle,
                      castle_name: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Era
                </label>
                <textarea
                  value={selectedCastle.era || ""}
                  onChange={(e) =>
                    setSelectedCastle({
                      ...selectedCastle,
                      era: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Type ID
                </label>
                <input
                  type="number"
                  value={selectedCastle.type_id || ""}
                  onChange={(e) =>
                    setSelectedCastle({
                      ...selectedCastle,
                      type_id: e.target.value,
                    })
                  }
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Architecture Detail
                </label>
                <textarea
                  value={selectedCastle.architecture_detail || ""}
                  onChange={(e) =>
                    setSelectedCastle({
                      ...selectedCastle,
                      architecture_detail: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Description
                </label>
                <textarea
                  value={selectedCastle.castle_description || ""}
                  onChange={(e) =>
                    setSelectedCastle({
                      ...selectedCastle,
                      castle_description: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Province
                </label>
                <textarea
                  value={selectedCastle.province || ""}
                  onChange={(e) =>
                    setSelectedCastle({
                      ...selectedCastle,
                      province: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  District
                </label>
                <textarea
                  value={selectedCastle.district || ""}
                  onChange={(e) =>
                    setSelectedCastle({
                      ...selectedCastle,
                      district: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Sub District
                </label>
                <textarea
                  value={selectedCastle.sub_district || ""}
                  onChange={(e) =>
                    setSelectedCastle({
                      ...selectedCastle,
                      sub_district: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={selectedCastle.latitude || ""}
                  onChange={(e) =>
                    setSelectedCastle({
                      ...selectedCastle,
                      latitude: e.target.value,
                    })
                  }
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={selectedCastle.longitude || ""}
                  onChange={(e) =>
                    setSelectedCastle({
                      ...selectedCastle,
                      longitude: e.target.value,
                    })
                  }
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedCastle(null);
                }}
                className="px-6 py-2 border border-orange-500 text-orange-500 rounded-xl font-bold hover:bg-orange-50"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditNearbyOpen && selectedNearby && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Edit Nearby Place</h2>

            <input
              value={selectedNearby.place_name || ""}
              onChange={(e) =>
                setSelectedNearby({ ...selectedNearby, place_name: e.target.value })
              }
              className="w-full border border-stone-300 rounded-xl p-3 mb-3 outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Place Name"
            />

            <textarea
              value={selectedNearby.nearby_detail || ""}
              onChange={(e) =>
                setSelectedNearby({ ...selectedNearby, nearby_detail: e.target.value })
              }
              className="w-full border border-stone-300 rounded-xl p-3 mb-3 outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder="Nearby Detail"
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4 mb-3">
              <input
                type="number"
                value={selectedNearby.latitude || ""}
                onChange={(e) =>
                  setSelectedNearby({ ...selectedNearby, latitude: e.target.value })
                }
                className="w-full border border-stone-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Latitude"
              />

              <input
                type="number"
                value={selectedNearby.longitude}
                onChange={(e) =>
                  setSelectedNearby({ ...selectedNearby, longitude: e.target.value })
                }
                className="w-full border border-stone-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Longitude"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setIsEditNearbyOpen(false);
                  setSelectedNearby(null);
                }}
                className="px-6 py-2 border border-orange-500 text-orange-500 rounded-xl font-bold hover:bg-orange-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateNearby}
                className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}