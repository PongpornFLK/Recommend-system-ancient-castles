import { useState, useEffect } from "react";
import api from "@/app/service/api";
import { addToast } from "@heroui/react";

export interface UserData {
  user_id: string;
  username: string;
  email: string;
  tel: string;
}

export function useProfile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("user_id");

      if (!userId) return;

      try {
        const response = await api.get(`/users/${userId}`);
        setUser(response.data);
        setUsername(response.data.username || "");
        setEmail(response.data.email || "");
        setTel(response.data.tel || "");
      } catch (err) {
        console.log("Fetching error : ", err);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userId = localStorage.getItem("user_id");

    try {
      const response = await api.put(`/users/${userId}`, {
        username: username,
        email: email,
        tel: tel,
      });

      setUser(response.data);
      setIsEdit(false);

      addToast({
        title: "Update Success",
        color: "success",
      });
    } catch (err) {
      console.log("Can't Save data", err);
      addToast({
        title: "Update Failed",
        description: "Please try again.",
        color: "danger",
      });
    }
  };

  const handleStartEdit = () => {
    setUsername(user?.username || "");
    setEmail(user?.email || "");
    setTel(user?.tel || "");
    setIsEdit(true);
  };

  const handleCancelEdit = () => {
    setIsEdit(false);
  };

  return {
    user,
    isEdit,
    username,
    setUsername,
    email,
    setEmail,
    tel,
    setTel,
    handleSaveProfile,
    handleStartEdit,
    handleCancelEdit,
  };
}
