
import { useState, useEffect } from 'react';
import { getAdminReport } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RequireAuth } from '@/components/RequireAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AdminReport {
  total_reservations: number;
  capacity_utilization: number;
  revenue: number;
}

// Mock data for charts
const mockDailyReservations = [
  { name: 'Mon', value: 12 },
  { name: 'Tue', value: 19 },
  { name: 'Wed', value: 15 },
  { name: 'Thu', value: 21 },
  { name: 'Fri', value: 38 },
  { name: 'Sat', value: 42 },
  { name: 'Sun', value: 30 },
];

const mockTopMovies = [
  { name: 'The Dark Knight', value: 45 },
  { name: 'Inception', value: 38 },
  { name: 'Interstellar', value: 29 },
  { name: 'Pulp Fiction', value: 24 },
  { name: 'The Godfather', value: 18 },
];

const AdminReports = () => {
  const [report, setReport] = useState<AdminReport | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const data = await getAdminReport();
        setReport(data);
      } catch (error) {
        console.error('Failed to fetch admin report:', error);
        toast({
          title: "Error",
          description: "Failed to load admin report",
          variant: "destructive",
        });
        
        // Set mock data for UI
        setReport({
          total_reservations: 245,
          capacity_utilization: 768,
          revenue: 2450
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [toast]);
  
  return (
    <RequireAuth requireAdmin>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="container py-8 flex-grow">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          
          {loading ? (
            <div className="p-8 text-center bg-card rounded-lg shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-cinema-accent mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading admin report...</p>
            </div>
          ) : report ? (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Reservations</CardTitle>
                    <CardDescription>All time bookings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{report.total_reservations}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Capacity Utilization</CardTitle>
                    <CardDescription>Total seats booked</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{report.capacity_utilization}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Revenue</CardTitle>
                    <CardDescription>In USD</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">${report.revenue.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Reservations</CardTitle>
                    <CardDescription>Last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={mockDailyReservations}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top Movies</CardTitle>
                    <CardDescription>By reservation count</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={mockTopMovies}
                        layout="vertical"
                        margin={{
                          top: 10,
                          right: 30,
                          left: 100,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
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
