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
import axios from "axios";

type CastleType = {
  castle_id?: number;
  id?: number;
  castle_name: string;
  castle_description?: string;
  era?: string;
  architecture_detail?: string;
  type_id?: number | string;
  province?: string;
  district?: string;
  sub_district?: string;
  latitude?: number | string;
  longitude?: number | string;
};

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

  const menuButtons = [
    { id: 1, title: "Add New Castle", icon: PlusCircle, color: "bg-[#5D4037]" },
    { id: 2, title: "Add New Vector Data", icon: Database, color: "bg-[#8D6E63]" },
    { id: 3, title: "Add Nearby Places", icon: MapPinned, color: "bg-[#A1887F]" },
  ];

  const getCastleId = (castle: CastleType) => castle.castle_id ?? castle.id;

  const fetchCastles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get("http://127.0.0.1:8000/manage-castle/list", {
        headers,
      });

      const data = response.data?.data || response.data || [];
      setCastles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("โหลดข้อมูลปราสาทไม่สำเร็จ", error);
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
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [castles, searchTerm]);

  const handleDelete = async (castle: CastleType) => {
    const castleId = getCastleId(castle);
    if (!castleId || !window.confirm(`ต้องการลบ "${castle.castle_name}"?`)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/manage-castle/delete/${castleId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

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

      await axios.put(
        `http://127.0.0.1:8000/manage-castle/update/${castleId}`,
        payload,
        { headers }
      );

      alert("แก้ไขสำเร็จ");
      setIsEditOpen(false);
      setSelectedCastle(null);
      fetchCastles();
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
              {/* Image Vector */}
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

                        const formData = new FormData();
                        formData.append("castle_id", selectedVectorCastleId);
                        formData.append("file", selectedImageFile);

                        const res = await axios.post(
                          "http://127.0.0.1:8000/manage-vector/upload-image-vector",
                          formData,
                          {
                            headers: {
                              "Content-Type": "multipart/form-data",
                            },
                          }
                        );

                        alert(`${res.data.message}\nimg_id: ${res.data.img_id}`);
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

              {/* Document Vector */}
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

                        const formData = new FormData();
                        formData.append("castle_id", selectedDocCastleId);
                        formData.append("file", selectedDocFile);

                        const res = await axios.post(
                          "http://127.0.0.1:8000/manage-doc-vector/upload-document-vector",
                          formData,
                          {
                            headers: {
                              "Content-Type": "multipart/form-data",
                            },
                          }
                        );

                        alert(
                          `${res.data.message}\nChunks inserted: ${res.data.chunks_inserted}`
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
          <div className="bg-white p-12 rounded-[2rem] shadow-2xl text-center max-w-lg w-full relative">
            <button
              onClick={() => setActiveTab(null)}
              className="absolute top-4 right-4 text-gray-400"
            >
              <X />
            </button>
            <MapPinned size={48} className="mx-auto text-stone-300 mb-4" />
            <h2 className="text-xl font-bold text-stone-600">
              Nearby Places Coming Soon
            </h2>
          </div>
        </div>
      )}

      {isEditOpen && selectedCastle && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Edit Castle</h2>

            <textarea
              value={selectedCastle.castle_name}
              onChange={(e) =>
                setSelectedCastle({ ...selectedCastle, castle_name: e.target.value })
              }
              className="w-full border p-2 mb-2"
            />

            <textarea
              value={selectedCastle.era || ""}
              onChange={(e) =>
                setSelectedCastle({ ...selectedCastle, era: e.target.value })
              }
              className="w-full border p-2 mb-2"
            />

            <textarea
              value={selectedCastle.architecture_detail || ""}
              onChange={(e) =>
                setSelectedCastle({
                  ...selectedCastle,
                  architecture_detail: e.target.value,
                })
              }
              className="w-full border p-2 mb-2"
            />

            <textarea
              value={selectedCastle.province || ""}
              onChange={(e) =>
                setSelectedCastle({ ...selectedCastle, province: e.target.value })
              }
              className="w-full border p-2 mb-2"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedCastle(null);
                }}
                className="px-4 py-2 border"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-orange-600 text-white"
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