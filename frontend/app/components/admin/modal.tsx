"use client";
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface ModalWarningProp {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEvent: () => void;
  item: string;
  label?: string; // Add optional label prop
  size: "md" | "lg" | "xl" | "2xl";
}

export default function ModalDelete({
  isOpen,
  onOpenChange,
  onEvent,
  item,
  label,
  size,
}: ModalWarningProp) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size={size} placement="center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Confirm Delete</ModalHeader>
            <ModalBody>
              <div className="flex flex-row flex-wrap gap-1 items-center justify-center text-center">
                <span>Are you sure you want to delete</span>
                <span className="font-bold whitespace-nowrap"> {label || "ID"} : {item} ?</span>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                className="bg-tone-red text-white font-bold"
                onPress={() => {
                  onEvent();
                  onClose();
                }}
              >
                Confirm
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}