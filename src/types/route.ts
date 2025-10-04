export interface Checkpoint {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lng]
  notes?: string;
}

export interface RouteData {
  distance: number; // in meters
  duration: number; // in seconds
  co2Emission: number; // in kg
  geometry: [number, number][]; // array of [lat, lng]
}

export type TravelMode = "driving" | "cycling" | "walking";

export interface RouteRequest {
  start: [number, number]; // [lat, lng]
  end: [number, number]; // [lat, lng]
  mode: TravelMode;
  checkpoints?: [number, number][]; // array of [lat, lng]
}
