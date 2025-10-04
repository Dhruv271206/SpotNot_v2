import { MapPin, Leaf, Bike, Navigation, Clock, BarChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import featureRoute from "@/assets/feature-route.png";
import featureEco from "@/assets/feature-eco.png";
import featureModes from "@/assets/feature-modes.png";

const Features = () => {
  const features = [
    {
      icon: MapPin,
      title: "Custom Checkpoints",
      description: "Add unlimited waypoints and checkpoints to your route. Mark important stops, scenic viewpoints, and must-visit locations.",
      image: featureRoute,
    },
    {
      icon: Leaf,
      title: "Smart Route Options",
      description: "Compare route options with live estimates. Choose the paths that best match your goals and travel preferences.",
      image: featureEco,
    },
    {
      icon: Bike,
      title: "Multiple Travel Modes",
      description: "Plan routes for driving, cycling, or walking. Get accurate time and distance estimates for each mode of transportation.",
      image: featureModes,
    },
    {
      icon: Navigation,
      title: "Interactive Maps",
      description: "Visualize your entire journey with detailed interactive maps. See elevation, terrain, and points of interest along your route.",
    },
    {
      icon: Clock,
      title: "Time Estimates",
      description: "Get accurate travel time predictions based on real traffic data and your chosen mode of transportation.",
    },
    {
      icon: BarChart,
      title: "Route Analytics",
      description: "View detailed statistics about your route including distance, duration, and elevation changes.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Navigation className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powerful Features</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need for the{" "}
            <span className="text-gradient">Perfect Journey</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Plan smarter, travel better, and reduce your environmental impact with our comprehensive route planning tools.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border hover:border-primary/50 transition-all hover:shadow-lg group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                {feature.image ? (
                  <div className="mb-4 h-32 flex items-center justify-center">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="h-full w-auto object-contain group-hover:scale-110 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="mb-4 p-3 rounded-lg bg-gradient-hero w-fit">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
