import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/app/config";
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

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) return;

    try {
      const response = await axios.get(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
      setUsername(response.data.username || "");
      setEmail(response.data.email || "");
      setTel(response.data.tel || "");
    } catch (err) {
      console.log("Fetching error : ", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `${API_URL}/users/${userId}`,
        {
          username: username,
          email: email,
          tel: tel,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
