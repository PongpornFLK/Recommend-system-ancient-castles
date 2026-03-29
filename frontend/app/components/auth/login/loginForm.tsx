"use client";

import React, { useState } from "react";
import { Button, Input, Form } from "@heroui/react";
import { Eye, EyeOff, LockKeyhole, User } from "lucide-react";
import useLogin from "@/app/service/auth/login/useLogin";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogin, isLoading } = useLogin();

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleLogin(e, username, password);
    } catch (err) {
      console.error("Error : " , err)
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Form onSubmit={onSubmit} className="w-full max-w-xs">
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
            isLoading={isLoading}
            className="bg-tone-orange w-full text-white font-bold"
            type="submit"
          >
            GET START
          </Button>
        </div>
      </Form>
    </div>
  );
}
