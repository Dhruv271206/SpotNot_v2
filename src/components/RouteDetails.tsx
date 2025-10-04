import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Route, Leaf } from "lucide-react";
import { RouteData } from "@/types/route";

interface RouteDetailsProps {
  routeData: RouteData;
}

const RouteDetails = ({ routeData }: RouteDetailsProps) => {
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Route Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
            <div className="p-2 rounded-lg bg-primary/10">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Distance</div>
              <div className="text-2xl font-bold">{formatDistance(routeData.distance)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
            <div className="p-2 rounded-lg bg-accent/10">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="text-2xl font-bold">{formatDuration(routeData.duration)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10">
            <div className="p-2 rounded-lg bg-success/20">
              <Leaf className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">CO₂ Emission</div>
              <div className="text-2xl font-bold text-success">
                {routeData.co2Emission.toFixed(2)} kg
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              💡 Tip: Consider cycling or walking for shorter distances to reduce your carbon footprint!
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteDetails;
