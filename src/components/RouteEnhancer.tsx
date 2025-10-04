import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RouteData } from "@/types/route";
import { generateRouteEnhancements } from "@/lib/gemini";
import { Loader2, MapPin, RefreshCw } from "lucide-react";

interface RouteEnhancerProps {
  routeData: RouteData;
}

interface EnhancementPlan {
  place: string;
  description: string;
  stopDurationMinutes: number;
  lat?: number;
  lng?: number;
}

const RouteEnhancer = ({ routeData }: RouteEnhancerProps) => {
  const [plans, setPlans] = useState<EnhancementPlan[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const summary = useMemo(() => {
    // Reduce geometry for prompt brevity
    const pts = routeData.geometry || [];
    const sampleEvery = Math.max(1, Math.floor(pts.length / 20));
    const sampled = pts.filter((_, i) => i % sampleEvery === 0);
    const start = pts[0];
    const end = pts[pts.length - 1];
    return { start, end, sampled };
  }, [routeData.geometry]);

  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateRouteEnhancements({
        start: summary.start,
        end: summary.end,
        sample: summary.sampled,
        distanceMeters: routeData.distance,
        durationSeconds: routeData.duration,
      });

      // Ensure at least 5 and distinct durations if possible
      const uniqueByDuration: Record<number, boolean> = {};
      const deduped = result.filter((p) => {
        if (!p || typeof p.stopDurationMinutes !== "number") return false;
        if (uniqueByDuration[p.stopDurationMinutes]) return false;
        uniqueByDuration[p.stopDurationMinutes] = true;
        return true;
      });

      setPlans((deduped.length >= 5 ? deduped : result).slice(0, 5));
    } catch (e: any) {
      setError(e?.message || "Failed to generate suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-generate when route data changes
    if (routeData?.geometry?.length) {
      fetchPlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeData.distance, routeData.duration]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Route enhancer</CardTitle>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={fetchPlans} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!plans && isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing suggestions...
          </div>
        )}

        {plans && (
          <ul className="space-y-3">
            {plans.map((p, idx) => (
              <li key={`${p.place}-${idx}`} className="p-4 rounded-lg border bg-muted/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">{p.place}</span>
                  </div>
                  <Badge variant="outline">~{p.stopDurationMinutes} min</Badge>
                </div>
                {p.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                )}
                {(p.lat !== undefined && p.lng !== undefined) && (
                  <p className="mt-1 text-xs text-muted-foreground">{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        {!isLoading && !plans && !error && (
          <div className="text-sm text-muted-foreground">No suggestions yet.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteEnhancer;