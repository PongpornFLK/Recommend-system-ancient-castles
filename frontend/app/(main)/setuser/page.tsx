"use client";
import React, { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Form,
  Input,
  Button,
  addToast,
} from "@heroui/react";
import {
  UserCog,
  LockKeyhole,
  User,
  AtSign,
  Phone,
  SquarePen,
  X,
  RotateCcwKey,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "@/app/config";

export default function Setuser() {
  const [user, setUser] = React.useState<UserData | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [oldpwd, setOldPwd] = useState("");
  const [newpwd, setNewPwd] = useState("");
  const [confirmnewpwd, setConfirmNewPwd] = useState("");

  interface UserData {
    user_id: string;
    username: string;
    email: string;
    tel: string;
    password: string;
  }

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");

      try {
        const response = await axios.get(
          `${API_URL}/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setUser(response.data);
        setFormData(response.data);
      } catch (err) {
        console.log("Fetching error : ", err);
      }
    };

    fetchUser();
  }, []);

  const handleSaveProfile = async () => {
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

      console.log(response.data);

      setUser(response.data);
      setFormData(response.data);
      setIsEdit(false);

      addToast({
        hideIcon: true,
        title: "Update Success",
        classNames: {
          closeButton:
            "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
        },
        closeIcon: <X />,
        color: "success",
      });
    } catch (err) {
      console.log("Can't Save data", err);
      addToast({
        title: "Update Failed",
        description: "Please try again",
        color: "danger",
      });
    }
  };

  const handleChangePassword = async () => {
    const token = localStorage.getItem("token");

    if (newpwd != "" && confirmnewpwd != "" && oldpwd != "") {
      try {
        if (oldpwd != "" && newpwd == confirmnewpwd) {
          const response = await axios.post(
            `${API_URL}/users/changepwd`,
            {
              old_pass: oldpwd,
              new_pass: newpwd,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          setOldPwd("");
          setConfirmNewPwd("");
          setNewPwd("");

          addToast({
            hideIcon: true,
            title: "Reset password success",
            classNames: {
              closeButton:
                "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
            },
            closeIcon: <X />,
            color: "success",
          });
        }
      } catch (err) {
        console.log("Not reserpassword", err);
      }
    } else if (oldpwd == "" || newpwd == "" || confirmnewpwd == "") {
      addToast({
        hideIcon: true,
        title: "Please input full field",
        classNames: {
          closeButton:
            "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
        },
        closeIcon: <X />,
        color: "danger",
      });
    }
  };

  return (
    <section className="justify-items-center">
      <div className="flex flex-col gap-4 my-5">
        <div className="flex flex-row">
          <div className="font-bold text-3xl ml-7">Settings</div>
        </div>
        <div className="flex flex-col  ">
          <Tabs
            aria-label="Options"
            placement="start"
            size="lg"
            variant="light"
            classNames={{
              cursor: "bg-tone-orange",
              tabContent: "group-data-[selected=true]:text-white",
              base: "bg-white rounded-xl",
            }}
          >
            <Tab
              key="photos"
              title={
                <div className="flex items-center space-x-2 ">
                  <UserCog size={18} />
                  <span>My Profile</span>
                </div>
              }
            >
              <Card className="px-5 py-5">
                <CardBody>
                  <div className="flex flex-col w-2xl h-auto">
                    <div className="text-4xl text-center font-bold text-tone-oldgray">
                      Profile
                    </div>
                    {/* <div className="flex gap-3 justify-center">
                      <Avatar
                        className="flex justify-center my-3"
                        size="lg"
                        classNames={{
                          base: "bg-linear-to-br from-[#FFB457] to-[#FF705B]",
                          icon: "text-black/80",
                        }}
                        icon={<AvatarIcon />}
                      />
                    </div> */}

                    <div className="flex items-center justify-center my-5">
                      {isEdit ? (
                        <>
                          <Form
                            className="w-full max-w-xs"
                            onSubmit={handleSaveProfile}
                          >
                            <Input
                              isRequired
                              isInvalid={!username && isEdit}
                              errorMessage="Please enter your username"
                              className="font-bold"
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
                              isInvalid={!email && isEdit}
                              errorMessage="Please enter your email"
                              className="font-bold"
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
                              isInvalid={!tel && isEdit}
                              errorMessage="Please enter your phone-number"
                              className="font-bold"
                              label="Phone-number"
                              labelPlacement="outside"
                              placeholder="Type your phone-number"
                              type="text"
                              startContent={<Phone size={18} />}
                              variant="bordered"
                              value={tel}
                              onChange={(e) => setTel(e.target.value)}
                            />
                          </Form>
                        </>
                      ) : (
                        <>
                          <Form className="w-full max-w-xs">
                            <Input
                              isDisabled
                              className="font-bold"
                              label="Username"
                              labelPlacement="outside"
                              placeholder={user?.username}
                              type="text"
                              startContent={<User size={18} />}
                              variant="bordered"
                            />
                            <Input
                              isDisabled
                              errorMessage="Please enter your email"
                              className="font-bold"
                              label="Email"
                              labelPlacement="outside"
                              placeholder={user?.email}
                              type="text"
                              startContent={<AtSign size={18} />}
                              variant="bordered"
                            />
                            <Input
                              isDisabled
                              errorMessage="Please enter your phone-number"
                              className="font-bold"
                              label="Phone-number"
                              labelPlacement="outside"
                              placeholder={user?.tel}
                              type="text"
                              startContent={<Phone size={18} />}
                              variant="bordered"
                            />
                          </Form>
                        </>
                      )}
                    </div>
                    <div className="flex gap-4 justify-center">
                      {isEdit ? (
                        <>
                          <Button
                            onPress={() => {
                              handleSaveProfile();
                            }}
                            color="success"
                            className="text-white w-[150px] font-bold"
                            type="submit"
                          >
                            Save
                          </Button>
                          <Button
                            onPress={() => {
                              setIsEdit(false);
                            }}
                            className="bg-tone-red text-white w-[150px] font-bold"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            startContent={<SquarePen size={18} />}
                            onPress={() => {
                              setUsername(user?.username || "");
                              setEmail(user?.email || "");
                              setTel(user?.tel || "");
                              setIsEdit(true);
                            }}
                            className="bg-tone-brown text-white w-[320px] font-bold"
                          >
                            Edit Profile
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="music"
              title={
                <div className="flex items-center space-x-2">
                  <LockKeyhole size={18} />
                  <span>Reset Password</span>
                </div>
              }
            >
              <Card className="px-5 py-5">
                <CardBody>
                  <div className="flex flex-col w-2xl h-auto">
                    <div className="text-4xl text-center font-bold text-tone-oldgray">
                      Reset Password
                    </div>

                    <div className="flex items-center justify-center my-5">
                      <Form
                        className="w-full max-w-xs"
                        onSubmit={handleChangePassword}
                      >
                        <Input
                          isRequired
                          isInvalid={!oldpwd && isEdit}
                          errorMessage="Please enter your Old password"
                          className="font-bold"
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
                          isInvalid={!newpwd && isEdit}
                          errorMessage="Please enter your new password"
                          className="font-bold"
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
                          isInvalid={!confirmnewpwd && isEdit}
                          errorMessage="Please confirm you new password"
                          className="font-bold"
                          label="Confirm new password"
                          labelPlacement="outside"
                          placeholder="Type confirm new password"
                          type="password"
                          startContent={<RotateCcwKey size={18} />}
                          variant="bordered"
                          value={confirmnewpwd}
                          onChange={(e) => setConfirmNewPwd(e.target.value)}
                        />
                      </Form>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button
                        className="bg-tone-brown text-white w-[320px] font-bold"
                        onPress={() => {
                          handleChangePassword();
                        }}
                        type="submit"
                      >
                        Change Password
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
