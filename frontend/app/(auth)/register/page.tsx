"use client";
import { Image } from "@heroui/react";
import NextImage from "next/image";
import dynamic from "next/dynamic";
import ButtonGoogle from "@/app/components/auth/buttongoogle";

const RegisterForm = dynamic(
  () => import("@/app/components/auth/register/registerForm"),
  {
    ssr: false,
  },
);

export default function Register() {
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

            <div className="max-w-xs mx-auto w-full">
              <RegisterForm />
              <div className="flex justify-center my-4 items-center">
                <span className="text-gray-400">or</span>
              </div>
              <ButtonGoogle />
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
                priority
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
