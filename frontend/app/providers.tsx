'use client'

import { HeroUIProvider } from '@heroui/react'
import { ToastProvider } from "@heroui/toast";


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ToastProvider
        placement="bottom-right"
        toastOffset={24}
        toastProps={{
          variant: "solid",
          classNames: {
            base: "w-auto min-w-[300px] max-w-sm absolute right-4 flex-none ",
            title: "text-white font-bold text-sm",
            description: "text-white/90",
            icon: "text-white mt-1"
          }
        }}
      />
      {children}
    </HeroUIProvider>
  )
}