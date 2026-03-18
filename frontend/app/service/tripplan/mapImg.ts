
export const MapStaticImg = (
    currentLat : number,
    currentLng : number,
    desLat : number,
    desLng : number,
    waypoint : { lat : number , lng : number }[] = []
) : string => {
    const STATIC_URL= `https://maps.googleapis.com/maps/api/staticmap`
    const API_URL = `key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    const size = `size=800x400`
    const current= `markers=color:red|label:A|${currentLat},${currentLng}`;
    const destination= `markers=color:red|label:B|${desLat},${desLng}`;
    const waypointsString = waypoint.length > 0 
        ? "|" + waypoint.map(wp => `${wp.lat},${wp.lng}`).join("|") 
        : "";
    const path = `path=color:blue|weight:5|${currentLat},${currentLng}${waypointsString}|${desLat},${desLng}`;

    return `${STATIC_URL}?${size}&${current}&${destination}&${path}&${API_URL}`;
}
    