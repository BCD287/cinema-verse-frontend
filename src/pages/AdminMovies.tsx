
import { useState, useEffect, useRef } from 'react';
import { fetchMovies, createMovie, updateMovie, deleteMovie, uploadPoster, Movie } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RequireAuth } from '@/components/RequireAuth';
import { format } from 'date-fns';
import { Plus, Edit, Trash, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteMovieId, setDeleteMovieId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMovieDialogOpen, setIsMovieDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [selectedPoster, setSelectedPoster] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  
  useEffect(() => {
    loadMovies();
  }, []);
  
  const loadMovies = async () => {
    setLoading(true);
    try {
      const data = await fetchMovies();
      setMovies(data.movies);
    } catch (error) {
      console.error('Failed to fetch movies:', error);
      toast({
        title: "Error",
        description: "Failed to load movies",
        variant: "destructive",
      });
      
      // Set demo data for UI
      setMovies([
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
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setGenre('');
    setReleaseDate('');
    setPosterUrl('');
    setSelectedPoster(null);
    setPreviewUrl('');
    setEditingMovie(null);
  };
  
  const handleOpenMovieDialog = (movie: Movie | null = null) => {
    resetForm();
    
    if (movie) {
      setEditingMovie(movie);
      setTitle(movie.title);
      setDescription(movie.description);
      setGenre(movie.genre);
      setReleaseDate(movie.release_date.substring(0, 10)); // Format YYYY-MM-DD
      setPosterUrl(movie.poster_url);
      setPreviewUrl(movie.poster_url);
    }
    
    setIsMovieDialogOpen(true);
  };
  
  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedPoster(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !genre || !releaseDate) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      let finalPosterUrl = posterUrl;
      
      // Upload poster if selected
      if (selectedPoster) {
        const uploadResult = await uploadPoster(selectedPoster);
        finalPosterUrl = uploadResult.url;
      }
      
      const movieData = {
        title,
        description,
        genre,
        release_date: releaseDate,
        poster_url: finalPosterUrl
      };
      
      if (editingMovie) {
        // Update existing movie
        await updateMovie(editingMovie.id, movieData);
        
        setMovies(prev => 
          prev.map(m => 
            m.id === editingMovie.id
              ? { ...m, ...movieData }
              : m
          )
        );
        
        toast({
          title: "Success",
          description: "Movie updated successfully",
        });
      } else {
        // Create new movie
        const result = await createMovie(movieData);
        
        setMovies(prev => [
          { id: result.movie_id, ...movieData },
          ...prev
        ]);
        
        toast({
          title: "Success",
          description: "Movie created successfully",
        });
      }
      
      setIsMovieDialogOpen(false);
      resetForm();
      
    } catch (error) {
      console.error('Failed to save movie:', error);
      toast({
        title: "Error",
        description: "Failed to save movie",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const confirmDelete = (id: number) => {
    setDeleteMovieId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteMovie = async () => {
    if (!deleteMovieId) return;
    
    try {
      await deleteMovie(deleteMovieId);
      
      setMovies(prev => prev.filter(movie => movie.id !== deleteMovieId));
      
      toast({
        title: "Success",
        description: "Movie deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete movie:', error);
      toast({
        title: "Error",
        description: "Failed to delete movie",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteMovieId(null);
    }
  };
  
  return (
    <RequireAuth requireAdmin>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="container py-8 flex-grow">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Manage Movies</h1>
            
            <Button onClick={() => handleOpenMovieDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Movie
            </Button>
          </div>
          
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-cinema-accent mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading movies...</p>
              </div>
            ) : movies.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">ID</TableHead>
                      <TableHead className="w-40">Poster</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Genre</TableHead>
                      <TableHead>Release Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movies.map(movie => (
                      <TableRow key={movie.id}>
                        <TableCell className="font-medium">{movie.id}</TableCell>
                        <TableCell>
                          <img
                            src={movie.poster_url}
                            alt={movie.title}
                            className="w-20 h-28 object-cover rounded-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925';
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{movie.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {movie.description}
                          </div>
                        </TableCell>
                        <TableCell>{movie.genre}</TableCell>
                        <TableCell>
                          {movie.release_date && format(new Date(movie.release_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleOpenMovieDialog(movie)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => confirmDelete(movie.id)}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No movies found.</p>
                <Button onClick={() => handleOpenMovieDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Movie
                </Button>
              </div>
            )}
          </div>
          
          {/* Movie Form Dialog */}
          <Dialog open={isMovieDialogOpen} onOpenChange={setIsMovieDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingMovie ? 'Edit Movie' : 'Add New Movie'}</DialogTitle>
                <DialogDescription>
                  {editingMovie
                    ? 'Update the movie information below.'
                    : 'Fill in the details to add a new movie.'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter movie title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter movie description"
                    required
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre *</Label>
                    <Input
                      id="genre"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      placeholder="E.g. Action, Comedy, Drama"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="releaseDate">Release Date *</Label>
                    <Input
                      id="releaseDate"
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="posterUrl">Poster URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="posterUrl"
                      value={posterUrl}
                      onChange={(e) => setPosterUrl(e.target.value)}
                      placeholder="Enter poster URL or upload a file"
                      disabled={!!selectedPoster}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => posterInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input
                      ref={posterInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePosterChange}
                    />
                  </div>
                  
                  {previewUrl && (
                    <div className="mt-4">
                      <img 
                        src={previewUrl} 
                        alt="Poster Preview" 
                        className="h-40 object-contain rounded-md"
                      />
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsMovieDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving} className="bg-cinema-accent hover:bg-cinema-accent/90">
                    {isSaving ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Saving...
                      </span>
                    ) : (
                      editingMovie ? 'Update Movie' : 'Add Movie'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the movie and all related showtimes and reservations.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteMovie}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <Footer />
      </div>
    </RequireAuth>
  );
};

export default AdminMovies;
