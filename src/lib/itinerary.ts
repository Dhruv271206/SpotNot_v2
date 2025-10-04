import { RouteData } from "@/types/route";
import { generateRouteEnhancements } from "@/lib/gemini";

export interface ItineraryStop {
  order: number;
  place: string;
  description: string;
  stopDurationMinutes: number;
  arriveMinutes: number; // minutes from start
  departMinutes: number; // minutes from start
  lat?: number;
  lng?: number;
}

// Build a simple itinerary by distributing travel time evenly between generated stops.
export async function buildItinerary(route: RouteData): Promise<ItineraryStop[]> {
  const sampleEvery = Math.max(1, Math.floor((route.geometry?.length || 0) / 20));
  const sampled = (route.geometry || []).filter((_, i) => i % sampleEvery === 0);
  const start = route.geometry?.[0];
  const end = route.geometry?.[route.geometry.length - 1];

  const suggestions = await generateRouteEnhancements({
    start: start as any,
    end: end as any,
    sample: sampled as any,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  });

  // Take up to 5 stops
  const stops = suggestions.slice(0, 5);
  const travelBlocks = stops.length + 1; // travel segments between start->1, 1->2, ..., last->end
  const travelPerBlockSec = route.duration / travelBlocks;

  let currentTimeSec = 0; // from start of route
  const itinerary: ItineraryStop[] = [];

  for (let i = 0; i < stops.length; i++) {
    // Travel to this stop
    currentTimeSec += travelPerBlockSec;
    const arriveMin = Math.round(currentTimeSec / 60);

    // Dwell at stop
    const dwellMin = Math.max(5, Math.min(180, Math.round(stops[i].stopDurationMinutes)));
    const departMin = arriveMin + dwellMin;
    currentTimeSec = departMin * 60; // continue after dwell

    itinerary.push({
      order: i + 1,
      place: stops[i].place,
      description: stops[i].description,
      stopDurationMinutes: dwellMin,
      arriveMinutes: arriveMin,
      departMinutes: departMin,
      lat: stops[i].lat,
      lng: stops[i].lng,
    });
  }

  return itinerary;
}