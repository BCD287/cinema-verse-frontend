
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MovieList from "./pages/MovieList";
import MovieDetails from "./pages/MovieDetails";
import ShowtimesList from "./pages/ShowtimesList";
import BookingPage from "./pages/BookingPage";
import MyReservations from "./pages/MyReservations";
import AdminMovies from "./pages/AdminMovies";
import AdminMovieCreate from "./pages/AdminMovieCreate";
import AdminMovieEdit from "./pages/AdminMovieEdit";
import AdminShowtimes from "./pages/AdminShowtimes";
import AdminReports from "./pages/AdminReports";
import AdminSeats from "./pages/AdminSeats";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/movies" element={<MovieList />} />
            <Route path="/movies/:id" element={<MovieDetails />} />
            <Route path="/showtimes" element={<ShowtimesList />} />
            <Route path="/book/:id" element={<BookingPage />} />
            <Route path="/my-reservations" element={<MyReservations />} />
            <Route path="/admin/movies" element={<AdminMovies />} />
            <Route path="/admin/movies/create" element={<AdminMovieCreate />} />
            <Route path="/admin/movies/edit/:id" element={<AdminMovieEdit />} />
            <Route path="/admin/showtimes" element={<AdminShowtimes />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/seats/:id" element={<AdminSeats />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
