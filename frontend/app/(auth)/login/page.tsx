"use client";
import { Image } from "@heroui/react";
import { LogIn } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import ButtonGoogle from "@/app/components/auth/buttongoogle";
import dynamic from "next/dynamic";

const LoginForm = dynamic(
  () => import("@/app/components/auth/login/loginForm"),
  {
    ssr: false,
  },
);

export default function Login() {
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
              Please enter your information to login
            </h2>

            <div className="max-w-xs mx-auto w-full">
              <LoginForm />

              <div className="flex justify-center my-4 items-center">
                <span className="text-gray-400">or</span>
              </div>

              <ButtonGoogle />
            </div>

            <div className="mt-4 text-center">
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
