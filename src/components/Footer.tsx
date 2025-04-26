
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-cinema-accent" />
              <span className="text-lg font-bold">CinemaVerse</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Your ultimate cinema booking experience
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-4 text-sm">
            <Link to="/movies" className="hover:text-cinema-accent transition-colors">
              Movies
            </Link>
            <Link to="/showtimes" className="hover:text-cinema-accent transition-colors">
              Showtimes
            </Link>
            <Link to="/about" className="hover:text-cinema-accent transition-colors">
              About Us
            </Link>
            <Link to="/terms" className="hover:text-cinema-accent transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-cinema-accent transition-colors">
              Privacy Policy
            </Link>
            <Link to="/contact" className="hover:text-cinema-accent transition-colors">
              Contact
            </Link>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          <p>&copy; {year} CinemaVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
