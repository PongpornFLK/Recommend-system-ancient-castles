import axios from "axios";
import { useEffect, useState } from "react";

export default function useLocation() {
  const [getNamePlace, setNamePlace] = useState("กำลังหาสถานที่ปัจจุบันของคุณ");
  const [getGPS , setGPS] = useState({lat : 0 , lng : 0});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentPlace = async (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const api = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=th&key=${api}`,
        );
        // console.log("CurrentUser : " , response.data.results)
        // console.log("lat : " , lat , "Long : " , lng)

        setGPS({lat : lat , lng : lng});

        const name = response.data.results[0].formatted_address;

        if (name && name !== "") {
          setNamePlace(name);
        } else {
          setNamePlace("ไม่พบสถานที่");
        }
      } catch (err) {
        console.error("Fetch err :", err);
        setNamePlace("การดึงข้อมูลสถานที่ผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    function error(pos: GeolocationPositionError) {
      console.log("Location Access Denied :", pos);
      setNamePlace("กรุณาเปิดการเข้าถึงตำแหน่ง (GPS)");
      setLoading(false);
    }
    navigator.geolocation.getCurrentPosition(fetchCurrentPlace, error);
  }, []);

  return { getNamePlace, loading ,getGPS};
}
