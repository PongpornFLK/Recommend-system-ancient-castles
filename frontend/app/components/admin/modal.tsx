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
  size: "md" | "lg" | "xl" | "2xl";
}

export default function ModalDelete({
  isOpen,
  onOpenChange,
  onEvent,
  item,
  size,
}: ModalWarningProp) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size={size}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Confirm Delete</ModalHeader>
            <ModalBody>
              <div className="flex flex-row gap-1">
                <span>Are you sure you want to delete</span>
                <span className="font-bold"> ID : {item} ?</span>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="danger"
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