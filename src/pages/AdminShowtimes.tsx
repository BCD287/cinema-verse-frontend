
import { useState, useEffect } from 'react';
import { fetchMovies, createShowtime, Movie } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RequireAuth } from '@/components/RequireAuth';
import { format, parseISO, addHours } from 'date-fns';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SimpleShowtime {
  id: number;
  movie_title: string;
  movie_id: number;
  start_time: string;
  duration: number;
}

const AdminShowtimes = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<SimpleShowtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Form state
  const [selectedMovieId, setSelectedMovieId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [duration, setDuration] = useState<string>('120');
  
  useEffect(() => {
    loadMovies();
    // For simplicity, we're using mock showtimes since the API doesn't have a 'get all showtimes' endpoint
    loadMockShowtimes();
  }, []);
  
  const loadMovies = async () => {
    setLoading(true);
    try {
      const data = await fetchMovies(1, 100); // Get all movies
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
  
  const loadMockShowtimes = () => {
    // Mock data for showtimes
    const now = new Date();
    const tomorrow = addHours(now, 24);
    const dayAfter = addHours(now, 48);
    
    const mockShowtimes: SimpleShowtime[] = [
      {
        id: 1,
        movie_id: 1,
        movie_title: "The Dark Knight",
        start_time: tomorrow.toISOString(),
        duration: 152
      },
      {
        id: 2,
        movie_id: 2,
        movie_title: "Inception",
        start_time: dayAfter.toISOString(),
        duration: 148
      }
    ];
    
    setShowtimes(mockShowtimes);
  };
  
  const resetForm = () => {
    setSelectedMovieId('');
    
    // Default to tomorrow at 18:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setStartDate(format(tomorrow, 'yyyy-MM-dd'));
    setStartTime('18:00');
    
    setDuration('120');
  };
  
  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMovieId || !startDate || !startTime || !duration) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const startDateTime = `${startDate} ${startTime}:00`;
      const movieId = parseInt(selectedMovieId);
      
      // Call API to create showtime
      const result = await createShowtime(
        movieId, 
        startDateTime, 
        parseInt(duration)
      );
      
      // Add to local state
      const movie = movies.find(m => m.id === movieId);
      if (movie) {
        const newShowtime: SimpleShowtime = {
          id: result.showtime_id || showtimes.length + 1,
          movie_id: movieId,
          movie_title: movie.title,
          start_time: new Date(startDateTime).toISOString(),
          duration: parseInt(duration)
        };
        
        setShowtimes(prev => [...prev, newShowtime]);
      }
      
      toast({
        title: "Success",
        description: "Showtime created successfully",
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create showtime:', error);
      toast({
        title: "Error",
        description: "Failed to create showtime",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Group showtimes by date for display
  const showtimesByDate = showtimes.reduce((acc: Record<string, SimpleShowtime[]>, showtime) => {
    const date = format(new Date(showtime.start_time), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(showtime);
    return acc;
  }, {});
  
  // Sort dates in chronological order
  const sortedDates = Object.keys(showtimesByDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });
  
  return (
    <RequireAuth requireAdmin>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="container py-8 flex-grow">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Manage Showtimes</h1>
            
            <Button onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Showtime
            </Button>
          </div>
          
          {loading ? (
            <div className="p-8 text-center bg-card rounded-lg shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-cinema-accent mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading showtimes...</p>
            </div>
          ) : showtimes.length > 0 ? (
            <div className="space-y-8">
              {sortedDates.map(date => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle>
                      {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                    </CardTitle>
                    <CardDescription>
                      {showtimesByDate[date].length} showtime(s) scheduled
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {showtimesByDate[date].map(showtime => (
                        <div key={showtime.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary rounded-md">
                          <div>
                            <h3 className="font-bold">{showtime.movie_title}</h3>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(showtime.start_time), 'h:mm a')} • {showtime.duration} minutes
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2 sm:mt-0">
                            <Button size="sm" variant="outline" asChild>
                              <a href={`/admin/seats/${showtime.id}`}>
                                Manage Seats
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-card rounded-lg shadow-sm">
              <p className="text-muted-foreground mb-4">No showtimes found.</p>
              <Button onClick={handleOpenDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Showtime
              </Button>
            </div>
          )}
          
          {/* Add Showtime Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Showtime</DialogTitle>
                <DialogDescription>
                  Schedule a new movie showing.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="movie">Movie *</Label>
                  <Select value={selectedMovieId} onValueChange={setSelectedMovieId}>
                    <SelectTrigger id="movie">
                      <SelectValue placeholder="Select a movie" />
                    </SelectTrigger>
                    <SelectContent>
                      {movies.map(movie => (
                        <SelectItem key={movie.id} value={movie.id.toString()}>
                          {movie.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="30"
                    max="300"
                    required
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving} className="bg-cinema-accent hover:bg-cinema-accent/90">
                    {isSaving ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Creating...
                      </span>
                    ) : "Create Showtime"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Footer />
      </div>
    </RequireAuth>
  );
};

export default AdminShowtimes;
