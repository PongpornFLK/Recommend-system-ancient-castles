"use client";
import React, { useState, useEffect } from "react";
import { Button, Input, Image, Form, addToast } from "@heroui/react";
import { Eye, EyeOff, LockKeyhole, User, LogIn, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import NextImage from "next/image";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // fetch Data
  const [data, setIsData] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const controller = new AbortController();
  const signal = controller.signal;

  interface customToken {
    sub: string;
    user_id: number;
    roles: string;
    exp: number;
  }

  useEffect(() => {
    setIsClient(true);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(1);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/auth/token",
        formData,
      );
      // console.log("Login success", res.status , "\nData:" , res.data);

      const token = res.data.access_token;
      const decode = jwtDecode<customToken>(token);

      localStorage.setItem("token", token);
      localStorage.setItem("user_id", decode.user_id.toString());

      console.log("Decode : ", decode.roles);
      console.log("User_id : ", decode.user_id);
      console.log("Token : ", token);

      if (decode.roles === "user") {
        addToast({
          hideIcon: true,
          title: "Login Success",
          description: "Role : User",
          classNames: {
            closeButton:
              "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
          },
          closeIcon: <X />,
          color: "success",
        });
        router.push("/landing");
      } else if (decode.roles === "admin") {
        addToast({
          hideIcon: true,
          title: "Login Success",
          description: "Role : Admin",
          classNames: {
            closeButton:
              "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 font-bold",
          },
          closeIcon: <X />,
          color: "success",
        });
        router.push("/");
      }

      setIsData(res.data);
    } catch (err) {
      console.error("Login Error", err);
    } finally {
      setIsLoading(0);
    }
  }

  // console.log(data);

  // pass visibility
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  if (!isClient) return <div>Loading...</div>;
  return (
    <section className="min-h-screen flex items-center justify-center p-4">
      <div className="shadow-xl bg-white rounded-2xl w-full max-w-5xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-tone-orange">
                Login
              </h1>
              <div>
                <LogIn
                  size={72}
                  className="w-12 h-12 md:w-16 md:h-16 lg:w-18 lg:h-18 text-tone-orange"
                />
              </div>
            </div>
            <h2 className="my-5 text-center">
              Please enter your username and password to login
            </h2>
            <div className="flex items-center justify-center">
              <Form onSubmit={handleLogin} className="w-full max-w-xs">
                <Input
                  isRequired
                  errorMessage={
                    username === "" ? "Please enter your username" : undefined
                  }
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
                <div className="mt-8 w-full">
                  <Button
                    className="bg-tone-orange w-full text-white font-bold"
                    type="submit"
                  >
                    GET START
                  </Button>
                </div>
              </Form>
            </div>
            <div className="mt-2 text-center">
              Don’t have an account?{" "}
              <Link
                aria-current="page"
                href="/register"
                className="text-blue-500 hover:underline font-semibold"
              >
                Create account
              </Link>
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
