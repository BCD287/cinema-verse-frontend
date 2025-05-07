
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchShowtimes, Showtime } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, isSameDay } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, Film, Ticket } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

const ShowtimesList = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchShowtimes = async () => {
      setLoading(true);
      setError(null);
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        console.log(`Fetching showtimes for date: ${formattedDate}`);
        const data = await searchShowtimes(formattedDate);
        
        console.log('Fetched showtimes data:', data);
        setShowtimes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch showtimes:', error);
        setError('Could not load showtimes. Please try again later.');
        toast({
          title: "Error",
          description: "Failed to load showtimes",
          variant: "destructive",
        });
        
        // Set empty array on error
        setShowtimes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [selectedDate, toast]);

  const groupShowtimesByMovie = (showtimesList: Showtime[]) => {
    if (!Array.isArray(showtimesList) || showtimesList.length === 0) {
      return {};
    }
    
    return showtimesList.reduce((groups: Record<string, Showtime[]>, showtime) => {
      const title = showtime.movie_title || `Movie #${showtime.movie_id}`;
      if (!groups[title]) {
        groups[title] = [];
      }
      groups[title].push(showtime);
      return groups;
    }, {});
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  const groupedShowtimes = groupShowtimesByMovie(showtimes);

  // Generate date tabs for quick navigation
  const dateTabs = Array.from({ length: 5 }, (_, i) => {
    const date = addDays(new Date(), i);
    return date;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container py-8 flex-grow">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Showtimes</h1>
          <div className="flex items-center mt-4 md:mt-0">
            <Badge variant="outline" className="bg-cinema-accent/10 mr-2">
              <CalendarIcon className="h-4 w-4 mr-1" /> 
              {format(selectedDate, 'MMMM d, yyyy')}
            </Badge>
          </div>
        </div>

        {/* Date Selector Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-6">
          {dateTabs.map((date) => (
            <button
              key={date.toISOString()}
              className={`px-4 py-2 min-w-[120px] text-center rounded-md transition-colors mr-2 ${
                isSameDay(date, selectedDate)
                  ? 'bg-cinema-accent text-white font-medium'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
              onClick={() => setSelectedDate(date)}
            >
              <div className="font-medium">{format(date, 'EEE')}</div>
              <div className="text-sm">{format(date, 'MMM d')}</div>
            </button>
          ))}
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
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
                  className="rounded-md border"
                  disabled={(date) => {
                    // Allow dates from today up to 4 days in the future (to align with seed.py which creates 5 days)
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const fourDaysLater = new Date(today);
                    fourDaysLater.setDate(today.getDate() + 4);
                    return date < today || date > fourDaysLater;
                  }}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="flex-1">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-cinema-accent" />
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
                ) : error ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{error}</p>
                    <Button 
                      onClick={() => setSelectedDate(new Date())}
                      variant="outline"
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : Object.keys(groupedShowtimes).length > 0 ? (
                  <div className="space-y-8">
                    {Object.entries(groupedShowtimes).map(([movieTitle, movieShowtimes]) => (
                      <div key={movieTitle} className="animate-fade-in">
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <Film className="h-4 w-4 mr-2 text-cinema-accent" />
                          {movieTitle}
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {Array.isArray(movieShowtimes) && movieShowtimes.map((showtime) => (
                            <Popover key={showtime.id}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="h-auto py-2">
                                  <div className="text-left">
                                    <div className="flex items-center font-medium">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {formatTime(showtime.start_time)}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {showtime.available_seats !== undefined ? 
                                        <span className={showtime.available_seats > 10 ? "text-green-600" : "text-orange-500"}>
                                          {showtime.available_seats} seats
                                        </span> : 
                                        'Loading seats...'}
                                    </div>
                                  </div>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-4" align="center">
                                <div className="space-y-3">
                                  <div className="text-center">
                                    <h4 className="font-medium text-lg">{movieTitle}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(showtime.start_time), 'EEEE, MMMM d, yyyy')}
                                    </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Time:</span>
                                      <p className="font-medium">{formatTime(showtime.start_time)}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Duration:</span>
                                      <p className="font-medium">{showtime.duration} min</p>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground">Seats Available:</span>
                                      <p className="font-medium">
                                        {showtime.available_seats !== undefined ? 
                                          `${showtime.available_seats} seats` : 
                                          'Checking availability...'}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <Button 
                                    className="w-full mt-2 bg-cinema-accent hover:bg-cinema-accent/90" 
                                    size="sm"
                                    asChild
                                  >
                                    <Link to={`/book/${showtime.id}`} className="flex items-center justify-center">
                                      <Ticket className="h-4 w-4 mr-1" />
                                      Book Now
                                    </Link>
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
              <CardFooter className="pt-0 text-sm text-muted-foreground italic border-t mt-4">
                <p>All times shown are in local theater time.</p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ShowtimesList;
