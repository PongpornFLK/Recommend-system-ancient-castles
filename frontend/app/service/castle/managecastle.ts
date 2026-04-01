import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  withCredentials: true,
});

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

export type UpdateCastlePayload = AddCastlePayload;

export const getCastleId = (castle: CastleType): number | undefined =>
  castle.castle_id ?? castle.id;

export const getCastles = async (): Promise<CastleType[]> => {
  const response = await api.get("/manage-castle/list");
  const data = response.data?.data || response.data || [];
  return Array.isArray(data) ? data : [];
};

export const addCastle = async (payload: AddCastlePayload) => {
  const response = await api.post("/manage-castle/add", payload);
  return response.data;
};

export const updateCastle = async (
  castleId: number,
  payload: UpdateCastlePayload
) => {
  const response = await api.put(`/manage-castle/update/${castleId}`, payload);
  return response.data;
};

export const deleteCastle = async (castleId: number) => {
  const response = await api.delete(`/manage-castle/delete/${castleId}`);
  return response.data;
};

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
export type AddNearbyPlacePayload = {
  castle_id: number;
  place_name: string;
  nearby_detail: string;
  latitude: number;
  longitude: number;
};

export const addNearbyPlace = async (payload: AddNearbyPlacePayload) => {
  const response = await api.post("/manage-nearby-place/add", payload);
  return response.data;
};