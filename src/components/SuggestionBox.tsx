import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Compass, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { fetchNearbyPlaces, Place, PlaceCategory } from "@/lib/places";
import { getUnexploredSuggestions } from "@/lib/geminiGuidance";

interface SuggestionBoxProps {
  endPoint?: [number, number];
  onAddCheckpoint?: (cp: { name: string; coordinates: [number, number] }) => void;
  onSetDestination?: (coords: [number, number]) => void;
  onUpdateSuggested?: (items: { name: string; coordinates: [number, number]; category?: string }[]) => void;
}

const SuggestionBox = ({ endPoint, onAddCheckpoint, onSetDestination, onUpdateSuggested }: SuggestionBoxProps) => {
  const [radiusKm, setRadiusKm] = useState(3);
  const [interests, setInterests] = useState("");
  const [maxItems, setMaxItems] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [aiText, setAiText] = useState<string | null>(null);
  const [catFilters, setCatFilters] = useState<Record<PlaceCategory, boolean>>({
    attraction: true,
    museum: true,
    gallery: true,
    viewpoint: true,
    park: true,
    zoo: true,
    historic: true,
    other: true,
  });

  const run = async () => {
    if (!endPoint) {
      setError("Set a destination to get suggestions.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAiText(null);
    setPlaces(null);
    try {
      const found = await fetchNearbyPlaces(endPoint[0], endPoint[1], Math.max(500, Math.round(radiusKm * 1000)), 60);
      // Heuristic: prefer lesser-known (no wiki and not flagship)
      const unexplored = found.filter(p => !p.hasWiki && !p.isFlagship);
      const allowedCats = new Set(Object.entries(catFilters).filter(([, v]) => v).map(([k]) => k as PlaceCategory));
      const filtered = unexplored.filter(p => allowedCats.has(p.category));
      setPlaces(filtered.slice(0, 40));
      onUpdateSuggested?.(filtered.slice(0, 40).map(p => ({ name: p.name, coordinates: [p.lat, p.lng] as [number, number], category: p.category })));

      try {
        const text = await getUnexploredSuggestions({
          coords: { lat: endPoint[0], lng: endPoint[1] },
          interests,
          maxItems,
          places: unexplored,
        });
        setAiText(text);
      } catch (e: any) {
        setAiText(null);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to get suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" /> Suggestion Box
        </CardTitle>
        {endPoint && (
          <Badge variant="outline"><MapPin className="h-3 w-3 mr-1" /> {endPoint[0].toFixed(3)}, {endPoint[1].toFixed(3)}</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Radius (km)</Label>
            <Input type="number" min={0.5} step={0.5} value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value) || 1)} />
          </div>
          <div className="space-y-1">
            <Label>Max items</Label>
            <Input type="number" min={3} max={12} value={maxItems} onChange={(e) => setMaxItems(Math.max(3, Math.min(12, Number(e.target.value) || 8)))} />
          </div>
          <div className="space-y-1 sm:col-span-3">
            <Label>Interests (optional)</Label>
            <Textarea placeholder="e.g., street art, hidden cafés, local crafts, quiet viewpoints" value={interests} onChange={(e) => setInterests(e.target.value)} />
          </div>
          <div className="space-y-1 sm:col-span-3">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2 text-xs">
              {(Object.keys(catFilters) as PlaceCategory[]).map((cat) => (
                <label key={cat} className="inline-flex items-center gap-1 border rounded px-2 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!catFilters[cat]}
                    onChange={(e) => setCatFilters((prev) => ({ ...prev, [cat]: e.target.checked }))}
                  />
                  <span className="capitalize">{cat}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={run} disabled={isLoading || !endPoint} variant="hero">
            {isLoading ? (<><Clock className="h-4 w-4 mr-2 animate-spin" /> Finding...</>) : "Suggest Unexplored Places"}
          </Button>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        {aiText && (
          <div className="p-4 rounded-lg border bg-background/60">
            <div className="font-semibold mb-2">AI Suggestions</div>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">{aiText}</div>
          </div>
        )}

        {places && places.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Candidate places (lesser-known):</div>
            <ul className="space-y-1 text-sm">
              {places.slice(0, 20).map((p, i) => (
                <li key={`${p.name}-${i}`} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground ml-2">{p.category}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onAddCheckpoint?.({ name: p.name, coordinates: [p.lat, p.lng] })}
                      title="Add as checkpoint"
                    >
                      Add to Route
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onSetDestination?.([p.lat, p.lng])}
                      title="Set as destination"
                    >
                      Set as Destination
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {!places && !aiText && !isLoading && !error && (
          <div className="text-sm text-muted-foreground">Set a destination and click "Suggest Unexplored Places" to get recommendations.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuggestionBox;
