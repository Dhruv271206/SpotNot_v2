type LatLng = [number, number];

interface GenerateInput {
  start?: LatLng;
  end?: LatLng;
  sample: LatLng[];
  distanceMeters: number;
  durationSeconds: number;
}

interface EnhancementPlan {
  place: string;
  description: string;
  stopDurationMinutes: number;
  lat?: number;
  lng?: number;
}

// Local, no-network generator to replace Gemini usage.
export async function generateRouteEnhancements(input: GenerateInput): Promise<EnhancementPlan[]> {
  // Heuristic: pick up to 5 evenly-spaced points along the sampled route (if available)
  const sample = Array.isArray(input.sample) ? input.sample : [];
  const count = Math.min(5, Math.max(3, sample.length >= 5 ? 5 : sample.length));

  // Ensure distinct and realistic durations
  const baseDurations = [15, 20, 25, 35, 45, 60];
  const durations = baseDurations.slice(0, count);

  // Simple labels cycling through plausible categories
  const categories = [
    "Scenic Overlook",
    "Local Cafe",
    "City Park",
    "Historic Monument",
    "Art Mural",
    "River Walk",
    "Botanical Garden",
  ];

  // Lightly adapt descriptions based on trip length
  const km = input.distanceMeters / 1000;
  const hrs = input.durationSeconds / 3600;
  const tripHint = km > 100 || hrs > 3
    ? "Good break spot on a longer trip."
    : "Quick stop suitable for a short trip.";

  const items: EnhancementPlan[] = [];
  for (let i = 0; i < count; i++) {
    const idx = sample.length ? Math.floor((i + 1) * (sample.length / (count + 1))) : -1;
    const pt = idx >= 0 && idx < sample.length ? sample[idx] : undefined;
    const name = categories[i % categories.length];

    items.push({
      place: name,
      description: `${name} near your route. ${tripHint}`.slice(0, 140),
      stopDurationMinutes: durations[i],
      lat: pt ? pt[0] : undefined,
      lng: pt ? pt[1] : undefined,
    });
  }

  // Fallback if we had no geometry at all
  if (!items.length) {
    return [
      { place: "Scenic Overlook", description: "Panoramic viewpoint near your route.", stopDurationMinutes: 15 },
      { place: "Local Cafe", description: "Quick coffee stop popular with travelers.", stopDurationMinutes: 25 },
      { place: "City Park", description: "Short walk to stretch your legs and enjoy greenery.", stopDurationMinutes: 20 },
      { place: "Historic Monument", description: "Brief detour to a notable landmark.", stopDurationMinutes: 35 },
      { place: "Art Mural", description: "Street art spot for photos.", stopDurationMinutes: 10 },
    ];
  }

  return items;
}
