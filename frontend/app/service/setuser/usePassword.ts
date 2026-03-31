import { useState } from "react";
import api from "@/app/service/api";
import { addToast } from "@heroui/react";

export function usePassword() {
  const [oldpwd, setOldPwd] = useState("");
  const [newpwd, setNewPwd] = useState("");
  const [confirmnewpwd, setConfirmNewPwd] = useState("");
  const [authProvider] = useState<string>(() => {
    const provider = localStorage.getItem("auth_provider");
    return provider || "local";
  });

  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

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
        await api.post("/users/set_google_pwd", {
          new_pass: newpwd,
        });
      } else {
        if (!oldpwd) {
          addToast({
            title: "Old password is required",
            color: "danger",
          });
          return;
        }

        await api.post("/users/changepwd", {
          old_pass: oldpwd,
          new_pass: newpwd,
        });
      }

      setOldPwd("");
      setConfirmNewPwd("");
      setNewPwd("");

      addToast({
        title: "Password updated successfully!",
        color: "success",
      });
    } catch (err) {
      console.log("Password Update Error:", err);
      addToast({
        title: "Update Failed",
        description: "Please try again.",
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
