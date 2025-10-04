import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Plus, X, Car, Bike, Footprints } from "lucide-react";
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
}

const RouteForm = ({ onCalculateRoute, isLoading }: RouteFormProps) => {
  const [startLat, setStartLat] = useState("");
  const [startLng, setStartLng] = useState("");
  const [endLat, setEndLat] = useState("");
  const [endLng, setEndLng] = useState("");
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [newCheckpointName, setNewCheckpointName] = useState("");
  const [newCheckpointLat, setNewCheckpointLat] = useState("");
  const [newCheckpointLng, setNewCheckpointLng] = useState("");
  const [newCheckpointNotes, setNewCheckpointNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const start = [parseFloat(startLat), parseFloat(startLng)] as [number, number];
    const end = [parseFloat(endLat), parseFloat(endLng)] as [number, number];

    if (isNaN(start[0]) || isNaN(start[1]) || isNaN(end[0]) || isNaN(end[1])) {
      toast.error("Please enter valid coordinates");
      return;
    }

    onCalculateRoute(start, end, travelMode, checkpoints);
  };

  const addCheckpoint = () => {
    const lat = parseFloat(newCheckpointLat);
    const lng = parseFloat(newCheckpointLng);

    if (!newCheckpointName.trim()) {
      toast.error("Please enter a checkpoint name");
      return;
    }

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Please enter valid checkpoint coordinates");
      return;
    }

    const newCheckpoint: Checkpoint = {
      id: Date.now().toString(),
      name: newCheckpointName,
      coordinates: [lat, lng],
      notes: newCheckpointNotes.trim() || undefined,
    };

    setCheckpoints([...checkpoints, newCheckpoint]);
    setNewCheckpointName("");
    setNewCheckpointLat("");
    setNewCheckpointLng("");
    setNewCheckpointNotes("");
    toast.success("Checkpoint added!");
  };

  const removeCheckpoint = (id: string) => {
    setCheckpoints(checkpoints.filter((cp) => cp.id !== id));
    toast.success("Checkpoint removed");
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
          {/* Start Point */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Start Point
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                step="any"
                placeholder="Latitude"
                value={startLat}
                onChange={(e) => setStartLat(e.target.value)}
                required
              />
              <Input
                type="number"
                step="any"
                placeholder="Longitude"
                value={startLng}
                onChange={(e) => setStartLng(e.target.value)}
                required
              />
            </div>
          </div>

          {/* End Point */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-secondary" />
              End Point
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                step="any"
                placeholder="Latitude"
                value={endLat}
                onChange={(e) => setEndLat(e.target.value)}
                required
              />
              <Input
                type="number"
                step="any"
                placeholder="Longitude"
                value={endLng}
                onChange={(e) => setEndLng(e.target.value)}
                required
              />
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
            <Label className="text-base font-semibold">Checkpoints</Label>
            
            {checkpoints.length > 0 && (
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
            )}

            {/* Add Checkpoint Form */}
            <div className="space-y-2 p-4 rounded-lg border border-dashed">
              <Input
                placeholder="Checkpoint name (e.g., Rest Stop)"
                value={newCheckpointName}
                onChange={(e) => setNewCheckpointName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={newCheckpointLat}
                  onChange={(e) => setNewCheckpointLat(e.target.value)}
                />
                <Input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={newCheckpointLng}
                  onChange={(e) => setNewCheckpointLng(e.target.value)}
                />
              </div>
              <Input
                placeholder="Notes (optional)"
                value={newCheckpointNotes}
                onChange={(e) => setNewCheckpointNotes(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addCheckpoint}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Checkpoint
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            variant="hero"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Calculating..." : "Calculate Route"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RouteForm;
