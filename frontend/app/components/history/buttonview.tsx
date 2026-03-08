"use client";
import useRoute from "@/app/service/history/useRoute";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
  Spinner,
  Chip,
} from "@heroui/react";
import { MapPinned } from "lucide-react";
interface ButtonProps {
  plan_id: number;
}

export default function Buttonview({ plan_id }: ButtonProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { routeSeq } = useRoute(plan_id);

  // Split routeSeq
  const text = routeSeq;
  const seq = text.split(" -> ");
  const seqMax = seq.length;

  return (
    <>
      <Button
        className="px-3 py-1 bg-blue-500 text-white font-bold bg-tone-blue"
        onClick={() => {
          onOpen();
        }}
      >
        Detail
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h2 className="text-xl font-bold text-slate-800">
                    Route Details
                    <span className="text-sm font-normal text-slate-500 ml-2">
                      (Plan ID: {plan_id})
                    </span>
                  </h2>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="px-6 py-4 max-h-[60vh] overflow-y-auto bg-slate-50/50">
                  <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mb-6">
                    <div className="w-12 h-12 bg-tone-lightgray rounded-full flex items-center justify-center text-tone-orange">
                      <MapPinned size={24} />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                        Summary
                      </span>
                      <p className="text-slate-700 font-medium">
                        สถานที่เที่ยวทั้งหมด :{" "}
                        <span className="text-tone-orange font-bold text-lg">
                          {seqMax}
                        </span>{" "}
                        สถานที่
                      </p>
                    </div>
                  </div>

                  {seq[0] || seq.length > 0 ? (
                    seq.map((place, key) => {
                      return (
                        <div
                          key={key}
                          className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-200 transition-colors mt-4"
                        >
                          <Chip
                            size="lg"
                            radius="full"
                            classNames={{
                              base: "bg-tone-orange",
                              content: "text-white font-bold",
                            }}
                          >
                            {key + 1}
                          </Chip>
                          <div className="font-bold">{place} </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center">
                      <Spinner color="warning" label="Loading..." />;
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
