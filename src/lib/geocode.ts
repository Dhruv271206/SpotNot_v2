export interface GeocodeResult {
  displayName: string;
  lat: number;
  lng: number;
}

export async function searchPlaces(query: string, limit = 5): Promise<GeocodeResult[]> {
  if (!query || !query.trim()) return [];

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      // Identify the app per Nominatim usage policy
      "Accept-Language": "en",
    },
  });
  if (!res.ok) {
    throw new Error(`Geocoding failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((it: any) => ({
    displayName: String(it.display_name || it.name || "Unknown"),
    lat: Number(it.lat),
    lng: Number(it.lon),
  })) as GeocodeResult[];
}
