"use client";

import React, { useState } from "react";
import { Search, MapPin, ImagePlus } from "lucide-react";
import {
  addCastle,
  uploadCastleImages,
} from "@/app/service/admin/managecastle/castleService";
import {
  addToast,
  Form,
  Input,
  Textarea,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";

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

  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 3) {
      addToast({
        title: "เพิ่มได้สูงสุด 3 รูปต่อ 1 สถานที่",
        color: "warning",
      });
      return;
    }

    setImageFiles(files);
    setImageDescriptions(files.map((f) => f.name));
    setCoverIndex(0);
  };

  const handleImageDescriptionChange = (index: number, value: string) => {
    setImageDescriptions((prev) =>
      prev.map((item, i) => (i === index ? value : item))
    );
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    const typeId = parseInt(formData.type_id);
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(typeId) || isNaN(lat) || isNaN(lng)) {
      addToast({
        title: "ช่อง Type ต้องเป็นตัวเลข ID และ Latitude/Longitude ต้องเป็นตัวเลข",
        color: "danger",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        type_id: typeId,
        latitude: lat,
        longitude: lng,
      };
      if (imageFiles.length > 3) {
        addToast({
          title: "เพิ่มได้สูงสุด 3 รูปต่อ 1 สถานที่",
          color: "warning",
        });
        return;
      }
      const response = await addCastle(payload);

      if (response.status === "success" || response.castle_id) {
        const newCastleId = response.castle_id;

        if (newCastleId && imageFiles.length > 0) {
          await uploadCastleImages(
            newCastleId,
            imageFiles,
            imageDescriptions,
            coverIndex
          );
        }

        addToast({ title: "เพิ่มข้อมูลสำเร็จ!", color: "success" });
        onClose();
        window.location.reload();
      }
    } catch (err) {
      console.error("Not Success", err);
      addToast({ title: "เพิ่มข้อมูลไม่สำเร็จ", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onOpenChange={(open) => !open && onClose()}
      size="4xl"
      backdrop="blur"
      classNames={{
        base: "w-full max-w-[900px] rounded-[2.5rem]",
        wrapper: "flex items-center justify-center px-2",
      }}
    >
      <ModalContent className="w-full h-[90vh] overflow-hidden rounded-[2.5rem]">
        {() => (
          <Form
            onSubmit={handleConfirm}
            className="flex h-full w-full min-w-0 flex-col"
          >
            <ModalHeader className="shrink-0 w-full px-6 pt-6 pb-2 text-2xl font-bold text-[#3E2723]">
              Add New Castle
            </ModalHeader>

            <ModalBody className="flex-1 w-full min-w-0 overflow-y-auto px-6 py-4">
              <div className="grid w-full min-w-0 grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                <div className="flex w-full min-w-0 flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">
                    Castle name <span className="text-danger">*</span>
                  </label>
                  <Input
                    name="castle_name"
                    placeholder="ปราสาทหินพิมาย"
                    startContent={
                      <Search size={18} className="text-gray-400 mr-2" />
                    }
                    variant="bordered"
                    value={formData.castle_name}
                    onChange={handleChange}
                    isRequired
                    classNames={{
                      base: "w-full",
                      inputWrapper: "h-14 rounded-2xl",
                    }}
                  />
                </div>

                <div className="flex w-full min-w-0 flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">
                    Castle era <span className="text-danger">*</span>
                  </label>
                  <Input
                    name="era"
                    placeholder="อาณาจักรขอม"
                    startContent={
                      <Search size={18} className="text-gray-400 mr-2" />
                    }
                    variant="bordered"
                    value={formData.era}
                    onChange={handleChange}
                    isRequired
                    classNames={{
                      base: "w-full",
                      inputWrapper: "h-14 rounded-2xl",
                    }}
                  />
                </div>

                <div className="flex w-full min-w-0 flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">
                    Architecture
                  </label>
                  <Input
                    name="architecture_detail"
                    placeholder="รายละเอียดสถาปัตยกรรม"
                    startContent={
                      <Search size={18} className="text-gray-400 mr-2" />
                    }
                    variant="bordered"
                    value={formData.architecture_detail}
                    onChange={handleChange}
                    classNames={{
                      base: "w-full",
                      inputWrapper: "h-14 rounded-2xl",
                    }}
                  />
                </div>

                <div className="flex w-full min-w-0 flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">
                    Type (ID) <span className="text-danger">*</span>
                  </label>
                  <Input
                    name="type_id"
                    type="number"
                    placeholder="1"
                    startContent={
                      <Search size={18} className="text-gray-400 mr-2" />
                    }
                    variant="bordered"
                    value={formData.type_id}
                    onChange={handleChange}
                    isRequired
                    classNames={{
                      base: "w-full",
                      inputWrapper: "h-14 rounded-2xl",
                    }}
                  />
                </div>

                <div className="flex w-full min-w-0 flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">
                    Province <span className="text-danger">*</span>
                  </label>
                  <Input
                    name="province"
                    placeholder="นครราชสีมา"
                    startContent={
                      <MapPin size={18} className="text-gray-400 mr-2" />
                    }
                    variant="bordered"
                    value={formData.province}
                    onChange={handleChange}
                    isRequired
                    classNames={{
                      base: "w-full",
                      inputWrapper: "h-14 rounded-2xl",
                    }}
                  />
                </div>

                <div className="flex w-full min-w-0 flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">
                    Latitude <span className="text-danger">*</span>
                  </label>
                  <Input
                    name="latitude"
                    type="number"
                    step="any"
                    placeholder="14.9685"
                    startContent={
                      <MapPin size={18} className="text-gray-400 mr-2" />
                    }
                    variant="bordered"
                    value={formData.latitude}
                    onChange={handleChange}
                    isRequired
                    classNames={{
                      base: "w-full",
                      inputWrapper: "h-14 rounded-2xl",
                    }}
                  />
                </div>

                <div className="flex w-full min-w-0 flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">
                    District <span className="text-danger">*</span>
                  </label>
                  <Input
                    name="district"
                    placeholder="พิมาย"
                    startContent={
                      <MapPin size={18} className="text-gray-400 mr-2" />
                    }
                    variant="bordered"
                    value={formData.district}
                    onChange={handleChange}
                    isRequired
                    classNames={{
                      base: "w-full",
                      inputWrapper: "h-14 rounded-2xl",
                    }}
                  />
                </div>

                <div className="flex w-full min-w-0 flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">
                    Longitude <span className="text-danger">*</span>
                  </label>
                  <Input
                    name="longitude"
                    type="number"
                    step="any"
                    placeholder="102.4949"
                    startContent={
                      <MapPin size={18} className="text-gray-400 mr-2" />
                    }
                    variant="bordered"
                    value={formData.longitude}
                    onChange={handleChange}
                    isRequired
                    classNames={{
                      base: "w-full",
                      inputWrapper: "h-14 rounded-2xl",
                    }}
                  />
                </div>

                <div className="md:col-span-2 flex w-full min-w-0 flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">
                    Sub district <span className="text-danger">*</span>
                  </label>
                  <Input
                    name="sub_district"
                    placeholder="ในเมือง"
                    startContent={
                      <MapPin size={18} className="text-gray-400 mr-2" />
                    }
                    variant="bordered"
                    value={formData.sub_district}
                    onChange={handleChange}
                    isRequired
                    classNames={{
                      base: "w-full",
                      inputWrapper: "h-14 rounded-2xl",
                    }}
                  />
                </div>
              </div>

              <div className="w-full min-w-0 flex flex-col gap-1 mb-4">
                <label className="text-sm font-bold text-gray-700">
                  Description
                </label>
                <Textarea
                  name="castle_description"
                  placeholder="รายละเอียดโบราณสถาน..."
                  variant="bordered"
                  minRows={4}
                  value={formData.castle_description}
                  onChange={handleChange}
                  classNames={{
                    base: "w-full",
                    inputWrapper: "rounded-2xl",
                  }}
                />
              </div>

              <div className="w-full min-w-0 flex flex-col gap-3 rounded-2xl border border-stone-200 p-4 bg-stone-50">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <ImagePlus size={18} />
                  รูปภาพปราสาท
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="block w-full text-sm"
                />

                {imageFiles.length > 0 && (
                  <div className="space-y-3">
                    {imageFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="rounded-xl border border-stone-200 bg-white p-3"
                      >
                        <div className="text-sm font-semibold text-stone-700 mb-2 break-all">
                          {file.name}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
                          <Input
                            variant="bordered"
                            placeholder="คำอธิบายรูป"
                            value={imageDescriptions[index] || ""}
                            onChange={(e) =>
                              handleImageDescriptionChange(index, e.target.value)
                            }
                            classNames={{
                              base: "w-full",
                              inputWrapper: "h-12 rounded-2xl",
                            }}
                          />

                          <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
                            <input
                              type="radio"
                              name="cover-image"
                              checked={coverIndex === index}
                              onChange={() => setCoverIndex(index)}
                            />
                            ตั้งเป็นรูปปก
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter className="shrink-0 w-full border-t border-stone-200 px-6 py-4 flex justify-end gap-3 bg-white">
              <Button
                type="button"
                variant="bordered"
                onClick={onClose}
                className="px-8 font-bold border-red-500 text-red-500 hover:bg-red-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={loading}
                className="px-8 bg-green-600 text-white font-bold hover:bg-green-700"
              >
                Confirm
              </Button>
            </ModalFooter>
          </Form>
        )}
      </ModalContent>
    </Modal>
  );
}