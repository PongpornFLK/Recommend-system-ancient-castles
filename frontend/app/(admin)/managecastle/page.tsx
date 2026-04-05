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
} from "@/app/service/admin/managecastle/castleService";

export default function ManageCastle() {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [castles, setCastles] = useState<CastleType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCastle, setSelectedCastle] = useState<CastleType | null>(null);

  const [selectedVectorCastleId, setSelectedVectorCastleId] = useState<string>("");
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
  // ================== #STATE NEARBY ==================
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlaceType[]>([]);
  const [nearbyTableLoading, setNearbyTableLoading] = useState(false);
  // ================== #STATE EDIT NEARBY ==================
  const [isEditNearbyOpen, setIsEditNearbyOpen] = useState(false);
  const [selectedNearby, setSelectedNearby] = useState<NearbyPlaceType | null>(null);

  // ปรับเหลือแค่ 2 ปุ่มหลัก
  const menuButtons = [
    { id: 1, title: "Add New Castle", icon: PlusCircle, color: "bg-[#5D4037]" },
    { id: 2, title: "Add New Vector Data", icon: Database, color: "bg-[#8D6E63]" },
  ];

  // ================== #เปิด EDIT Nearby ==================
  const openEditNearby = (item: NearbyPlaceType) => {
    setSelectedNearby(item);
    setIsEditNearbyOpen(true);
  };
  // ================== #โหลด Nearby Places ==================
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
  const resetNearbyModal = () => {
    setNearbyCastleId("");
    setNearbyPlaceName("");
    setNearbyDetail("");
    setNearbyLatitude("");
    setNearbyLongitude("");
  };

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

  useEffect(() => {
    fetchCastles();
    fetchNearbyPlaces();
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
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [castles, searchTerm]);

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
  // ================== #ลบ Nearby Place ==================
  const handleDeleteNearbyPlace = async (item: NearbyPlaceType) => {
    if (!window.confirm(`ต้องการลบ "${item.place_name}"?`)) return;

    try {
      await deleteNearbyPlace(item.nearplace_id);
      fetchNearbyPlaces(); // reload ตาราง
    } catch (error: any) {
      alert(
        "ลบไม่สำเร็จ: " +
        (error.response?.data?.detail || error.message)
      );
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
  // ================== #UPDATE Nearby ==================
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
          Manage Castle System
        </h1>

        {/* ================== #TABLE ปราสาท ================== */}
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

        {/* ================== #TABLE Nearby Places ================== */}
        <div className="bg-white rounded-[2rem] shadow-lg border border-stone-200 p-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-[#3E2723]">
              Nearby Places Table
            </h2>
            {/* ย้ายปุ่ม Add Nearby Place มาไว้ตรงนี้ */}
            <button
              onClick={() => setActiveTab(3)}
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-white text-sm font-bold transition-all transform hover:scale-[1.03] shadow-md bg-[#A1887F]"
            >
              <MapPinned size={18} />
              <span>Add Nearby Places</span>
            </button>
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
                ) : nearbyPlaces.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-stone-400">
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                ) : (
                  nearbyPlaces.map((item) => (
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
                      <td className="px-4 py-3 text-left max-w-xs truncate">
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

      {/* ================== #MODALS ================== */}
      
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
              {/* Image Vector Section */}
              <div className="border border-stone-200 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-[#3E2723] mb-4">Upload Image Vector</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Select Castle</label>
                    <select
                      value={selectedVectorCastleId}
                      onChange={(e) => setSelectedVectorCastleId(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="">-- เลือกปราสาท --</option>
                      {castles.map((castle) => (
                        <option key={getCastleId(castle)} value={String(getCastleId(castle))}>
                          {getCastleId(castle)} - {castle.castle_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Upload Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedImageFile(e.target.files?.[0] || null)}
                      className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!selectedVectorCastleId || !selectedImageFile) return alert("กรุณากรอกข้อมูลให้ครบ");
                      try {
                        setVectorLoading(true);
                        const res = await uploadImageVector(Number(selectedVectorCastleId), selectedImageFile);
                        alert(`${res.message}\nimg_id: ${res.img_id}`);
                        resetVectorModal();
                      } catch (error: any) {
                        alert("เพิ่ม image vector ไม่สำเร็จ: " + (error.response?.data?.detail || error.message));
                      } finally { setVectorLoading(false); }
                    }}
                    disabled={vectorLoading}
                    className="w-full px-4 py-3 rounded-xl bg-[#5D4037] text-white font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    {vectorLoading ? "กำลังเพิ่มข้อมูล..." : "Upload and Convert Image"}
                  </button>
                </div>
              </div>

              {/* Doc Vector Section */}
              <div className="border border-stone-200 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-[#3E2723] mb-4">Upload Document Vector</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Select Castle</label>
                    <select
                      value={selectedDocCastleId}
                      onChange={(e) => setSelectedDocCastleId(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="">-- เลือกปราสาท --</option>
                      {castles.map((castle) => (
                        <option key={getCastleId(castle)} value={String(getCastleId(castle))}>
                          {getCastleId(castle)} - {castle.castle_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Upload File (.pdf, .txt)</label>
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={(e) => setSelectedDocFile(e.target.files?.[0] || null)}
                      className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!selectedDocCastleId || !selectedDocFile) return alert("กรุณากรอกข้อมูลให้ครบ");
                      try {
                        setDocLoading(true);
                        const res = await uploadDocumentVector(Number(selectedDocCastleId), selectedDocFile);
                        alert(`${res.message || "เพิ่มสำเร็จ"}\nChunks: ${res.chunks_inserted ?? 0}`);
                        resetVectorModal();
                      } catch (error: any) {
                        alert("เพิ่ม document vector ไม่สำเร็จ: " + (error.response?.data?.detail || error.message));
                      } finally { setDocLoading(false); }
                    }}
                    disabled={docLoading}
                    className="w-full px-4 py-3 rounded-xl bg-[#8D6E63] text-white font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    {docLoading ? "กำลังเพิ่มข้อมูล..." : "Upload and Convert Document"}
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
              onClick={() => { setActiveTab(null); resetNearbyModal(); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
            <MapPinned size={48} className="mx-auto text-stone-300 mb-4" />
            <h2 className="text-xl font-bold text-stone-700 text-center mb-6">Add Nearby Place</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Select Castle</label>
                <select
                  value={nearbyCastleId}
                  onChange={(e) => setNearbyCastleId(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">-- เลือกปราสาท --</option>
                  {castles.map((castle) => (
                    <option key={getCastleId(castle)} value={String(getCastleId(castle))}>
                      {getCastleId(castle)} - {castle.castle_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Place Name</label>
                <input
                  type="text"
                  value={nearbyPlaceName}
                  onChange={(e) => setNearbyPlaceName(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Nearby Detail</label>
                <textarea
                  value={nearbyDetail}
                  onChange={(e) => setNearbyDetail(e.target.value)}
                  rows={4}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number" step="any" placeholder="Latitude"
                  value={nearbyLatitude} onChange={(e) => setNearbyLatitude(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none"
                />
                <input
                  type="number" step="any" placeholder="Longitude"
                  value={nearbyLongitude} onChange={(e) => setNearbyLongitude(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 outline-none"
                />
              </div>
              <button
                onClick={async () => {
                  try {
                    setNearbyLoading(true);
                    await addNearbyPlace({
                      castle_id: Number(nearbyCastleId),
                      place_name: nearbyPlaceName,
                      nearby_detail: nearbyDetail,
                      latitude: Number(nearbyLatitude),
                      longitude: Number(nearbyLongitude),
                    });
                    alert("เพิ่มสำเร็จ");
                    resetNearbyModal(); setActiveTab(null); fetchNearbyPlaces();
                  } catch (error: any) { alert("ล้มเหลว"); } finally { setNearbyLoading(false); }
                }}
                disabled={nearbyLoading}
                className="w-full px-4 py-3 rounded-xl bg-[#A1887F] text-white font-bold hover:opacity-90"
              >
                {nearbyLoading ? "กำลังเพิ่มข้อมูล..." : "Add Nearby Place"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Castle Modal */}
      {isEditOpen && selectedCastle && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-[2rem] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#3E2723] mb-6">Edit Castle</h2>
            {/* Form Fields ... (Same as your original code) */}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsEditOpen(false)} className="px-6 py-2 border rounded-xl">Cancel</button>
              <button onClick={handleUpdate} className="px-6 py-2 bg-orange-600 text-white rounded-xl">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Nearby Modal */}
      {isEditNearbyOpen && selectedNearby && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-[#3E2723]">Edit Nearby Place</h2>
            <div className="space-y-4">
              <input
                value={selectedNearby.place_name || ""}
                onChange={(e) => setSelectedNearby({ ...selectedNearby, place_name: e.target.value })}
                className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-400"
              />
              <textarea
                value={selectedNearby.nearby_detail || ""}
                onChange={(e) => setSelectedNearby({ ...selectedNearby, nearby_detail: e.target.value })}
                className="w-full border rounded-xl p-3 h-32 resize-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number" value={selectedNearby.latitude}
                  onChange={(e) => setSelectedNearby({ ...selectedNearby, latitude: Number(e.target.value) })}
                  className="w-full border rounded-xl p-3"
                />
                <input
                  type="number" value={selectedNearby.longitude}
                  onChange={(e) => setSelectedNearby({ ...selectedNearby, longitude: Number(e.target.value) })}
                  className="w-full border rounded-xl p-3"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => { setIsEditNearbyOpen(false); setSelectedNearby(null); }}
                  className="px-6 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateNearby}
                  className="px-6 py-2 bg-[#A1887F] text-white rounded-xl"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}