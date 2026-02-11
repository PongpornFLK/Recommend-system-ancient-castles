import React from 'react'
import "./style/globals.css"
import {Providers} from "./providers";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "Ancient Castles Thailand",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-tone-cream">
      <body >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
