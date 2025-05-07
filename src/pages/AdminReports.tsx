
import { useState, useEffect } from 'react';
import { getAdminReport, getAdminReservations } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RequireAuth } from '@/components/RequireAuth';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, parseISO, subDays, isAfter } from 'date-fns';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, PercentIcon, RefreshCw, Users, LineChart as LineChartIcon } from 'lucide-react';

interface AdminReport {
  total_reservations: number;
  capacity_utilization: number;
  revenue: number;
}

interface ReservationData {
  reservation_id: number;
  user_id: number;
  showtime: string;
  seats: string[];
  total_amount: number;
  movie_title?: string;
  payment_method?: string;
  payment_status?: string;
}

// Generate past dates for realistic data visualization
const generatePastDates = (days: number) => {
  return Array.from({ length: days }).map((_, i) => {
    const date = subDays(new Date(), days - i - 1);
    return format(date, 'MMM dd');
  });
};

// Generate random data for demonstration
const generateRandomData = (labels: string[], min: number, max: number) => {
  return labels.map(name => ({
    name,
    value: Math.floor(Math.random() * (max - min + 1)) + min
  }));
};

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

const AdminReports = () => {
  const [report, setReport] = useState<AdminReport | null>(null);
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('7');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { toast } = useToast();
  
  // Generate chart data based on time range
  const dates = generatePastDates(parseInt(timeRange));
  const dailyReservations = generateRandomData(dates, 5, 50);
  const dailyRevenue = generateRandomData(dates, 100, 800);
  
  // Mock data for genre distribution
  const genreData = [
    { name: 'Action', value: 35 },
    { name: 'Comedy', value: 20 },
    { name: 'Drama', value: 18 },
    { name: 'Sci-Fi', value: 15 },
    { name: 'Horror', value: 12 },
  ];
  
  // Mock data for top movies
  const topMovies = [
    { name: 'The Dark Knight', value: 45 },
    { name: 'Inception', value: 38 },
    { name: 'Interstellar', value: 29 },
    { name: 'Pulp Fiction', value: 24 },
    { name: 'The Godfather', value: 18 },
  ];
  
  // Mock data for payment methods
  const paymentMethods = [
    { name: 'Credit Card', value: 65 },
    { name: 'PayPal', value: 20 },
    { name: 'Cash', value: 15 },
  ];
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch admin report data
      const reportData = await getAdminReport();
      setReport(reportData);
      
      // Fetch admin reservations data
      const reservationsData = await getAdminReservations();
      setReservations(reservationsData);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin report data",
        variant: "destructive",
      });
      
      // Set mock data for UI
      setReport({
        total_reservations: 245,
        capacity_utilization: 768,
        revenue: 2450
      });
      
      // Generate some mock reservation data
      setReservations([
        {
          reservation_id: 1,
          user_id: 101,
          showtime: "2 hours ago",
          seats: ["A1", "A2"],
          total_amount: 25,
          movie_title: "The Dark Knight",
          payment_method: "credit_card",
          payment_status: "completed"
        },
        {
          reservation_id: 2,
          user_id: 102,
          showtime: "yesterday",
          seats: ["B3", "B4", "B5"],
          total_amount: 36,
          movie_title: "Inception",
          payment_method: "paypal",
          payment_status: "completed"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    fetchData();
    toast({
      title: "Refreshing Data",
      description: "The dashboard data is being updated",
    });
  };
  
  return (
    <RequireAuth requireAdmin>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="container py-8 flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1 className="text-3xl font-bold mb-2 sm:mb-0">Analytics Dashboard</h1>
            
            <div className="flex items-center space-x-2">
              <Select
                value={timeRange}
                onValueChange={setTimeRange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline" 
                size="icon"
                onClick={handleRefresh}
                title="Refresh Data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center bg-card rounded-lg shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-cinema-accent mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading admin report...</p>
            </div>
          ) : report ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
                <TabsTrigger value="reservations">Reservations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="space-y-8">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Total Reservations</CardTitle>
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <CardDescription>All time bookings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{report.total_reservations}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="text-green-500">+4.6%</span> from last month
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Capacity Utilization</CardTitle>
                          <PercentIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <CardDescription>Total seats booked</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{report.capacity_utilization}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="text-green-500">+2.1%</span> from last month
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Total Revenue</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <CardDescription>In USD</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">${report.revenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="text-green-500">+12.5%</span> from last month
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Main Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Daily Reservations</CardTitle>
                        <CardDescription>Last {timeRange} days</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={dailyReservations}
                            margin={{
                              top: 10,
                              right: 30,
                              left: 0,
                              bottom: 0,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [`${value} reservations`, 'Count']}
                              contentStyle={{ backgroundColor: '#f8f9fa', borderRadius: '8px', borderColor: '#e0e0e0' }}
                            />
                            <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                        <CardDescription>Last {timeRange} days in USD</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={dailyRevenue}
                            margin={{
                              top: 10,
                              right: 30,
                              left: 20,
                              bottom: 0,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [`$${value}`, 'Revenue']}
                              contentStyle={{ backgroundColor: '#f8f9fa', borderRadius: '8px', borderColor: '#e0e0e0' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#8884d8" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="trends">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Genre Distribution</CardTitle>
                        <CardDescription>Movie reservations by genre</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={genreData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {genreData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value, name) => [`${value} bookings`, name]}
                              contentStyle={{ backgroundColor: '#f8f9fa', borderRadius: '8px', borderColor: '#e0e0e0' }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Distribution of payment types</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={paymentMethods}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {paymentMethods.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value, name) => [`${value} transactions`, name]}
                              contentStyle={{ backgroundColor: '#f8f9fa', borderRadius: '8px', borderColor: '#e0e0e0' }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Movies</CardTitle>
                      <CardDescription>By reservation count</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={topMovies}
                          layout="vertical"
                          margin={{
                            top: 10,
                            right: 30,
                            left: 100,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                          <Tooltip 
                            formatter={(value) => [`${value} reservations`, 'Count']}
                            contentStyle={{ backgroundColor: '#f8f9fa', borderRadius: '8px', borderColor: '#e0e0e0' }}
                          />
                          <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="reservations">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reservations</CardTitle>
                    <CardDescription>
                      Showing the {reservations.length} most recent reservations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">ID</th>
                            <th className="text-left py-3 px-4">User ID</th>
                            <th className="text-left py-3 px-4">Movie</th>
                            <th className="text-left py-3 px-4">Showtime</th>
                            <th className="text-left py-3 px-4">Seats</th>
                            <th className="text-left py-3 px-4">Amount</th>
                            <th className="text-left py-3 px-4">Payment</th>
                            <th className="text-left py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservations.map((reservation) => (
                            <tr key={reservation.reservation_id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4">{reservation.reservation_id}</td>
                              <td className="py-3 px-4">{reservation.user_id}</td>
                              <td className="py-3 px-4">{reservation.movie_title || 'Unknown'}</td>
                              <td className="py-3 px-4">{reservation.showtime}</td>
                              <td className="py-3 px-4">{reservation.seats.join(', ')}</td>
                              <td className="py-3 px-4">${reservation.total_amount.toFixed(2)}</td>
                              <td className="py-3 px-4">
                                {reservation.payment_method || 'Unknown'}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                  reservation.payment_status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {reservation.payment_status || 'pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="p-8 text-center bg-card rounded-lg shadow-sm">
              <p className="text-muted-foreground">No report data available.</p>
            </div>
          )}
        </div>
        
        <Footer />
      </div>
    </RequireAuth>
  );
};

export default AdminReports;
