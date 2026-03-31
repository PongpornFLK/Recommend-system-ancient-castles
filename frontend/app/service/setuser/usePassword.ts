import { useState } from "react";
import api from "@/app/service/api";
import { addToast } from "@heroui/react";

export function usePassword() {
  // Local
  const [oldpwd, setOldPwd] = useState("");
  const [newpwd, setNewPwd] = useState("");
  const [confirmnewpwd, setConfirmNewPwd] = useState("");

  // Google
  const [googleNewPwd, setGoogleNewPwd] = useState("");
  const [confirmGoogleNewPwd, setConfirmGoogleNewPwd] = useState("");

  const [authProvider] = useState<string>(() => {
    const provider = localStorage.getItem("auth_provider");
    return provider || "local";
  });

  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      if (authProvider === "google") {
        // ฝั่ง Google
        if (!googleNewPwd || !confirmGoogleNewPwd) {
          addToast({ title: "Please input all fields", color: "danger" });
          return;
        }
        if (googleNewPwd !== confirmGoogleNewPwd) {
          addToast({ title: "Passwords do not match", color: "danger" });
          return;
        }

        await api.post("/users/set_google_pwd", {
          new_pass: googleNewPwd,
        });

        setGoogleNewPwd("");
        setConfirmGoogleNewPwd("");
      } else {
        // Local
        if (!oldpwd || !newpwd || !confirmnewpwd) {
          addToast({ title: "Please input all fields", color: "danger" });
          return;
        }
        if (newpwd !== confirmnewpwd) {
          addToast({ title: "New passwords do not match", color: "danger" });
          return;
        }

        await api.post("/users/changepwd", {
          old_pass: oldpwd,
          new_pass: newpwd,
        });

        setOldPwd("");
        setNewPwd("");
        setConfirmNewPwd("");
      }

      addToast({
        title: "Password updated successfully!",
        color: "success",
      });
    } catch (err) {
      console.log("Password Update Error:", err);
      addToast({
        title: "Update Failed",
        description: "Error occurred",
        color: "danger",
      });
    }
  };

  return {
    oldpwd, setOldPwd,
    newpwd, setNewPwd,
    confirmnewpwd, setConfirmNewPwd,
    googleNewPwd, setGoogleNewPwd,
    confirmGoogleNewPwd, setConfirmGoogleNewPwd,
    authProvider,
    handleChangePassword,
  };
}
