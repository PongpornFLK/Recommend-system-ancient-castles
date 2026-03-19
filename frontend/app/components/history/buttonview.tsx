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
  Image,
} from "@heroui/react";
import { MapPinned } from "lucide-react";
interface ButtonProps {
  plan_id: number;
}

export default function Buttonview({ plan_id }: ButtonProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { routeSeq, mapUrl } = useRoute(plan_id);

  // Split routeSeq
  const text = routeSeq;
  const seq = text.split(" -> ");
  const seqMax = seq.length;

  return (
    <>
      <Button
        className="bg-blue-500 text-white font-bold bg-tone-yellow"
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
        size="4xl"
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
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Side */}
                  <div className="flex-1 px-6 py-4 max-h-[60vh] overflow-y-auto bg-gray-100 rounded-2xl">
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

                    <div className="space-y-4">
                      {seq[0] || seq.length > 0 ? (
                        seq.map((place, key) => {
                          return (
                            <div
                              key={key}
                              className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-200 transition-colors"
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
                              <div className="font-bold text-slate-700">
                                {place}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-10">
                          <Spinner
                            color="warning"
                            label="Loading route path..."
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h1 className="font-bold text-slate-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        Route Visualization
                      </h1>
                    </div>
                    <div className="w-full aspect-video sm:aspect-square lg:aspect-auto lg:flex-1 relative rounded-3xl overflow-hidden bg-slate-100 border-4 border-slate-50 shadow-inner">
                      {mapUrl ? (
                        <Image
                          removeWrapper
                          alt="Route Map"
                          src={mapUrl}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Spinner
                            color="warning"
                            label="Generating Map View..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
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
