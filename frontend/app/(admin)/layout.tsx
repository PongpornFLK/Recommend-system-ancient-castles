import type { Metadata } from "next";
import "../style/globals_admin.css";
import Sidebar from "../components/admin/sidebar";
import "../style/globals.css"


export const metadata: Metadata = {
  title: "Ancient Castles Thailand",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex h-screen w-full bg-gray-100">
        <Sidebar />
        <div className="flex flex-col w-full h-full ml-64 p-4">{children}</div>
      </div>
    </>
  );
}
