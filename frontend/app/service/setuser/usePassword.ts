import { useState } from "react";
import api from "@/app/service/api";
import { addToast } from "@heroui/react";

export function usePassword() {
  // Local
  const [oldpwd, setOldPwd] = useState("");
  const [newpwd, setNewPwd] = useState("");
  const [confirmnewpwd, setConfirmNewPwd] = useState("");



  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
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

  const handleLogoutAll = async () => { // Logout all sessions
    try {
      await api.post("/users/logout-all");
      addToast({
        title: "All other sessions logged out!",
        description: "Your current session is still active, but all others are gone.",
        color: "success",
      });
    } catch (err) {
      console.log("Logout All Error:", err);
      addToast({
        title: "Logout All Failed",
        color: "danger",
      });
    }
  };

  return {
    oldpwd, setOldPwd,
    newpwd, setNewPwd,
    confirmnewpwd, setConfirmNewPwd,
    handleChangePassword,
    handleLogoutAll,
  };
}
