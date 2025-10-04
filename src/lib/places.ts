export type PlaceCategory =
  | "attraction"
  | "museum"
  | "gallery"
  | "viewpoint"
  | "park"
  | "zoo"
  | "historic"
  | "other";

export interface Place {
  name: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
  estDurationMin: number;
  // Optional metadata to help select lesser-known places
  isFlagship?: boolean; // museums/theme parks/zoos or famous landmarks
  hasWiki?: boolean; // has wikidata/wikipedia tag
}

function estimateDuration(tags: Record<string, any>): number {
  const tourism = tags["tourism"] as string | undefined;
  const leisure = tags["leisure"] as string | undefined;
  const historic = tags["historic"] as string | undefined;

  if (tourism === "museum" || tourism === "theme_park" || tourism === "zoo") return 120;
  if (tourism === "gallery") return 90;
  if (tourism === "viewpoint") return 30;
  if (leisure === "park") return 60;
  if (historic) return 60;
  if (tourism === "attraction") return 60;
  return 45;
}

function deriveCategory(tags: Record<string, any>): PlaceCategory {
  const tourism = tags["tourism"] as string | undefined;
  const leisure = tags["leisure"] as string | undefined;
  const historic = tags["historic"] as string | undefined;

  if (tourism === "museum") return "museum";
  if (tourism === "gallery") return "gallery";
  if (tourism === "viewpoint") return "viewpoint";
  if (tourism === "zoo") return "zoo";
  if (tourism === "theme_park") return "attraction";
  if (tourism === "attraction") return "attraction";
  if (leisure === "park") return "park";
  if (historic) return "historic";
  return "other";
}

export async function fetchNearbyPlaces(lat: number, lng: number, radiusMeters = 3000, limit = 40): Promise<Place[]> {
  const query = `
  [out:json][timeout:25];
  (
    node["tourism"~"^(attraction|museum|gallery|viewpoint|theme_park|zoo)$"](around:${radiusMeters},${lat},${lng});
    way["tourism"~"^(attraction|museum|gallery|viewpoint|theme_park|zoo)$"](around:${radiusMeters},${lat},${lng});
    rel["tourism"~"^(attraction|museum|gallery|viewpoint|theme_park|zoo)$"](around:${radiusMeters},${lat},${lng});
    node["leisure"="park"](around:${radiusMeters},${lat},${lng});
    way["leisure"="park"](around:${radiusMeters},${lat},${lng});
    rel["leisure"="park"](around:${radiusMeters},${lat},${lng});
    node["historic"](around:${radiusMeters},${lat},${lng});
    way["historic"](around:${radiusMeters},${lat},${lng});
    rel["historic"](around:${radiusMeters},${lat},${lng});
  );
  out center ${limit};
  `;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: query,
  });
  if (!res.ok) {
    throw new Error(`Overpass request failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const elements = Array.isArray(data?.elements) ? data.elements : [];

  const places: Place[] = elements
    .map((el: any) => {
      const tags = (el.tags || {}) as Record<string, any>;
      const name = (tags["name"] as string) || "Unnamed Place";
      const center = el.type === "node" ? { lat: el.lat, lon: el.lon } : el.center;
      const lat0 = Number(center?.lat);
      const lon0 = Number(center?.lon);
      if (!isFinite(lat0) || !isFinite(lon0)) return null;
      const isFlagship = (tags["tourism"] === "museum") || (tags["tourism"] === "theme_park") || (tags["tourism"] === "zoo");
      const hasWiki = typeof tags["wikidata"] === "string" || typeof tags["wikipedia"] === "string";
      return {
        name,
        lat: lat0,
        lng: lon0,
        category: deriveCategory(tags),
        estDurationMin: estimateDuration(tags),
        isFlagship,
        hasWiki,
      } as Place;
    })
    .filter(Boolean);

  // Deduplicate by name and coords (roughly)
  const seen = new Set<string>();
  const unique: Place[] = [];
  for (const p of places) {
    const key = `${p.name}-${p.category}-${p.lat.toFixed(4)}-${p.lng.toFixed(4)}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(p);
    }
  }

  // Prefer named places and sort by category priority then name
  const categoryOrder: PlaceCategory[] = ["museum", "attraction", "gallery", "park", "historic", "viewpoint", "zoo", "other"];
  unique.sort((a, b) => {
    const ca = categoryOrder.indexOf(a.category);
    const cb = categoryOrder.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    return a.name.localeCompare(b.name);
  });

  return unique.slice(0, limit);
}
