"use client";
import { Card, CardBody, Form, Input, Button } from "@heroui/react";
import { LockKeyhole, RotateCcwKey, ShieldCheck } from "lucide-react";
import { usePassword } from "@/app/service/setuser/usePassword";

export default function PasswordTab() {
  const {
    oldpwd,
    setOldPwd,
    newpwd,
    setNewPwd,
    confirmnewpwd,
    setConfirmNewPwd,
    authProvider,
    handleChangePassword,
  } = usePassword();

  return (
    <Card className="px-4 py-6 sm:px-8 sm:py-10 w-full min-h-[500px] shadow-sm bg-white">
      <CardBody>
        <div className="flex flex-col w-full max-w-4xl h-auto mx-auto border-none items-center">
          <div className="text-3xl sm:text-4xl text-center font-bold text-tone-oldgray mb-6 sm:mb-6">
            {authProvider === "google"
              ? "Set Account Password"
              : "Change Password"}
          </div>

          <div className="flex flex-col items-center justify-center my-5 w-full">
            <Form className="w-full max-w-xs sm:max-w-sm md:max-w-[400px] px-2" onSubmit={handleChangePassword}>
              {authProvider !== "google" && (
                <Input
                  isRequired
                  errorMessage="Please enter your old password"
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
              )}
              <Input
                isRequired
                errorMessage="Please enter your new password"
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
                errorMessage="Please confirm your new password"
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
            </Form>
          </div>

          <div className="flex flex-col gap-4 sm:gap-6 justify-center w-full max-w-xs sm:max-w-sm md:max-w-[400px] mx-auto px-2 mt-4">
            <Button
              className={`${authProvider === "google" ? "bg-tone-brown" : "bg-tone-brown"
                } text-white w-full font-bold py-4 text-md`}
              onPress={() => handleChangePassword()}
              type="submit"
            >
              {authProvider === "google" ? "Link Account Password" : "Change Password"}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
