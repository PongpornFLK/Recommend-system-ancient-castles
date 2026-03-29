"use client";

import React, { useState } from "react";
import { Button, Input, Form } from "@heroui/react";
import { Eye, EyeOff, LockKeyhole, User, AtSign, Phone } from "lucide-react";
import Link from "next/link";
import useRegister from "@/app/service/auth/register/useRegister";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpwd, setConfirmpwd] = useState("");

  const { handleRegister, isLoading } = useRegister();

  const [isVisible, setIsVisible] = useState(false);
  const [isVisiblepwd, setIsVisiblepwd] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleVisibilitypwd = () => setIsVisiblepwd(!isVisiblepwd);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleRegister(e, username, email, tel, password, confirmpwd);
    } catch (err) {
       console.error("Error : " , err)
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Form className="w-full max-w-xs" onSubmit={onSubmit}>
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
          <Button as={Link} href="/login" className="bg-black w-full text-white font-bold basis-1/3 md:basis-1/3">
            Back
          </Button>
          <Button
            isLoading={isLoading}
            className="bg-tone-orange w-full text-white font-bold basis-2/3 md:basis-2/3"
            type="submit"
          >
            Create Now
          </Button>
        </div>
      </Form>
    </div>
  );
}
