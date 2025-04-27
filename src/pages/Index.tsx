import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMovies, Movie } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MovieCard } from '@/components/MovieCard';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated, token } = useAuth();
  const PLACEHOLDER_MOVIES = [
    {
      id: 1,
      title: "The Dark Knight",
      description: "Batman fights against the Joker in an epic battle for Gotham City's soul.",
      poster_url: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070",
      genre: "Action",
      release_date: "2022-01-15"
    },
    {
      id: 2,
      title: "Inception",
      description: "A thief who enters people's dreams to steal their secrets faces his biggest challenge.",
      poster_url: "https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=2070",
      genre: "Sci-Fi",
      release_date: "2022-02-20"
    },
    {
      id: 3,
      title: "Interstellar",
      description: "Explorers travel through a wormhole in space to save humanity.",
      poster_url: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=2056",
      genre: "Sci-Fi",
      release_date: "2022-03-10"
    },
    {
      id: 4,
      title: "The Shawshank Redemption",
      description: "A tale of hope and redemption from within prison walls.",
      poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925",
      genre: "Drama",
      release_date: "2022-04-05"
    }
  ];

  useEffect(() => {
    const loadMovies = async () => {
      try {
        if (!isAuthenticated) {
          // If not authenticated, show placeholder data
          setFeaturedMovies(PLACEHOLDER_MOVIES);
          setLoading(false);
          return;
        }

        console.log('Fetching movies, auth status:', { isAuthenticated, hasToken: !!token });
        const data = await fetchMovies(1, 8);
        setFeaturedMovies(data.movies);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
        toast({
          title: 'Notice',
          description: 'Showing demo data - connect to a backend for real data',
        });
        
        // Set placeholder data in case of error
        setFeaturedMovies(PLACEHOLDER_MOVIES);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [toast, isAuthenticated, token]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="cinema-gradient text-white py-16 sm:py-24">
        <div className="container text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            Your Premier Movie Experience
          </h1>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Book your tickets for the latest blockbusters and enjoy an immersive cinema experience.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-red-900 hover:bg-white/90" asChild>
              <Link to="/movies">Browse Movies</Link>
            </Button>
            {!isAuthenticated && (
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                <Link to="/register">Sign Up Now</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Featured Movies */}
      <section className="py-12">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Featured Movies</h2>
            <Link to="/movies" className="text-cinema-accent hover:underline font-medium">View All</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg aspect-[2/3]"></div>
                  <div className="h-4 bg-gray-200 rounded mt-4 w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded mt-2 w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredMovies.slice(0, 8).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-muted">
        <div className="container">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Why Choose CinemaVerse</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cinema-accent/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-cinema-accent">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Easy Booking</h3>
              <p className="text-muted-foreground">Book tickets in seconds with our intuitive reservation system.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cinema-accent/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-cinema-accent">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Premium Content</h3>
              <p className="text-muted-foreground">Enjoy the latest blockbusters and exclusive releases.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cinema-accent/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-cinema-accent">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Convenient Showtimes</h3>
              <p className="text-muted-foreground">Multiple screening times to fit your busy schedule.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
