"use client";
import React, { useState } from "react";
import { Search, MapPin, X } from "lucide-react";
import { addCastle } from "@/app/service/castle/managecastle";

type FormDataType = {
  castle_name: string;
  era: string;
  architecture_detail: string;
  type_id: string;
  province: string;
  latitude: string;
  longitude: string;
  district: string;
  sub_district: string;
  castle_description: string;
};

const InputField = ({
  label,
  name,
  icon: Icon,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  name: keyof FormDataType;
  icon: React.ElementType;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex flex-col gap-1 w-full">
    <label htmlFor={name} className="text-sm font-bold text-gray-700">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Icon size={18} className="text-gray-400" />
      </div>
      <input
        id={name}
        type={type}
        name={name}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-700 bg-white"
        placeholder={placeholder || "Typing"}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

const TextAreaField = ({
  label,
  name,
  icon: Icon,
  placeholder,
  rows = 3,
  value,
  onChange,
}: {
  label: string;
  name: keyof FormDataType;
  icon: React.ElementType;
  placeholder?: string;
  rows?: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => (
  <div className="flex flex-col gap-1 w-full">
    <label htmlFor={name} className="text-sm font-bold text-gray-700">
      {label}
    </label>
    <div className="relative">
      <div className="absolute top-3 left-3 pointer-events-none">
        <Icon size={18} className="text-gray-400" />
      </div>
      <textarea
        id={name}
        name={name}
        rows={rows}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-700 bg-white resize-none"
        placeholder={placeholder || "Typing"}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

export default function AddCastleForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState<FormDataType>({
    castle_name: "",
    era: "",
    architecture_detail: "",
    type_id: "",
    province: "",
    latitude: "",
    longitude: "",
    district: "",
    sub_district: "",
    castle_description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConfirm = async () => {
    const typeId = parseInt(formData.type_id);
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(typeId) || isNaN(lat) || isNaN(lng)) {
      alert("ช่อง Type ต้องเป็นตัวเลข ID และ Latitude/Longitude ต้องเป็นตัวเลข");
      return;
    }

    try {
      const payload = {
        ...formData,
        type_id: typeId,
        latitude: lat,
        longitude: lng,
      };

      const response = await addCastle(payload);

      if (response.status === "success") {
        alert("เพิ่มข้อมูลสำเร็จ!");
        onClose();
        window.location.reload();
      }
    } catch (error: any) {
      alert("เกิดข้อผิดพลาด: " + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl max-w-3xl w-full border border-gray-100 relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#3E2723]">Add New Castle</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <TextAreaField
            label="Castle name"
            name="castle_name"
            icon={Search}
            placeholder="ปราสาทหินพิมาย"
            rows={2}
            value={formData.castle_name}
            onChange={handleChange}
          />
          <TextAreaField
            label="Castle era"
            name="era"
            icon={Search}
            placeholder="อาณาจักรขอม"
            rows={2}
            value={formData.era}
            onChange={handleChange}
          />
          <TextAreaField
            label="Architecture"
            name="architecture_detail"
            icon={Search}
            placeholder="รายละเอียดสถาปัตยกรรม"
            rows={2}
            value={formData.architecture_detail}
            onChange={handleChange}
          />
          <InputField
            label="Type (ID)"
            name="type_id"
            icon={Search}
            placeholder="1"
            type="number"
            value={formData.type_id}
            onChange={handleChange}
          />
          <TextAreaField
            label="Province"
            name="province"
            icon={MapPin}
            placeholder="นครราชสีมา"
            rows={2}
            value={formData.province}
            onChange={handleChange}
          />
          <InputField
            label="Latitude"
            name="latitude"
            icon={MapPin}
            placeholder="14.9685"
            type="number"
            value={formData.latitude}
            onChange={handleChange}
          />
          <TextAreaField
            label="District"
            name="district"
            icon={MapPin}
            placeholder="พิมาย"
            rows={2}
            value={formData.district}
            onChange={handleChange}
          />
          <InputField
            label="Longitude"
            name="longitude"
            icon={MapPin}
            placeholder="102.4949"
            type="number"
            value={formData.longitude}
            onChange={handleChange}
          />
          <div className="md:col-span-2">
            <TextAreaField
              label="Sub district"
              name="sub_district"
              icon={MapPin}
              placeholder="ในเมือง"
              rows={2}
              value={formData.sub_district}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 mb-6">
          <label
            htmlFor="castle_description"
            className="text-sm font-bold text-gray-700"
          >
            Description
          </label>
          <textarea
            id="castle_description"
            name="castle_description"
            className="w-full p-4 border border-gray-300 rounded-2xl h-32 focus:ring-2 focus:ring-orange-500 outline-none text-gray-700 text-sm leading-relaxed"
            value={formData.castle_description}
            onChange={handleChange}
            placeholder="รายละเอียดโบราณสถาน..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2 border border-orange-500 text-orange-500 rounded-xl font-bold hover:bg-orange-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-8 py-2 bg-[#D2691E] text-white rounded-xl font-bold hover:bg-orange-700 shadow-lg transition-all active:scale-95"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}