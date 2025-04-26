
import { useState, useEffect } from 'react';
import { cancelReservation } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { format, isPast } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Calendar, Clock, Film, Trash, X } from 'lucide-react';

interface Reservation {
  id: number;
  movie_title: string;
  start_time: string;
  seats: string[];
  poster_url: string;
}

const MyReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelReservationId, setCancelReservationId] = useState<number | null>(null);
  const [cancelInProgress, setCancelInProgress] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        // In a real app, you'd fetch from the API
        // For demo, we'll create mock data
        
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);
        
        const mockReservations: Reservation[] = [
          {
            id: 1,
            movie_title: "The Dark Knight",
            start_time: tomorrow.toISOString(),
            seats: ["A3", "A4"],
            poster_url: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070"
          },
          {
            id: 2,
            movie_title: "Inception",
            start_time: nextWeek.toISOString(),
            seats: ["C5", "C6", "C7"],
            poster_url: "https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=2070"
          }
        ];
        
        setReservations(mockReservations);
      } catch (error) {
        console.error('Failed to fetch reservations:', error);
        toast({
          title: "Error",
          description: "Failed to load your reservations",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchReservations();
    }
  }, [toast, isAuthenticated]);
  
  const handleCancelReservation = async () => {
    if (!cancelReservationId) return;
    
    setCancelInProgress(true);
    try {
      await cancelReservation(cancelReservationId);
      
      setReservations(prev => prev.filter(reservation => reservation.id !== cancelReservationId));
      
      toast({
        title: "Success",
        description: "Your reservation has been cancelled successfully",
      });
      
      setCancelReservationId(null);
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      toast({
        title: "Error",
        description: "Failed to cancel the reservation",
        variant: "destructive",
      });
    } finally {
      setCancelInProgress(false);
    }
  };
  
  const isPastReservation = (startTime: string) => {
    return isPast(new Date(startTime));
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8">My Reservations</h1>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex">
                    <div className="h-32 w-24 bg-gray-200 rounded mr-4"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="h-9 bg-gray-200 rounded w-32"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : reservations.length > 0 ? (
          <div className="space-y-4">
            {reservations.map(reservation => (
              <Card key={reservation.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle>{reservation.movie_title}</CardTitle>
                  <CardDescription>
                    Reservation #{reservation.id}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-auto sm:h-32 rounded-lg overflow-hidden">
                      <img 
                        src={reservation.poster_url} 
                        alt={reservation.movie_title}
                        className="w-full sm:w-24 h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925';
                        }}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 mt-0.5" />
                        <span>
                          {format(new Date(reservation.start_time), 'EEEE, MMMM d, yyyy')}
                        </span>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-0.5" />
                        <span>
                          {format(new Date(reservation.start_time), 'h:mm a')}
                        </span>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Film className="h-4 w-4 mt-0.5" />
                        <div>
                          <div className="font-medium">Seats: {reservation.seats.join(', ')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {!isPastReservation(reservation.start_time) && (
                    <Button 
                      variant="destructive" 
                      className="hover:bg-destructive/90"
                      onClick={() => setCancelReservationId(reservation.id)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Cancel Reservation
                    </Button>
                  )}
                  {isPastReservation(reservation.start_time) && (
                    <div className="text-sm text-muted-foreground flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      This reservation is in the past and cannot be cancelled
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
            
            <AlertDialog open={cancelReservationId !== null} onOpenChange={() => setCancelReservationId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will cancel your reservation. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelReservation}
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={cancelInProgress}
                  >
                    {cancelInProgress ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Cancelling...
                      </span>
                    ) : "Yes, Cancel Reservation"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-2">No Reservations Found</h3>
            <p className="text-muted-foreground mb-4">
              You haven't made any reservations yet.
            </p>
            <Button asChild>
              <a href="/movies">Browse Movies</a>
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default MyReservations;
