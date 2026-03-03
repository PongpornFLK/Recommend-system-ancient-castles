import ViewMap from "@/app/components/viewroute/viewmap";

export const dynamic = 'force-dynamic';

// const ViewMap = dynamic(() => import("@/app/components/viewroute/viewmap"), {
//   ssr: false,
// });

export default function ViewRoute() {
  return (
    <section>
      <div className="bg-white rounded-2xl mt-5 p-6 shadow-none">
        <div className="justify-items-center">
          <div className="font-bold text-3xl">View Route to Castle</div>
          <div className="font-bold text-lg my-4">แสดงเส้นทางสู่การไปปราสาท และสถานที่ใกล้เคียง</div>
        </div>
        <ViewMap/>
      </div>
    </section>
  );
}
