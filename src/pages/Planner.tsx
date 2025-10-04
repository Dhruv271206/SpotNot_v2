import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RouteForm from "@/components/RouteForm";
import RouteMap from "@/components/RouteMap";
import RouteDetails from "@/components/RouteDetails";
import { Checkpoint, TravelMode, RouteData } from "@/types/route";
import { toast } from "sonner";

const Planner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [startPoint, setStartPoint] = useState<[number, number] | undefined>();
  const [endPoint, setEndPoint] = useState<[number, number] | undefined>();
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | undefined>();
  const [checkpointCounter, setCheckpointCounter] = useState(1);
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");

  // Get user's current location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      toast.info("Getting your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          console.log('[Planner] Geolocation success', { userLocation });
          setCurrentLocation(userLocation);
          // Auto-set as start point
          setStartPoint(userLocation);
          toast.success("Location detected and set as start point!");
        },
        (error) => {
          console.error("[Planner] Error getting location:", error);
          toast.error("Could not get your location. Please click on map to set points.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  }, []);

  // Handle map clicks to place markers
  const handleMapClick = (lat: number, lng: number) => {
    console.log('[Planner] Map click at', { lat, lng });
    const clickedPoint: [number, number] = [lat, lng];

    if (!startPoint) {
      console.log('[Planner] Setting startPoint', clickedPoint);
      setStartPoint(clickedPoint);
      toast.success("Start point set!");
    } else if (!endPoint) {
      console.log('[Planner] Setting endPoint', clickedPoint);
      setEndPoint(clickedPoint);
      toast.success("End point set!");
    } else {
      // Add as checkpoint
      const newCheckpoint: Checkpoint = {
        id: Date.now().toString(),
        name: `Checkpoint ${checkpointCounter}`,
        coordinates: clickedPoint,
      };
      console.log('[Planner] Adding checkpoint', newCheckpoint);
      setCheckpoints([...checkpoints, newCheckpoint]);
      setCheckpointCounter(checkpointCounter + 1);
      toast.success(`Checkpoint ${checkpointCounter} added!`);
    }
  };

  // Mark checkpoint as reached and optionally recalc route
  const handleCheckpointReached = async (id: string) => {
    console.log('[Planner] Mark checkpoint reached', { id });
    const remaining = checkpoints.filter((cp) => cp.id !== id);
    setCheckpoints(remaining);

    try {
      const newStart = currentLocation || startPoint;
      if (newStart && endPoint) {
        console.log('[Planner] Recalculating route after checkpoint reached', { newStart, endPoint, travelMode, remaining });
        await calculateRoute(newStart, endPoint, travelMode, remaining);
        toast.success("Checkpoint marked as reached and route updated");
      } else {
        toast.success("Checkpoint marked as reached");
      }
    } catch (e) {
      console.error('[Planner] Error recalculating after checkpoint reached', e);
    }
  };
   const calculateRoute = async (
    start: [number, number],
    end: [number, number],
    mode: TravelMode,
    routeCheckpoints: Checkpoint[]
  ) => {
    console.log('[Planner] Calculate route requested', { start, end, mode, checkpoints: routeCheckpoints });
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const { routeWithOSRM } = await import("@/lib/routing");
      const data = await routeWithOSRM({
        start,
        end,
        mode,
        checkpoints: routeCheckpoints,
        signal: controller.signal,
      });
      console.log('[Planner] Routing success', { distance: data.distance, duration: data.duration, points: data.geometry.length });
      setRouteData(data);
      toast.success("Route calculated successfully!");
    } catch (error) {
      console.error("[Planner] Error calculating route:", error);
      toast.error("Failed to calculate route. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">
              Route <span className="text-gradient">Planner</span>
            </h1>
            <p className="text-muted-foreground">
              Plan your journey with custom checkpoints and see detailed route information.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <RouteForm 
                onCalculateRoute={calculateRoute} 
                isLoading={isLoading}
                startPoint={startPoint}
                endPoint={endPoint}
                checkpoints={checkpoints}
                onStartPointChange={setStartPoint}
                onEndPointChange={setEndPoint}
                onCheckpointsChange={setCheckpoints}
                onCheckpointReached={handleCheckpointReached}
                onTravelModeChange={setTravelMode}
                currentLocation={currentLocation}
              />
              {routeData && <RouteDetails routeData={routeData} />}
            </div>

            <div className="lg:col-span-2">
              <RouteMap
                routeGeometry={routeData?.geometry}
                startPoint={startPoint}
                endPoint={endPoint}
                checkpoints={checkpoints}
                onMapClick={handleMapClick}
                currentLocation={currentLocation}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Planner;
