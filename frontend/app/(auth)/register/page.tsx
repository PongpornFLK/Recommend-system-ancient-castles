"use client";
import React, { useState } from "react";
import { Button, Input, Image, Form, addToast } from "@heroui/react";
import { Eye, EyeOff, LockKeyhole, User, AtSign, Phone, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import NextImage from "next/image";

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(0);

  // fetch Data
  const [data, setIsData] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpwd, setConfirmpwd] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (password == confirmpwd) {
      try {
        const res = await axios.post("http://127.0.0.1:8000/users", {
          username : username,
          email : email,
          tel : tel,
          roles : "user",
          password : password,
        });

        console.log("Register success", res.status, "\nData:", res.data);
        setIsData(res.data);

        addToast({
          hideIcon: true,
          title: "Create Success",
          classNames: {
            closeButton:
              "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
          },
          closeIcon: <X />,
          color: "success",
        });

        router.push("/login");
      } catch (err) {
        console.error("Register Error", err);
      }
    } else if (password != confirmpwd) {
      addToast({
        hideIcon: true,
        title: "Password not match",
        classNames: {
          closeButton:
            "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
        },
        closeIcon: <X />,
        color: "danger",
      });
    }
  }

  console.log("Data:", data);

  // pass visibility
  const [isVisible, setIsVisible] = React.useState(false);
  const [isVisiblepwd, setIsVisiblepwd] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleVisibilitypwd = () => setIsVisiblepwd(!isVisiblepwd);

  return (
    <section className="min-h-screen flex items-center justify-center p-4">
      <div className="shadow-xl bg-white rounded-2xl w-full max-w-5xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
            <div className="flex justify-center items-center gap-4 mb-3">
              <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold text-tone-orange">
                Create Account
              </h1>
            </div>
            <h2 className="my-5 text-center">
              Please enter your information to create account.{" "}
            </h2>
            <div className="flex items-center justify-center">
              <Form className="w-full max-w-xs" onSubmit={handleRegister}>
                <Input
                  isRequired
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
                <Input
                  isRequired
                  errorMessage="Please enter your password"
                  className="font-bold"
                  label="Password"
                  labelPlacement="outside"
                  placeholder="Enter your password"
                  startContent={<LockKeyhole size={18} />}
                  variant="bordered"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  endContent={
                    <button
                      aria-label="toggle password visibility"
                      className="focus:outline-solid outline-transparent"
                      type="button"
                      onClick={toggleVisibility}
                    >
                      {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  }
                  type={isVisible ? "text" : "password"}
                />
                <Input
                  isRequired
                  errorMessage="Please enter your confirm password"
                  className="font-bold"
                  label="Confirm Password"
                  labelPlacement="outside"
                  placeholder="Enter your confirm password"
                  startContent={<LockKeyhole size={18} />}
                  variant="bordered"
                  value={confirmpwd}
                  onChange={(e) => setConfirmpwd(e.target.value)}
                  endContent={
                    <button
                      aria-label="toggle password visibility"
                      className="focus:outline-solid outline-transparent"
                      type="button"
                      onClick={toggleVisibilitypwd}
                    >
                      {isVisiblepwd ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  }
                  type={isVisiblepwd ? "text" : "password"}
                />
                <div className="flex flex-row gap-2 mt-4 w-full">
                  <Button className="bg-black w-full text-white font-bold basis-1/3 md:basis-1/3">
                    <Link href="/login">Back</Link>
                  </Button>
                  <Button
                    className="bg-tone-orange w-full text-white font-bold basis-2/3 md:basis-2/3"
                    type="submit"
                  >
                    Create Now
                  </Button>
                </div>
              </Form>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center p-8">
            <div className="w-full h-full max-h-[600px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                as={NextImage}
                alt="Login castle"
                src="/assets/castle/image.png"
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
