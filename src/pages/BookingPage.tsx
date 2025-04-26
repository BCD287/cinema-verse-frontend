
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { searchShowtimes, createReservation, Showtime, Seat } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Calendar, Clock, Users } from 'lucide-react';

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/book/${id}` } });
      return;
    }
    
    const fetchShowtimeDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // In a real app, you'd fetch both the showtime and seats
        // For demo, we'll create mock data
        
        // Mock showtime
        const mockShowtime: Showtime = {
          id: parseInt(id),
          movie_title: "The Dark Knight",
          start_time: new Date().toISOString(),
          available_seats: 45
        };
        
        setShowtime(mockShowtime);
        
        // Mock seats
        const mockSeats: Seat[] = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
        
        rows.forEach(row => {
          for (let col = 1; col <= 8; col++) {
            mockSeats.push({
              id: mockSeats.length + 1,
              seat_number: `${row}${col}`,
              row,
              column: col,
              showtime_id: parseInt(id),
              is_reserved: Math.random() > 0.7 // Randomly mark some seats as reserved
            });
          }
        });
        
        setSeats(mockSeats);
      } catch (error) {
        console.error('Failed to fetch showtime details:', error);
        toast({
          title: "Error",
          description: "Failed to load showtime details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimeDetails();
  }, [id, toast, navigate, isAuthenticated]);
  
  const handleSeatClick = (seatId: number, isReserved: boolean) => {
    if (isReserved) return;
    
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };
  
  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one seat",
        variant: "destructive",
      });
      return;
    }
    
    setBookingInProgress(true);
    try {
      if (!showtime) throw new Error("No showtime selected");
      
      // In a real app, this would call the real API
      await createReservation(showtime.id, selectedSeats);
      
      toast({
        title: "Success!",
        description: "Your seats have been reserved successfully",
      });
      
      navigate('/my-reservations');
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your reservation",
        variant: "destructive",
      });
    } finally {
      setBookingInProgress(false);
    }
  };
  
  const getSeatClass = (seatId: number, isReserved: boolean) => {
    if (isReserved) return "seat seat-reserved";
    if (selectedSeats.includes(seatId)) return "seat seat-selected";
    return "seat seat-available";
  };
  
  const renderSeats = () => {
    const seatsByRow = seats.reduce((acc, seat) => {
      if (!acc[seat.row]) acc[seat.row] = [];
      acc[seat.row].push(seat);
      return acc;
    }, {} as Record<string, Seat[]>);
    
    return Object.entries(seatsByRow).map(([row, rowSeats]) => (
      <div key={row} className="flex justify-center mb-3">
        <div className="w-6 font-medium flex items-center">{row}</div>
        <div className="flex">
          {rowSeats.map(seat => (
            <button
              key={seat.id}
              className={getSeatClass(seat.id, seat.is_reserved)}
              onClick={() => handleSeatClick(seat.id, seat.is_reserved)}
              disabled={seat.is_reserved}
              title={seat.is_reserved ? "Reserved" : `Seat ${seat.seat_number}`}
            >
              {seat.column}
            </button>
          ))}
        </div>
      </div>
    ));
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="container py-8 flex-grow">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cinema-accent"></div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }
  
  if (!showtime) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="container py-16 text-center flex-grow">
          <h1 className="text-2xl font-bold mb-4">Showtime not found</h1>
          <p className="mb-8 text-muted-foreground">
            The showtime you're looking for doesn't exist or has been cancelled.
          </p>
          <Button asChild>
            <a href="/showtimes">Browse Showtimes</a>
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
        <h1 className="text-3xl font-bold mb-6">Book Tickets</h1>
        
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Select Your Seats</h2>
              
              <div className="mb-8">
                <div className="screen"></div>
                
                <div className="mb-8">
                  {renderSeats()}
                </div>
                
                <div className="flex justify-center gap-8 text-sm">
                  <div className="flex items-center">
                    <div className="seat seat-available w-4 h-4 mr-2"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="seat seat-selected w-4 h-4 mr-2"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center">
                    <div className="seat seat-reserved w-4 h-4 mr-2"></div>
                    <span>Reserved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-card rounded-lg shadow-sm p-6 mb-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              
              <div className="space-y-4 border-b pb-4 mb-4">
                <div>
                  <h3 className="font-medium">{showtime.movie_title}</h3>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="h-4 w-4 mt-0.5" />
                  <span>
                    {format(new Date(showtime.start_time), 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <Clock className="h-4 w-4 mt-0.5" />
                  <span>
                    {format(new Date(showtime.start_time), 'h:mm a')}
                  </span>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <Users className="h-4 w-4 mt-0.5" />
                  <div>
                    <div>Selected seats:</div>
                    <div className="font-medium">
                      {selectedSeats.length > 0 
                        ? selectedSeats.map(id => seats.find(seat => seat.id === id)?.seat_number).join(', ')
                        : 'None selected'
                      }
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>Tickets ({selectedSeats.length})</span>
                  <span>${(selectedSeats.length * 12).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Booking Fee</span>
                  <span>${selectedSeats.length > 0 ? (1.50).toFixed(2) : (0).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span>${(selectedSeats.length * 12 + (selectedSeats.length > 0 ? 1.5 : 0)).toFixed(2)}</span>
                </div>
              </div>
              
              <Button
                className="w-full bg-cinema-accent hover:bg-cinema-accent/90"
                size="lg"
                disabled={selectedSeats.length === 0 || bookingInProgress}
                onClick={handleBooking}
              >
                {bookingInProgress ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Processing...
                  </span>
                ) : "Complete Booking"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookingPage;
