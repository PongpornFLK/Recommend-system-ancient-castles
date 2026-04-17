"use client";
import React from "react";
import { Card, CardBody, Form, Input, Button } from "@heroui/react";
import { LockKeyhole, RotateCcwKey, ShieldCheck } from "lucide-react";
import { usePassword } from "@/app/service/setuser/usePassword";

export default function PasswordTab() {
  const [authProvider, setAuthProvider] = React.useState("local");

  React.useEffect(() => {
    setAuthProvider(localStorage.getItem("auth_provider") || "local");
  }, []);

  const {
    oldpwd, setOldPwd,
    newpwd, setNewPwd,
    confirmnewpwd, setConfirmNewPwd,
    handleChangePassword,
    handleLogoutAll,
  } = usePassword();

  return (
    <Card className="px-4 py-6 sm:px-8 sm:py-10 w-full min-h-[500px] shadow-sm bg-white">
      <CardBody>
        <div className="flex flex-col w-full max-w-4xl h-auto mx-auto border-none items-center">
          <div className="text-3xl sm:text-4xl text-center font-bold text-tone-oldgray mb-6 sm:mb-6">
            {authProvider === "google" ? "Authentication Settings" : "Change Password"}
          </div>

          <div className="flex flex-col items-center justify-center my-5 w-full">
            {authProvider !== "google" ? (
              <Form className="w-full max-w-xs sm:max-w-sm md:max-w-[400px] px-2" onSubmit={handleChangePassword}>
                <Input
                  isRequired
                  className="font-bold mb-4"
                  classNames={{ label: "text-md" }}
                  label="Old Password"
                  labelPlacement="outside"
                  placeholder="Type your old password"
                  type="password"
                  startContent={<LockKeyhole size={18} />}
                  variant="bordered"
                  value={oldpwd}
                  onChange={(e) => setOldPwd(e.target.value)}
                />
                <Input
                  isRequired
                  isInvalid={newpwd.length > 0 && newpwd.length < 6}
                  errorMessage={newpwd.length > 0 && newpwd.length < 6 ? "Password must be at least 6 characters" : ""}
                  className="font-bold mb-4"
                  classNames={{ label: "text-md" }}
                  label="New password"
                  labelPlacement="outside"
                  placeholder="Type your new password"
                  type="password"
                  startContent={<RotateCcwKey size={18} />}
                  variant="bordered"
                  value={newpwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                />
                <Input
                  isRequired
                  isInvalid={confirmnewpwd.length > 0 && confirmnewpwd !== newpwd}
                  errorMessage={confirmnewpwd.length > 0 && confirmnewpwd !== newpwd ? "Passwords do not match" : ""}
                  className="font-bold mb-6"
                  classNames={{ label: "text-md" }}
                  label="Confirm new password"
                  labelPlacement="outside"
                  placeholder="Confirm your new password"
                  type="password"
                  startContent={<ShieldCheck size={18} />}
                  variant="bordered"
                  value={confirmnewpwd}
                  onChange={(e) => setConfirmNewPwd(e.target.value)}
                />

                <div className="flex flex-col gap-4 sm:gap-6 justify-center w-full mt-4">
                  <Button
                    className="bg-tone-brown text-white w-full font-bold py-4 text-md shadow-md"
                    type="submit"
                  >
                    Change Password
                  </Button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-stone-200"></div>
                    <span className="flex-shrink mx-4 text-stone-400 text-xs uppercase tracking-widest font-bold">Security Options</span>
                    <div className="flex-grow border-t border-stone-200"></div>
                  </div>

                  <Button
                    className="bg-white text-[#3E2723] border-2 border-stone-200 hover:bg-stone-50 w-full font-extrabold py-4 text-sm"
                    variant="bordered"
                    onClick={handleLogoutAll}
                  >
                    Logout from all other devices
                  </Button>
                </div>
              </Form>
            ) : (
              <div className="w-full max-w-xs sm:max-w-sm md:max-w-[400px] px-2 flex flex-col gap-6">
                <Button
                  className="bg-white text-[#3E2723] border-2 border-stone-200 hover:bg-stone-50 w-full font-extrabold py-6 text-sm"
                  variant="bordered"
                  onClick={handleLogoutAll}
                  startContent={<ShieldCheck size={20} />}
                >
                  Logout from all other devices
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
