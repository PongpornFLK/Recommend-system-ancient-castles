import axios from "axios";

// ================== #ตั้งค่า API ==================
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  withCredentials: true,
});

// ================== #แนบ Token อัตโนมัติ ==================
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ================== #TYPE ปราสาท ==================
export type CastleType = {
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

// ================== #PAYLOAD เพิ่มปราสาท ==================
export type AddCastlePayload = {
  castle_name: string;
  castle_description?: string;
  era?: string;
  architecture_detail: string;
  type_id: number;
  province: string;
  district: string;
  sub_district: string;
  latitude: number;
  longitude: number;
};

// ================== #PAYLOAD แก้ไขปราสาท ==================
export type UpdateCastlePayload = AddCastlePayload;

// ================== #ดึง ID ปราสาท ==================
export const getCastleId = (castle: CastleType): number | undefined =>
  castle.castle_id ?? castle.id;

// ================== #โหลดปราสาททั้งหมด ==================
export const getCastles = async (): Promise<CastleType[]> => {
  const response = await api.get("/manage-castle/list");
  const data = response.data?.data || response.data || [];
  return Array.isArray(data) ? data : [];
};

// ================== #เพิ่มปราสาท ==================
export const addCastle = async (payload: AddCastlePayload) => {
  const response = await api.post("/manage-castle/add", payload);
  return response.data;
};

// ================== #แก้ไขปราสาท ==================
export const updateCastle = async (
  castleId: number,
  payload: UpdateCastlePayload
) => {
  const response = await api.put(`/manage-castle/update/${castleId}`, payload);
  return response.data;
};

// ================== #ลบปราสาท ==================
export const deleteCastle = async (castleId: number) => {
  const response = await api.delete(`/manage-castle/delete/${castleId}`);
  return response.data;
};

// ================== #อัปโหลด Image Vector ==================
export const uploadImageVector = async (castleId: number, file: File) => {
  const formData = new FormData();
  formData.append("castle_id", String(castleId));
  formData.append("file", file);

  const response = await api.post(
    "/manage-vector/upload-image-vector",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ================== #อัปโหลด Document Vector ==================
export const uploadDocumentVector = async (castleId: number, file: File) => {
  const formData = new FormData();
  formData.append("castle_id", String(castleId));
  formData.append("file", file);

  const response = await api.post(
    "/manage-doc-vector/upload-document-vector",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ================== #TYPE Nearby Place ==================
export type NearbyPlaceType = {
  nearplace_id?: number;
  id?: number;
  castle_id: number;
  castle_name?: string;
  place_name: string;
  nearby_detail?: string;
  latitude?: number | string;
  longitude?: number | string;
};

// ================== #PAYLOAD เพิ่ม Nearby Place ==================
export type AddNearbyPlacePayload = {
  castle_id: number;
  place_name: string;
  nearby_detail: string;
  latitude: number;
  longitude: number;
};

// ================== #PAYLOAD แก้ไข Nearby Place ==================
export type UpdateNearbyPlacePayload = {
  castle_id: number;
  place_name: string;
  nearby_detail: string;
  latitude: number;
  longitude: number;
};

// ================== #ดึง ID Nearby Place ==================
export const getNearbyPlaceId = (
  nearby: NearbyPlaceType
): number | undefined => nearby.nearplace_id ?? nearby.id;

// ================== #เพิ่ม Nearby Place ==================
export const addNearbyPlace = async (payload: AddNearbyPlacePayload) => {
  const response = await api.post("/manage-nearby-place/add", payload);
  return response.data;
};

// ================== #โหลด Nearby Place ทั้งหมด ==================
export const getNearbyPlaces = async (): Promise<NearbyPlaceType[]> => {
  const response = await api.get("/manage-nearby-place/list");
  const data = response.data?.data || response.data || [];
  return Array.isArray(data) ? data : [];
};

// ================== #ลบ Nearby Place ==================
export const deleteNearbyPlace = async (nearplaceId: number) => {
  const response = await api.delete(
    `/manage-nearby-place/delete/${nearplaceId}`
  );
  return response.data;
};

// ================== #แก้ไข Nearby Place ==================
export const updateNearbyPlace = async (
  nearplaceId: number,
  payload: UpdateNearbyPlacePayload
) => {
  const response = await api.put(
    `/manage-nearby-place/update/${nearplaceId}`,
    payload
  );
  return response.data;
};