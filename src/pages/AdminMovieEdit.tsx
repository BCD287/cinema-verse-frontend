
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieById, updateMovie, Movie } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RequireAuth } from '@/components/RequireAuth';
import { MovieForm } from '@/components/MovieForm';
import { ArrowLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AdminMovieEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadMovie = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const fetchedMovie = await fetchMovieById(parseInt(id));
        setMovie(fetchedMovie);
      } catch (error) {
        console.error('Failed to fetch movie:', error);
        toast({
          title: "Error",
          description: "Failed to load movie details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadMovie();
  }, [id, toast]);
  
  const handleUpdateMovie = async (data: any) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await updateMovie(parseInt(id), data);
      toast({
        title: "Success",
        description: "Movie updated successfully",
      });
      navigate('/admin/movies');
    } catch (error) {
      console.error('Failed to update movie:', error);
      toast({
        title: "Error",
        description: "Failed to update movie",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RequireAuth requireAdmin>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="container py-8 flex-grow">
          <div className="mb-6">
            <button 
              onClick={() => navigate('/admin/movies')}
              className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Movies
            </button>
          
            <h1 className="text-3xl font-bold">Edit Movie</h1>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cinema-accent"></div>
            </div>
          ) : movie ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Movie: {movie.title}</CardTitle>
                <CardDescription>
                  Update the movie details below. All fields marked with * are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MovieForm 
                  movie={movie}
                  onSubmit={handleUpdateMovie}
                  isSubmitting={isSubmitting}
                  submitLabel="Update Movie"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">Movie not found</h3>
              <p className="text-muted-foreground">The movie you're trying to edit doesn't exist</p>
            </div>
          )}
        </div>
        
        <Footer />
      </div>
    </RequireAuth>
  );
};

export default AdminMovieEdit;
