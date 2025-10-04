import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import { RouteData } from "@/types/route";
import { useEffect, useMemo, useState } from "react";
import { buildItinerary, ItineraryStop } from "@/lib/itinerary";

interface ItineraryProps {
  routeData: RouteData;
}

function formatRel(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const Itinerary = ({ routeData }: ItineraryProps) => {
  const [stops, setStops] = useState<ItineraryStop[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => ({
    distance: routeData.distance,
    duration: routeData.duration,
    points: routeData.geometry?.length || 0,
  }), [routeData]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await buildItinerary(routeData);
        if (mounted) setStops(result);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to build itinerary");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    if (routeData?.geometry?.length) {
      run();
    }

    return () => { mounted = false; };
  }, [routeData]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Planned Journey</CardTitle>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{(summary.distance / 1000).toFixed(1)} km</span>
          <span>·</span>
          <span>{formatRel(Math.round(summary.duration / 60))}</span>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-3 text-sm text-red-600">{error}</div>
        )}

        {!stops && isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 animate-spin" /> Building itinerary...
          </div>
        )}

        {stops && (
          <ol className="space-y-3">
            {stops.map((s) => (
              <li key={s.order} className="p-4 rounded-lg border bg-muted/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{s.order}</Badge>
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">{s.place}</span>
                  </div>
                  <Badge variant="secondary">Stop {s.stopDurationMinutes}m</Badge>
                </div>
                {s.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  Arrive ~ {formatRel(s.arriveMinutes)} · Depart ~ {formatRel(s.departMinutes)}
                </div>
                {(typeof s.lat === 'number' && typeof s.lng === 'number') && (
                  <p className="mt-1 text-xs text-muted-foreground">{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</p>
                )}
              </li>
            ))}
          </ol>
        )}

        {!isLoading && !stops && !error && (
          <div className="text-sm text-muted-foreground">No itinerary yet.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default Itinerary;
