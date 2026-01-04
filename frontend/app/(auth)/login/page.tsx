"use client";
import React, { useState } from "react";
import { Button, Input, Image, Form } from "@heroui/react";
import { Eye, EyeOff, LockKeyhole, User, LogIn } from "lucide-react";
// import { LoginSuccess, LoginError } from "@/app/components/alert";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import NextImage from "next/image";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(0);

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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(1);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/auth/token",
        formData
      );
      // console.log("Login success", res.status , "\nData:" , res.data);

      const token = res.data.access_token;
      const decode = jwtDecode<customToken>(token);
      // console.log("Decode : ", decode.roles);

      if (decode.roles === "user") {
        router.push("/landing");
      } else if (decode.roles === "admin") {
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

  return (
    <section className="min-h-screen flex items-center justify-center">
      <div className="shadow-md mx-8 my-5 bg-white rounded-xl h-full max-h-full md:max-h-screen max-w-4xl w-full">
        <div className="grid grid-cols-2 place-items-center">
          <div className="justify-items-center my-10">
            <div className="grid grid-cols-2 justify-items-center">
              <h1 className="text-[52px] font-bold">Login</h1>
              <LogIn size={80} />
            </div>
            <h2 className="my-5">
              Please enter your username and password to login
            </h2>
            <Form onSubmit={handleLogin} className="w-full max-w-xs">
              <Input
                isRequired
                errorMessage="Please enter your username"
                className="font-bold my-5"
                label="Username"
                labelPlacement="outside"
                placeholder="Type your username"
                type="text"
                startContent={<User />}
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
                startContent={<LockKeyhole />}
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
                    {isVisible ? <Eye /> : <EyeOff />}
                  </button>
                }
                type={isVisible ? "text" : "password"}
              />
              <div className="my-5 w-full">
                <Button
                  className="bg-tone-orange w-full text-white font-bold"
                  type="submit"
                >
                  GET START
                </Button>
              </div>
            </Form>
            <div className="my-5">
              Don’t have an account?{" "}
              <Link
                aria-current="page"
                href="#"
                className="text-blue-500 hover:underline font-semibold"
              >
                Create account
              </Link>
            </div>
          </div>
          <div className="my-10 mx-4">
            <Image
              as={NextImage}
              alt="Login castle"
              src="/assets/castle/image.png"
              width={500}
              height={300}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
