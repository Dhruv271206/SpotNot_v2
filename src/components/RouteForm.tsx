import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Plus, X, Car, Bike, Footprints, Locate, MapPinned, Edit3 } from "lucide-react";
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
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualStartLat, setManualStartLat] = useState("");
  const [manualStartLng, setManualStartLng] = useState("");
  const [manualEndLat, setManualEndLat] = useState("");
  const [manualEndLng, setManualEndLng] = useState("");

  // Update manual fields when points change
  useEffect(() => {
    if (startPoint) {
      setManualStartLat(startPoint[0].toString());
      setManualStartLng(startPoint[1].toString());
    }
  }, [startPoint]);

  useEffect(() => {
    if (endPoint) {
      setManualEndLat(endPoint[0].toString());
      setManualEndLng(endPoint[1].toString());
    }
  }, [endPoint]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startPoint || !endPoint) {
      toast.error("Please set start and end points");
      return;
    }

    onCalculateRoute(startPoint, endPoint, travelMode, checkpoints);
  };

  const applyManualCoordinates = () => {
    const startLat = parseFloat(manualStartLat);
    const startLng = parseFloat(manualStartLng);
    const endLat = parseFloat(manualEndLat);
    const endLng = parseFloat(manualEndLng);

    if (!isNaN(startLat) && !isNaN(startLng)) {
      onStartPointChange([startLat, startLng]);
    }
    if (!isNaN(endLat) && !isNaN(endLng)) {
      onEndPointChange([endLat, endLng]);
    }
    toast.success("Coordinates updated!");
  };

  const useCurrentLocation = () => {
    if (currentLocation) {
      onStartPointChange(currentLocation);
      toast.success("Start point set to your location!");
    } else {
      toast.error("Location not available");
    }
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
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <MapPinned className="h-4 w-4 animate-pulse" />
                {getNextAction()}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowManualEntry(!showManualEntry)}
              >
                <Edit3 className="h-3 w-3 mr-1" />
                {showManualEntry ? "Map Mode" : "Manual"}
              </Button>
            </div>
            {currentLocation && (
              <div className="text-xs text-muted-foreground">
                Your location: {currentLocation[0].toFixed(4)}, {currentLocation[1].toFixed(4)}
              </div>
            )}
          </div>

          {/* Manual Entry Mode */}
          {showManualEntry && (
            <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-primary" />
                    Start Coordinates
                  </Label>
                  {currentLocation && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={useCurrentLocation}
                    >
                      <Locate className="h-3 w-3 mr-1" />
                      Use My Location
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={manualStartLat}
                    onChange={(e) => setManualStartLat(e.target.value)}
                  />
                  <Input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={manualStartLng}
                    onChange={(e) => setManualStartLng(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3 w-3 text-secondary" />
                  End Coordinates
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={manualEndLat}
                    onChange={(e) => setManualEndLat(e.target.value)}
                  />
                  <Input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={manualEndLng}
                    onChange={(e) => setManualEndLng(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={applyManualCoordinates}
              >
                Apply Coordinates
              </Button>
            </div>
          )}

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
          <div className="space-y-3">
            <Label>Travel Mode</Label>
            <div className="grid grid-cols-3 gap-3">
              {travelModes.map((mode) => (
                <Button
                  key={mode.value}
                  type="button"
                  variant={travelMode === mode.value ? "hero" : "outline"}
                  onClick={() => setTravelMode(mode.value)}
                  className="flex-col h-auto py-3 gap-1"
                >
                  <mode.icon className="h-5 w-5" />
                  <span className="text-xs">{mode.label}</span>
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
