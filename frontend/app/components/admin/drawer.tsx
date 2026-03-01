"use client";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import React from "react";

interface DrawerProps {
  size: "md" | "lg" | "xl" | "2xl";
  isOpen: boolean;
  onOpenChange: () => void;
  onEvent: () => void;
}

export default function DrawerEvent({
  size,
  isOpen,
  onOpenChange,
  onEvent,
}: DrawerProps) {
  return (
    <div>
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Drawer Title
              </DrawerHeader>
              <DrawerBody>
                <p>
                  Magna exercitation reprehenderit magna aute tempor cupidatat
                  consequat elit dolor adipisicing. Mollit dolor eiusmod sunt ex
                  incididunt cillum quis. Velit duis sit officia eiusmod Lorem
                  aliqua enim laboris do dolor eiusmod. Et mollit incididunt
                  nisi consectetur esse laborum eiusmod pariatur proident Lorem
                  eiusmod et. Culpa deserunt nostrud ad veniam.
                </p>
              </DrawerBody>
              <DrawerFooter>
                <Button
                  className="bg-white text-tone-red border-2 hover:bg-tone-red hover:text-white font-bold"
                  onPress={onClose}
                >
                  Close
                </Button>
                <Button
                  color="success"
                  className="w-full font-bold text-white"
                  onPress={() => {
                    onEvent();
                    onClose();
                  }}
                >
                  Confirm
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
