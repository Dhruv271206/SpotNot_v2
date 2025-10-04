import { Place } from "@/lib/places";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface NearbyGuidanceInput {
  destinationLabel?: string;
  coords?: { lat: number; lng: number };
  days: number;
  arrivalHHMM: string;
  departureHHMM: string;
  places: Place[];
}

export async function getNearbyGuidance(input: NearbyGuidanceInput): Promise<string | null> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) {
    // No key present: let caller decide to hide guidance
    return null;
  }

  const name = input.destinationLabel || (input.coords ? `${input.coords.lat.toFixed(3)}, ${input.coords.lng.toFixed(3)}` : "destination");
  const placesBrief = input.places.slice(0, 20).map((p, i) => `${i + 1}. ${p.name} (${p.category}, ~${p.estDurationMin}m)`).join("\n");

  const prompt = `You are an expert local travel guide. The traveler is visiting ${name} for ${input.days} day(s).
Arrival (day 1): ${input.arrivalHHMM}; Departure (last day): ${input.departureHHMM}.
They are interested in these nearby places:
${placesBrief}

Task:
- Suggest practical guidance on how to prioritize these places.
- Recommend an efficient visiting order and timing tips (brief, not exact schedules).
- Include short tips on tickets/queues, best times of day, and nearby food options if relevant.
- Keep it concise and actionable (<= 200 words). Use bullet points.
`;

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: prompt }] }
      ],
      generationConfig: { temperature: 0.6, maxOutputTokens: 400 }
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini guidance request failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
  return text || null;
}

export interface UnexploredSuggestionsInput {
  coords?: { lat: number; lng: number };
  interests?: string;
  maxItems?: number;
  places: Place[];
}

export async function getUnexploredSuggestions(input: UnexploredSuggestionsInput): Promise<string | null> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) return null;

  const name = input.coords ? `${input.coords.lat.toFixed(3)}, ${input.coords.lng.toFixed(3)}` : "destination";
  const maxItems = Math.max(3, Math.min(12, input.maxItems ?? 8));
  const placesBrief = input.places.slice(0, 40).map((p, i) => `${i + 1}. ${p.name} (${p.category}${p.hasWiki ? ", wiki" : ""}${p.isFlagship ? ", flagship" : ""})`).join("\n");
  const interests = input.interests?.trim() ? `Traveler interests: ${input.interests}` : "";

  const prompt = `From the list below of nearby places around ${name}, pick ${maxItems} lesser-known, off-the-beaten-path recommendations.
- Avoid obvious flagship spots (museums/theme parks/zoos/famous landmarks) and those marked as 'wiki' when more hidden alternatives exist.
- Prefer unique viewpoints, small parks, local galleries, historic corners, or quirky attractions.
- ${interests}
Return bullet points with: Place Name — a short reason (<= 16 words). Keep it concise.`;

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: `${prompt}\n\nPlaces:\n${placesBrief}` }] }
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini unexplored request failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
  return text || null;
}
