export const MapStaticImg = async (
    currentLat: number, currentLng: number,
    desLat: number, desLng: number,
    waypoints: { lat: number, lng: number }[] = []
): Promise<string> => {
    const STATIC_URL = "https://maps.googleapis.com/maps/api/staticmap";
    const API_KEY = `key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

    // การแสดงผล
    const size = "size=800x400";
    const currentMarker = `markers=color:red|label:A|${currentLat},${currentLng}`;
    const destMarker = `markers=color:red|label:B|${desLat},${desLng}`;

    // สร้างเส้นตรงแบบปกติ (กรณีหาเส้นถนนไม่ได้)
    const waypointsCoord = waypoints.map(wp => `${wp.lat},${wp.lng}`).join("|");
    const waypointsStr = waypointsCoord ? `|${waypointsCoord}` : "";
    let path = `path=color:blue|weight:5|${currentLat},${currentLng}${waypointsStr}|${desLat},${desLng}`;

    // หาเส้นถนนจริงๆ
    try {
        if (typeof window !== "undefined" && window.google?.maps) {
            const directions = new window.google.maps.DirectionsService();
            const result = await directions.route({
                origin: { lat: currentLat, lng: currentLng },
                destination: { lat: desLat, lng: desLng },
                waypoints: waypoints.map(wp => ({ location: wp, stopover: true })),
                travelMode: window.google.maps.TravelMode.DRIVING
            });

            // ใช้รหัสวาดเส้นถนนที่ได้จาก Google (Encoded Polyline)
            const polyline = result.routes[0]?.overview_polyline;
            if (polyline) {
                path = `path=color:blue|weight:5|enc:${encodeURIComponent(polyline)}`;
            }
        }
    } catch {
        console.log("ใช้เส้นตรงสำรอง แผนที่จะแสดงปกติแต่ไม่โค้งตามถนน");
    }

    return `${STATIC_URL}?${size}&${currentMarker}&${destMarker}&${path}&${API_KEY}`;
}
