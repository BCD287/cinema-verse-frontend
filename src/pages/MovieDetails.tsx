
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { searchMovies, Movie } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // The API doesn't have a specific endpoint for a single movie
        // We'll use search API and find the movie by ID
        const movies = await searchMovies();
        const foundMovie = movies.find((m: Movie) => m.id === parseInt(id));
        
        if (foundMovie) {
          setMovie(foundMovie);
        } else {
          // If movie not found, we'll use placeholder data for demo
          setMovie({
            id: parseInt(id),
            title: "Sample Movie",
            description: "This is a placeholder for movie details. In a real application, this data would come from the API.",
            poster_url: "https://via.placeholder.com/150",
            genre: "Drama",
            release_date: "2022-05-15"
          });
          
          toast({
            title: "Notice",
            description: "Using demo data as movie details could not be fetched",
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Failed to fetch movie details:', error);
        toast({
          title: "Error",
          description: "Failed to load movie details",
          variant: "destructive",
        });
        
        // Set demo data for the UI
        setMovie({
          id: parseInt(id),
          title: "Sample Movie",
          description: "This is a placeholder for movie details. In a real application, this data would come from the API.",
          poster_url: "https://via.placeholder.com/150",
          genre: "Drama",
          release_date: "2022-05-15"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="container py-8 flex-grow">
          <div className="flex flex-col md:flex-row gap-8 animate-pulse">
            <div className="w-full md:w-1/3 bg-gray-200 rounded-lg aspect-[2/3]"></div>
            
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-8"></div>
              
              <div className="space-y-2 mb-8">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              </div>
              
              <div className="h-10 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="container py-16 text-center flex-grow">
          <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
          <p className="mb-8 text-muted-foreground">
            The movie you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/movies">Browse All Movies</Link>
          </Button>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container py-8 flex-grow">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src={movie?.poster_url || 'https://via.placeholder.com/150'} 
                alt={movie?.title}
                className="w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                }}
              />
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{movie?.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge className="bg-cinema-accent hover:bg-cinema-accent/90">
                {movie?.genre}
              </Badge>
              
              <div className="flex items-center text-muted-foreground text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                {movie?.release_date && format(parseISO(movie.release_date), 'MMMM d, yyyy')}
              </div>
            </div>
            
            <div className="prose dark:prose-invert mb-8">
              <p className="text-lg">{movie?.description}</p>
            </div>
            
            <Button 
              className="bg-cinema-accent hover:bg-cinema-accent/90"
              size="lg"
              asChild
            >
              <Link to={`/showtimes`}>Book Tickets</Link>
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MovieDetails;
