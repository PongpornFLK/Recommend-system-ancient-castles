import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/app/config";
import { addToast } from "@heroui/react";

export function usePassword() {
  const [oldpwd, setOldPwd] = useState("");
  const [newpwd, setNewPwd] = useState("");
  const [confirmnewpwd, setConfirmNewPwd] = useState("");
  const [authProvider, setAuthProvider] = useState<string>("local");

  useEffect(() => {
    const provider = localStorage.getItem("auth_provider");
    if (provider) {
      setAuthProvider(provider);
    }
  }, []);

  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = localStorage.getItem("token");

    if (!newpwd || !confirmnewpwd) {
      addToast({
        title: "Please input all required fields",
        color: "danger",
      });
      return;
    }

    if (newpwd !== confirmnewpwd) {
      addToast({
        title: "New passwords do not match",
        color: "danger",
      });
      return;
    }

    try {
      if (authProvider === "google") {
        // ใช้การสร้าง set password ใหม่
        await axios.post(
          `${API_URL}/users/set_google_pwd`,
          {
            new_pass: newpwd,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        if (!oldpwd) {
          addToast({
            title: "Old password is required",
            color: "danger",
          });
          return;
        }

        await axios.post(
          `${API_URL}/users/changepwd`,
          {
            old_pass: oldpwd,
            new_pass: newpwd,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setOldPwd("");
      setConfirmNewPwd("");
      setNewPwd("");

      addToast({
        title: "Password updated successfully!",
        color: "success",
      });
    } catch (err: any) {
      console.log("Password Update Error:", err);
      addToast({
        title: "Update Failed",
        description: err?.response?.data?.detail || "Please try again.",
        color: "danger",
      });
    }
  };

  return {
    oldpwd,
    setOldPwd,
    newpwd,
    setNewPwd,
    confirmnewpwd,
    setConfirmNewPwd,
    authProvider,
    handleChangePassword,
  };
}
