import { Map, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="p-2 rounded-lg gradient-hero">
            <Map className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">SpotNot</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/planner" className="text-foreground hover:text-primary transition-colors">
            Route Planner
          </Link>
          <a href="#features" className="text-foreground hover:text-primary transition-colors">
            Features
          </a>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link to="/planner">
            <Button variant="hero">
              Start Planning
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
