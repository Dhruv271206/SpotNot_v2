import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Plus, X, Car, Bike, Footprints, Locate, MapPinned } from "lucide-react";
import { Checkpoint, TravelMode } from "@/types/route";
import { toast } from "sonner";

interface RouteFormProps {
  onCalculateRoute: (
    start: [number, number],
    end: [number, number],
    mode: TravelMode,
    checkpoints: Checkpoint[]
  ) => void;
  isLoading?: boolean;
  startPoint?: [number, number];
  endPoint?: [number, number];
  checkpoints: Checkpoint[];
  onStartPointChange: (point: [number, number] | undefined) => void;
  onEndPointChange: (point: [number, number] | undefined) => void;
  onCheckpointsChange: (checkpoints: Checkpoint[]) => void;
  currentLocation?: [number, number];
}

const RouteForm = ({ 
  onCalculateRoute, 
  isLoading, 
  startPoint,
  endPoint,
  checkpoints,
  onStartPointChange,
  onEndPointChange,
  onCheckpointsChange,
  currentLocation
}: RouteFormProps) => {
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");
  const [newCheckpointName, setNewCheckpointName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startPoint || !endPoint) {
      toast.error("Please set start and end points on the map");
      return;
    }

    onCalculateRoute(startPoint, endPoint, travelMode, checkpoints);
  };

  const clearRoute = () => {
    onStartPointChange(undefined);
    onEndPointChange(undefined);
    onCheckpointsChange([]);
    toast.success("Route cleared");
  };

  const removeCheckpoint = (id: string) => {
    onCheckpointsChange(checkpoints.filter((cp) => cp.id !== id));
    toast.success("Checkpoint removed");
  };

  const getNextAction = () => {
    if (!startPoint) return "Click map to set start point";
    if (!endPoint) return "Click map to set end point";
    return "Click map to add checkpoints";
  };

  const travelModes = [
    { value: "driving" as TravelMode, icon: Car, label: "Driving" },
    { value: "cycling" as TravelMode, icon: Bike, label: "Cycling" },
    { value: "walking" as TravelMode, icon: Footprints, label: "Walking" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          Route Planning
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Action Indicator */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <MapPinned className="h-4 w-4 animate-pulse" />
              {getNextAction()}
            </div>
            {currentLocation && (
              <div className="text-xs text-muted-foreground mt-1">
                Your location: {currentLocation[0].toFixed(4)}, {currentLocation[1].toFixed(4)}
              </div>
            )}
          </div>

          {/* Points Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Start Point</span>
              </div>
              {startPoint ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {startPoint[0].toFixed(4)}, {startPoint[1].toFixed(4)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onStartPointChange(undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Not set</span>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium">End Point</span>
              </div>
              {endPoint ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {endPoint[0].toFixed(4)}, {endPoint[1].toFixed(4)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onEndPointChange(undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Not set</span>
              )}
            </div>
          </div>

          {/* Travel Mode */}
          <div className="space-y-2">
            <Label>Travel Mode</Label>
            <div className="grid grid-cols-3 gap-2">
              {travelModes.map((mode) => (
                <Button
                  key={mode.value}
                  type="button"
                  variant={travelMode === mode.value ? "hero" : "outline"}
                  onClick={() => setTravelMode(mode.value)}
                >
                  <mode.icon className="h-4 w-4 mr-2" />
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Checkpoints Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Checkpoints ({checkpoints.length})
              </Label>
              {checkpoints.length > 0 && startPoint && endPoint && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearRoute}
                >
                  Clear All
                </Button>
              )}
            </div>
            
            {checkpoints.length > 0 ? (
              <div className="space-y-2">
                {checkpoints.map((checkpoint, index) => (
                  <div
                    key={checkpoint.id}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {index + 1}. {checkpoint.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {checkpoint.coordinates[0].toFixed(4)}, {checkpoint.coordinates[1].toFixed(4)}
                      </div>
                      {checkpoint.notes && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {checkpoint.notes}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCheckpoint(checkpoint.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                Click on the map to add checkpoints after setting start and end points
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              variant="hero"
              size="lg"
              className="flex-1"
              disabled={isLoading || !startPoint || !endPoint}
            >
              {isLoading ? "Calculating..." : "Calculate Route"}
            </Button>
            {(startPoint || endPoint || checkpoints.length > 0) && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={clearRoute}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RouteForm;
