/*
  Simple routing utility using OSRM HTTP API.
  - Configurable via VITE_ROUTER_BASE_URL (defaults to OSRM demo)
  - Supports driving/cycling/walking via profile mapping
  - Accepts start, checkpoints, end and returns distance, duration, and GeoJSON geometry converted to [lat, lng]
*/
import { TravelMode, RouteData, Checkpoint } from "@/types/route";

const DEFAULT_OSRM = "https://router.project-osrm.org";

function modeToProfile(mode: TravelMode): "driving" | "cycling" | "walking" {
  switch (mode) {
    case "cycling":
      return "cycling";
    case "walking":
      return "walking";
    case "driving":
    default:
      return "driving";
  }
}

function toLonLat(coord: [number, number]): [number, number] {
  // Input is [lat, lng] -> OSRM needs [lng, lat]
  return [coord[1], coord[0]];
}

function fromLonLat(coord: [number, number]): [number, number] {
  // Output back to [lat, lng]
  return [coord[1], coord[0]];
}

export async function routeWithOSRM(params: {
  start: [number, number];
  end: [number, number];
  mode: TravelMode;
  checkpoints?: Checkpoint[];
  signal?: AbortSignal;
}): Promise<RouteData> {
  const { start, end, mode, checkpoints = [], signal } = params;
  const baseUrl = import.meta.env.VITE_ROUTER_BASE_URL || DEFAULT_OSRM;
  const profile = modeToProfile(mode);

  const coords = [start, ...checkpoints.map((c) => c.coordinates), end]
    .map(toLonLat)
    .map((c) => `${c[0]},${c[1]}`)
    .join(";");

  const url = `${baseUrl}/route/v1/${profile}/${coords}?overview=full&geometries=geojson&annotations=duration,distance&steps=false`;

  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Routing failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();

  if (!data || !data.routes || data.routes.length === 0) {
    throw new Error("No route found");
  }

  const best = data.routes[0];
  const distance: number = best.distance; // meters
  const duration: number = best.duration; // seconds
  const geometry: [number, number][] = (best.geometry.coordinates as [number, number][]) // [lon,lat]
    .map(fromLonLat);

  // Return basic routing data only; emissions removed
  return { distance, duration, geometry };
}