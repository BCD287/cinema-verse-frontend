
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Search, User, Film, LogIn } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ApiSettings } from '@/components/ApiSettings';

export function Navbar() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="h-6 w-6 text-cinema-accent" />
          <Link to="/" className="text-xl font-bold">
            CinemaVerse
          </Link>
        </div>

        <form onSubmit={handleSearch} className="hidden md:flex items-center w-1/3">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search movies..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="default" size="sm" className="ml-2">
            Search
          </Button>
        </form>

        <nav className="flex items-center gap-2">
          <Link to="/movies" className="text-sm font-medium hover:text-cinema-accent transition-colors">
            Movies
          </Link>
          <Link to="/showtimes" className="text-sm font-medium hover:text-cinema-accent transition-colors ml-4">
            Showtimes
          </Link>

          <div className="flex items-center ml-4">
            <ApiSettings />
            {isAuthenticated ? (
              <div className="flex items-center ml-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {user?.username || 'User'}
                      {isAdmin && <span className="ml-2 text-cinema-accent">(Admin)</span>}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/my-reservations">My Reservations</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin/movies">Manage Movies</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/showtimes">Manage Showtimes</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/reports">Reports</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login" className="flex items-center gap-1">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                </Button>
                <Button className="bg-cinema-accent hover:bg-cinema-accent/90" size="sm" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
