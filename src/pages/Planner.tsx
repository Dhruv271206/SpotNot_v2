import { useState } from "react";
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

  const calculateRoute = async (
    start: [number, number],
    end: [number, number],
    mode: TravelMode,
    routeCheckpoints: Checkpoint[]
  ) => {
    setIsLoading(true);
    setStartPoint(start);
    setEndPoint(end);
    setCheckpoints(routeCheckpoints);

    try {
      // Mock route calculation - in production, this would call OpenRouteService API
      // For now, creating a simple straight line route with mock data
      const distance = calculateDistance(start, end);
      const duration = calculateDuration(distance, mode);
      const co2 = calculateCO2(distance, mode);

      // Create a simple route geometry (straight line)
      const geometry: [number, number][] = [start];
      
      // Add checkpoint coordinates to geometry
      routeCheckpoints.forEach(checkpoint => {
        geometry.push(checkpoint.coordinates);
      });
      
      geometry.push(end);

      const mockRouteData: RouteData = {
        distance,
        duration,
        co2Emission: co2,
        geometry,
      };

      setRouteData(mockRouteData);
      toast.success("Route calculated successfully!");
    } catch (error) {
      console.error("Error calculating route:", error);
      toast.error("Failed to calculate route. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for mock calculations
  const calculateDistance = (start: [number, number], end: [number, number]): number => {
    // Haversine formula for distance between two points
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (start[0] * Math.PI) / 180;
    const φ2 = (end[0] * Math.PI) / 180;
    const Δφ = ((end[0] - start[0]) * Math.PI) / 180;
    const Δλ = ((end[1] - start[1]) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const calculateDuration = (distance: number, mode: TravelMode): number => {
    // Average speeds in km/h
    const speeds = {
      driving: 60,
      cycling: 20,
      walking: 5,
    };
    
    const distanceKm = distance / 1000;
    const hours = distanceKm / speeds[mode];
    return hours * 3600; // Convert to seconds
  };

  const calculateCO2 = (distance: number, mode: TravelMode): number => {
    // CO2 emissions in kg per km
    const emissions = {
      driving: 0.12, // Average car
      cycling: 0,
      walking: 0,
    };

    const distanceKm = distance / 1000;
    return distanceKm * emissions[mode];
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
              <RouteForm onCalculateRoute={calculateRoute} isLoading={isLoading} />
              {routeData && <RouteDetails routeData={routeData} />}
            </div>

            <div className="lg:col-span-2">
              <RouteMap
                routeGeometry={routeData?.geometry}
                startPoint={startPoint}
                endPoint={endPoint}
                checkpoints={checkpoints}
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
