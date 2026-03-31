"use client";
import { Card, CardBody, Form, Input, Button } from "@heroui/react";
import { User, AtSign, Phone, SquarePen } from "lucide-react";
import { useProfile } from "@/app/service/setuser/useProfile";

export default function ProfileTab() {
  const {
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
  } = useProfile();

  return (
    <Card className="px-4 py-6 sm:px-8 sm:py-10 w-full min-h-[500px] shadow-sm bg-white">
      <CardBody>
        <div className="flex flex-col w-full max-w-4xl h-auto mx-auto border-none items-center">
          <div className="text-3xl sm:text-4xl text-center font-bold text-tone-oldgray mb-6 sm:mb-6">
            Profile
          </div>

          <div className="flex flex-col items-center justify-center my-5 w-full">
            {isEdit ? (
              <Form
                className="w-full max-w-xs sm:max-w-sm md:max-w-[400px] px-2"
                onSubmit={handleSaveProfile}
              >
                <Input
                  isRequired
                  errorMessage="Please enter your username"
                  className="font-bold mb-4"
                  classNames={{ label: "text-md" }}
                  label="Username"
                  labelPlacement="outside"
                  placeholder="Type your username"
                  type="text"
                  startContent={<User size={18} />}
                  variant="bordered"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                  isRequired
                  errorMessage="Please enter your email"
                  className="font-bold mb-4"
                  classNames={{ label: "text-md" }}
                  label="Email"
                  labelPlacement="outside"
                  placeholder="Type your email"
                  type="text"
                  startContent={<AtSign size={18} />}
                  variant="bordered"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  isRequired
                  isInvalid={isEdit && tel.length > 0 && !/^0[0-9]{9}$/.test(tel)}
                  errorMessage={isEdit && tel.length > 0 && !/^0[0-9]{9}$/.test(tel) ? "Phone must be 10 digits starting with 0" : "Please enter your phone-number"}
                  className="font-bold mb-6"
                  classNames={{ label: "text-md" }}
                  label="Phone-number"
                  labelPlacement="outside"
                  placeholder="Type your phone-number"
                  type="text"
                  startContent={<Phone size={18} />}
                  variant="bordered"
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
                />

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full mt-8">
                  <Button
                    color="success"
                    className="text-white w-full sm:w-1/2 font-bold py-4 text-md"
                    type="submit"
                  >
                    Save
                  </Button>
                  <Button
                    onPress={handleCancelEdit}
                    className="bg-tone-red text-white w-full sm:w-1/2 font-bold py-4 text-md"
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            ) : (
              <div className="w-full max-w-xs sm:max-w-sm md:max-w-[400px] space-y-6 px-2 mb-6 text-center flex flex-col items-center">
                <Input
                  isDisabled
                  className="font-bold mb-10"
                  classNames={{ label: "text-md" }}
                  label="Username"
                  labelPlacement="outside"
                  placeholder={user?.username || "Loading..."}
                  type="text"
                  startContent={<User size={18} />}
                  variant="bordered"
                />
                <Input
                  isDisabled
                  className="font-bold mb-10"
                  classNames={{ label: "text-md" }}
                  label="Email"
                  labelPlacement="outside"
                  placeholder={user?.email || "Loading..."}
                  type="text"
                  startContent={<AtSign size={18} />}
                  variant="bordered"
                />
                <Input
                  isDisabled
                  className="font-bold mb-10"
                  classNames={{ label: "text-md" }}
                  label="Phone-number"
                  labelPlacement="outside"
                  placeholder={user?.tel || "Loading..."}
                  type="text"
                  startContent={<Phone size={18} />}
                  variant="bordered"
                />
                <div className="pt-4 w-full">
                  <Button
                    startContent={<SquarePen size={18} />}
                    onPress={handleStartEdit}
                    className="bg-tone-brown text-white w-full font-bold py-4 text-md"
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
