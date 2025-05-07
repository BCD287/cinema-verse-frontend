
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMovie } from '@/services/api';
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

const AdminMovieCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleCreateMovie = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createMovie(data);
      toast({
        title: "Success",
        description: "Movie created successfully",
      });
      navigate('/admin/movies');
    } catch (error) {
      console.error('Failed to create movie:', error);
      toast({
        title: "Error",
        description: "Failed to create movie",
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
          
            <h1 className="text-3xl font-bold">Create New Movie</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Movie Details</CardTitle>
              <CardDescription>
                Enter the details for the new movie. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MovieForm 
                onSubmit={handleCreateMovie}
                isSubmitting={isSubmitting}
                submitLabel="Create Movie"
              />
            </CardContent>
          </Card>
        </div>
        
        <Footer />
      </div>
    </RequireAuth>
  );
};

export default AdminMovieCreate;
