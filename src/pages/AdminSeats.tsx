
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createSeats } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RequireAuth } from '@/components/RequireAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const AdminSeats = () => {
  const { id } = useParams<{ id: string }>();
  const [rows, setRows] = useState<string>('ABCDEF');
  const [columns, setColumns] = useState<number>(8);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [createdSeats, setCreatedSeats] = useState<string[]>([]);
  const [showtime, setShowtime] = useState({
    id: 0,
    movie_title: '',
    start_time: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchShowtimeDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // In a real app, we'd fetch the showtime details and existing seats
        // For demo, we'll mock the data
        
        setShowtime({
          id: parseInt(id),
          movie_title: "The Dark Knight",
          start_time: new Date().toISOString()
        });
        
        // Mock existing seats
        const mockCreatedSeats: string[] = [];
        const sampleRows = 'ABCD';
        
        for (let i = 0; i < sampleRows.length; i++) {
          const row = sampleRows[i];
          for (let col = 1; col <= 8; col++) {
            mockCreatedSeats.push(`${row}${col}`);
          }
        }
        
        setCreatedSeats(mockCreatedSeats);
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
  }, [id, toast]);
  
  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow uppercase letters
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    setRows(value);
  };
  
  const handleColumnsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 20) {
      setColumns(value);
    }
  };
  
  const generateSeatMatrix = () => {
    const seatMatrix: string[][] = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row: string[] = [];
      const rowLetter = rows[i];
      
      for (let j = 1; j <= columns; j++) {
        const seatNumber = `${rowLetter}${j}`;
        row.push(seatNumber);
      }
      
      seatMatrix.push(row);
    }
    
    return seatMatrix;
  };
  
  const toggleSeatSelection = (seatNumber: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(seat => seat !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };
  
  const handleCreateSeats = async () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "Error",
        description: "Please select seats to create",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      if (!id) throw new Error("No showtime ID provided");
      
      // Call API to create seats
      await createSeats(parseInt(id), selectedSeats);
      
      // Update local state
      setCreatedSeats(prev => [...prev, ...selectedSeats]);
      setSelectedSeats([]);
      
      toast({
        title: "Success",
        description: `Created ${selectedSeats.length} seats successfully`,
      });
    } catch (error) {
      console.error('Failed to create seats:', error);
      toast({
        title: "Error",
        description: "Failed to create seats",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const seatMatrix = generateSeatMatrix();
  
  const getSeatClass = (seatNumber: string) => {
    if (createdSeats.includes(seatNumber)) {
      return "seat seat-reserved";
    }
    if (selectedSeats.includes(seatNumber)) {
      return "seat seat-selected";
    }
    return "seat seat-available";
  };
  
  if (loading) {
    return (
      <RequireAuth requireAdmin>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          
          <div className="container py-8 flex-grow">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cinema-accent"></div>
            </div>
          </div>
          
          <Footer />
        </div>
      </RequireAuth>
    );
  }
  
  return (
    <RequireAuth requireAdmin>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="container py-8 flex-grow">
          <h1 className="text-3xl font-bold mb-8">Manage Seats for Showtime</h1>
          
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Seat Layout</CardTitle>
                  <CardDescription>
                    Select seats to create. Already created seats are shown in gray.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-8">
                    <div className="screen mb-12"></div>
                    
                    <div className="flex flex-col items-center">
                      {seatMatrix.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex mb-3">
                          <div className="w-6 font-medium flex items-center">{rows[rowIndex]}</div>
                          <div className="flex flex-wrap">
                            {row.map(seatNumber => (
                              <button
                                key={seatNumber}
                                className={getSeatClass(seatNumber)}
                                onClick={() => {
                                  if (!createdSeats.includes(seatNumber)) {
                                    toggleSeatSelection(seatNumber);
                                  }
                                }}
                                disabled={createdSeats.includes(seatNumber)}
                                title={
                                  createdSeats.includes(seatNumber) 
                                    ? `Seat ${seatNumber} (Already Created)` 
                                    : `Seat ${seatNumber}`
                                }
                              >
                                {parseInt(seatNumber.slice(1))}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-6 text-sm">
                    <div className="flex items-center">
                      <div className="seat seat-available w-4 h-4 mr-2"></div>
                      <span>Available to Create</span>
                    </div>
                    <div className="flex items-center">
                      <div className="seat seat-selected w-4 h-4 mr-2"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center">
                      <div className="seat seat-reserved w-4 h-4 mr-2"></div>
                      <span>Already Created</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Showtime Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Movie:</strong> {showtime.movie_title}</p>
                  <p className="mt-2">
                    <strong>Showtime ID:</strong> {showtime.id}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Seat Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="rows">Rows (Letters)</Label>
                      <Input
                        id="rows"
                        value={rows}
                        onChange={handleRowsChange}
                        placeholder="e.g. ABCDEFGH"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter uppercase letters for rows (e.g., ABCDEF)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="columns">Columns (per row)</Label>
                      <Input
                        id="columns"
                        type="number"
                        value={columns.toString()}
                        onChange={handleColumnsChange}
                        min="1"
                        max="20"
                      />
                      <p className="text-xs text-muted-foreground">
                        Number of seats per row (1-20)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Create Seats</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">Selected seats: {selectedSeats.length}</p>
                  {selectedSeats.length > 0 && (
                    <p className="text-sm mb-4">
                      {selectedSeats.sort().join(', ')}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleCreateSeats} 
                    className="w-full bg-cinema-accent hover:bg-cinema-accent/90"
                    disabled={selectedSeats.length === 0 || isSaving}
                  >
                    {isSaving ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Creating...
                      </span>
                    ) : "Create Selected Seats"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </RequireAuth>
  );
};

export default AdminSeats;
