
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { searchShowtimes, createReservation, Showtime, Seat } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { format, addMinutes } from 'date-fns';
import { Calendar, Clock, Users, CreditCard, Ticket, CalendarDays } from 'lucide-react';
import { SeatSelector } from '@/components/SeatSelector';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
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
        // In a real app, we would fetch the actual showtime and seats
        // For now, we'll use mock data that closely mirrors the API structure
        const mockShowtime: Showtime = {
          id: parseInt(id),
          movie_id: 1,
          movie_title: "The Dark Knight",
          start_time: new Date().toISOString(),
          duration: 152,
          available_seats: 17
        };
        
        setShowtime(mockShowtime);
        
        const mockSeats: Seat[] = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        
        rows.forEach((row, rowIndex) => {
          for (let col = 1; col <= 10; col++) {
            mockSeats.push({
              id: mockSeats.length + 1,
              seat_number: `${row}${col}`,
              row,
              column: col,
              showtime_id: parseInt(id),
              is_reserved: Math.random() < 0.3 // 30% chance of being reserved
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
  
  const handleSeatSelect = (seatId: number, isReserved: boolean) => {
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
      
      await createReservation(showtime.id, selectedSeats, paymentMethod);
      
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

  // Calculate showtime end based on duration
  const showtimeStart = new Date(showtime.start_time);
  const showtimeEnd = addMinutes(showtimeStart, showtime.duration);
  
  // Calculate price
  const seatPrice = 12.00;
  const bookingFee = selectedSeats.length > 0 ? 1.50 : 0;
  const subtotal = selectedSeats.length * seatPrice;
  const total = subtotal + bookingFee;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Book Tickets</h1>
          <div className="flex gap-2 items-center mt-2">
            <Badge variant="outline" className="font-normal">
              <CalendarDays className="w-3.5 h-3.5 mr-1" />
              {format(showtimeStart, 'EEEE, MMMM d')}
            </Badge>
            <Badge variant="outline" className="font-normal">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {format(showtimeStart, 'h:mm a')} - {format(showtimeEnd, 'h:mm a')}
            </Badge>
          </div>
        </div>
        
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Ticket className="mr-2 h-5 w-5" />
                  Select Your Seats
                </h2>
                
                <SeatSelector 
                  seats={seats} 
                  selectedSeats={selectedSeats} 
                  onSeatSelect={handleSeatSelect}
                />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <div className="bg-card rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              
              <div className="space-y-4 border-b pb-4 mb-4">
                <div>
                  <h3 className="font-bold text-lg">{showtime.movie_title}</h3>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="h-4 w-4 mt-0.5" />
                  <span>
                    {format(showtimeStart, 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <Clock className="h-4 w-4 mt-0.5" />
                  <span>
                    {format(showtimeStart, 'h:mm a')} - {format(showtimeEnd, 'h:mm a')}
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
              
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">
                  Payment Method
                </label>
                <Select
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="cash">Cash (Pay at Venue)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>Tickets ({selectedSeats.length} × ${seatPrice.toFixed(2)})</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Booking Fee</span>
                  <span>${bookingFee.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
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
                ) : (
                  <span className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Complete Booking
                  </span>
                )}
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
