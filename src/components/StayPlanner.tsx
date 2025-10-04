import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { fetchNearbyPlaces, Place } from "@/lib/places";
import { getNearbyGuidance } from "@/lib/geminiGuidance";

interface StayPlannerProps {
  endPoint: [number, number];
}

interface DayPlanItem {
  name: string;
  startMin: number; // minutes since 00:00 local
  endMin: number;
  lat: number;
  lng: number;
}

interface DayPlan {
  day: number;
  items: DayPlanItem[];
}

function hhmmToMin(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm?.trim() || "");
  if (!m) return 9 * 60; // 09:00 default
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const mi = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return h * 60 + mi;
}

function minToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function buildDayWisePlan(places: Place[], days: number, arrivalHHMM: string, departureHHMM: string): DayPlan[] {
  const dayStartDefault = 9 * 60;
  const dayEndDefault = 19 * 60;
  const arrMin = hhmmToMin(arrivalHHMM);
  const depMin = hhmmToMin(departureHHMM);

  // Copy and sort places by estimated duration descending then name
  const remaining = [...places].sort((a, b) => b.estDurationMin - a.estDurationMin || a.name.localeCompare(b.name));

  const plans: DayPlan[] = [];
  for (let d = 1; d <= days; d++) {
    let start = d === 1 ? Math.min(dayEndDefault, Math.max(0, arrMin)) : dayStartDefault;
    let end = d === days ? Math.max(dayStartDefault, Math.min(24 * 60, depMin)) : dayEndDefault;
    if (start >= end) {
      plans.push({ day: d, items: [] });
      continue;
    }

    let t = start;
    const items: DayPlanItem[] = [];

    // Greedy packing with 15m buffer between items
    for (let i = 0; i < remaining.length; ) {
      const p = remaining[i];
      const duration = Math.min(180, Math.max(20, p.estDurationMin));
      if (t + duration > end) {
        i++;
        continue;
      }
      items.push({ name: p.name, startMin: t, endMin: t + duration, lat: p.lat, lng: p.lng });
      t = t + duration + 15; // buffer
      remaining.splice(i, 1);
      if (t >= end) break;
    }

    plans.push({ day: d, items });
  }

  return plans;
}

const StayPlanner = ({ endPoint }: StayPlannerProps) => {
  const [days, setDays] = useState(2);
  const [arrival, setArrival] = useState("10:00");
  const [departure, setDeparture] = useState("18:00");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DayPlan[] | null>(null);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [guidanceError, setGuidanceError] = useState<string | null>(null);

  const coordStr = useMemo(() => `${endPoint[0].toFixed(4)}, ${endPoint[1].toFixed(4)}`, [endPoint]);

  const suggestPlan = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      const places = await fetchNearbyPlaces(endPoint[0], endPoint[1], 3000, 40);
      if (!places.length) {
        setError("No nearby places found. Try a different destination or a larger radius.");
        return;
      }
      const plan = buildDayWisePlan(places, Math.max(1, Math.min(14, days)), arrival, departure);
      setResults(plan);

      // Try to fetch AI guidance (optional)
      setGuidance(null);
      setGuidanceError(null);
      setGuidanceLoading(true);
      try {
        const text = await getNearbyGuidance({
          destinationLabel: undefined,
          coords: { lat: endPoint[0], lng: endPoint[1] },
          days,
          arrivalHHMM: arrival,
          departureHHMM: departure,
          places,
        });
        setGuidance(text);
      } catch (e: any) {
        setGuidanceError(e?.message || "Failed to get AI guidance");
      } finally {
        setGuidanceLoading(false);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to fetch nearby places");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Stay Planner (near destination)</CardTitle>
        <Badge variant="outline">
          <MapPin className="h-3 w-3 mr-1" /> {coordStr}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Days</Label>
            <Input
              type="number"
              min={1}
              max={14}
              value={days}
              onChange={(e) => setDays(Number(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-1">
            <Label>Arrival time (Day 1)</Label>
            <Input
              type="time"
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Departure time (Last Day)</Label>
            <Input
              type="time"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={suggestPlan} disabled={isLoading} variant="hero">
            {isLoading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" /> Planning...
              </>
            ) : (
              "Suggest Nearby Plan"
            )}
          </Button>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        {results && (
          <div className="space-y-4">
            {/* AI Guidance (optional) */}
            <div className="p-4 rounded-lg border bg-background/60">
              <div className="font-semibold mb-2">AI Guidance</div>
              {guidanceLoading && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 animate-spin" /> Generating tips...
                </div>
              )}
              {!guidanceLoading && guidanceError && (
                <div className="text-sm text-red-600">{guidanceError}</div>
              )}
              {!guidanceLoading && !guidanceError && guidance && (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">{guidance}</div>
              )}
              {!guidanceLoading && !guidanceError && guidance === null && (
                <div className="text-sm text-muted-foreground">Set VITE_GEMINI_API_KEY to enable AI guidance.</div>
              )}
            </div>

            {results.map((day) => (
              <div key={day.day} className="p-4 rounded-lg border bg-muted/40">
                <div className="font-semibold mb-2">Day {day.day}</div>
                {day.items.length ? (
                  <ul className="space-y-2">
                    {day.items.map((it, idx) => (
                      <li key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-primary" />
                          <span className="font-medium">{it.name}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {minToHHMM(it.startMin)} - {minToHHMM(it.endMin)}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">No time available on this day.</div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StayPlanner;
