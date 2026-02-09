"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Select,
  SelectItem,
} from "@heroui/react";
import { SlidersHorizontal, CheckCheck } from "lucide-react";

export default function Filter() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const animals = [
    { key: "cat", label: "Cat" },
    { key: "dog", label: "Dog" },
  ];

  return (
    <>
      <Button onPress={onOpen} startContent={<SlidersHorizontal />} className="bg-tone-green text-white hover:bg-tone-green/80">
        Filter
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-2xl">
                Filter
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-row gap-4">
                  <div className="w-full">
                    <p className="text-2xl font-bold text-tone-orange">
                      Location
                    </p>
                    <Select
                      className="max-w-xs my-10"
                      items={animals}
                      label="Province"
                      placeholder="Select province"
                      labelPlacement="outside"
                    >
                      {(animal) => <SelectItem>{animal.label}</SelectItem>}
                    </Select>
                    <Select
                      className="max-w-xs  my-10"
                      items={animals}
                      label="Subdistrict"
                      placeholder="Select subdistrict"
                      labelPlacement="outside"
                    >
                      {(animal) => <SelectItem>{animal.label}</SelectItem>}
                    </Select>

                    <Select
                      className="max-w-xs "
                      items={animals}
                      label="District"
                      placeholder="Select district"
                      labelPlacement="outside"
                    >
                      {(animal) => <SelectItem>{animal.label}</SelectItem>}
                    </Select>
                  </div>
                  
                  <div className="w-full">
                    <p className="text-2xl font-bold text-tone-orange mb-2">
                      Characteristics
                    </p>

                    <Select
                      className="max-w-xs  my-10"
                      items={animals}
                      label="Era"
                      placeholder="Select era"
                      labelPlacement="outside"
                    >
                      {(animal) => <SelectItem>{animal.label}</SelectItem>}
                    </Select>
                    <Select
                      className="max-w-xs  my-10"
                      items={animals}
                      label="Architecture"
                      placeholder="Select architecture"
                      labelPlacement="outside"
                    >
                      {(animal) => <SelectItem>{animal.label}</SelectItem>}
                    </Select>

                    <Select
                      className="max-w-xs"
                      items={animals}
                      label="Type of castle"
                      placeholder="Select type"
                      labelPlacement="outside"
                    >
                      {(animal) => <SelectItem>{animal.label}</SelectItem>}
                    </Select>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="justify-center">
                <Button
                  onPress={onClose}
                  className="text-white font-bold bg-tone-green"
                  startContent={<CheckCheck />}
                >
                  Apply
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
