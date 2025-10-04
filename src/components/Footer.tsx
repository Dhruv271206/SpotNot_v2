import { Map, Github, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg gradient-hero">
                <Map className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">SpotNot</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your ultimate travel planning companion for eco-friendly adventures.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              <a 
                href="https://github.com/Dhruv271206/SpotNot" 
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-border hover:border-primary hover:bg-primary/10 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SpotNot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
