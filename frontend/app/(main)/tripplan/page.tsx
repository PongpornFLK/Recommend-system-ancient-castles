import TripAccord from "@/app/components/trip/accordion";

export default function TripPlanPage() {
  return (
    <div>
      <div className="text-center text-4xl font-bold my-5">Trip Plan</div>
      <div className="text-center text-md font-bold mb-5">จัดการแผนการเดินทางของคุณทั้งหมด</div>
      <div>
        <TripAccord/>
      </div>
    </div>
  );
}
