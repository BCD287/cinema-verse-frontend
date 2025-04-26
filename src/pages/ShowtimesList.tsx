
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchShowtimes, Showtime } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const ShowtimesList = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchShowtimes = async () => {
      setLoading(true);
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const data = await searchShowtimes(formattedDate);
        setShowtimes(data);
      } catch (error) {
        console.error('Failed to fetch showtimes:', error);
        toast({
          title: "Error",
          description: "Failed to load showtimes",
          variant: "destructive",
        });
        
        // Set demo data with corrected types
        setShowtimes([
          {
            id: 1,
            movie_id: 1, // Add missing property
            movie_title: "The Dark Knight",
            start_time: new Date().toISOString(),
            duration: 165, // Add missing property (in minutes)
            available_seats: 45
          },
          {
            id: 2,
            movie_id: 2, // Add missing property
            movie_title: "Inception",
            start_time: new Date(Date.now() + 3600000).toISOString(),
            duration: 148, // Add missing property (in minutes)
            available_seats: 32
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [selectedDate, toast]);

  const groupShowtimesByMovie = (showtimes: Showtime[]) => {
    return showtimes.reduce((groups: Record<string, Showtime[]>, showtime) => {
      (groups[showtime.movie_title] = groups[showtime.movie_title] || []).push(showtime);
      return groups;
    }, {});
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return format(date, 'h:mm a');
  };

  const groupedShowtimes = groupShowtimesByMovie(showtimes);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8">Showtimes</h1>
        
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="md:w-1/3 lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>Choose a date to see available showtimes</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border pointer-events-auto"
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const twoWeeksLater = new Date(today);
                    twoWeeksLater.setDate(today.getDate() + 14);
                    return date < today || date > twoWeeksLater;
                  }}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="flex-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-cinema-accent" />
                  <CardTitle>Showtimes for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="flex flex-wrap gap-2">
                          {[...Array(4)].map((_, j) => (
                            <div key={j} className="h-10 bg-gray-100 rounded w-24"></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : Object.keys(groupedShowtimes).length > 0 ? (
                  <div className="space-y-8">
                    {Object.entries(groupedShowtimes).map(([movieTitle, movieShowtimes]) => (
                      <div key={movieTitle} className="animate-fade-in">
                        <h3 className="text-lg font-semibold mb-3">{movieTitle}</h3>
                        <div className="flex flex-wrap gap-3">
                          {movieShowtimes.map((showtime) => (
                            <Popover key={showtime.id}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="h-auto py-2">
                                  <div className="text-left">
                                    <div className="flex items-center font-medium">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {formatTime(showtime.start_time)}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {showtime.available_seats} seats
                                    </div>
                                  </div>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-56 p-4" align="center">
                                <div className="space-y-2 text-center">
                                  <h4 className="font-medium">{movieTitle}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(showtime.start_time), 'MMMM d, yyyy')}
                                  </p>
                                  <p className="text-sm font-medium">
                                    Time: {formatTime(showtime.start_time)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {showtime.available_seats} seats available
                                  </p>
                                  <Button 
                                    className="w-full mt-2 bg-cinema-accent hover:bg-cinema-accent/90" 
                                    size="sm"
                                    asChild
                                  >
                                    <Link to={`/book/${showtime.id}`}>Book Now</Link>
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium mb-2">No showtimes available</h3>
                    <p className="text-muted-foreground">
                      There are no screenings scheduled for this date. Please try another date.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ShowtimesList;
