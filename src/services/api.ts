
import { API_URL } from '@/lib/constants';
import type { Movie, Showtime, Seat, Reservation, User, Payment, Admin, AdminReference } from '@/types/cinema';
export type { Movie, Showtime, Seat, Reservation, User, Payment, Admin, AdminReference } from '@/types/cinema';
import { fetchWithProxy } from '@/middleware/corsProxy';
import { PAYMENT_METHODS } from '@/lib/constants';

// Auth interfaces
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}

// Payment interfaces
export interface PaymentData {
  payment_method: string;
  payment_token?: string; // For credit card or other electronic payments
  amount?: number;
}

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('cinemaToken');
  if (!token) {
    console.warn('No authentication token found');
    return {};
  }
  return { 'Authorization': `Bearer ${token}` };
};

// Authentication API calls
export const register = async (data: RegisterData) => {
  try {
    return await fetchWithProxy('/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (data: LoginData) => {
  try {
    return await fetchWithProxy('/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const validateToken = async () => {
  try {
    const token = localStorage.getItem('cinemaToken');
    if (!token) {
      console.warn('No token to validate');
      return false;
    }
    
    console.log('Validating token with API');
    await fetchWithProxy('/test-auth', {
      headers: getAuthHeader()
    });
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    // If token validation fails, remove the invalid token
    localStorage.removeItem('cinemaToken');
    return false;
  }
};

// Movie API calls
export const fetchMovies = async (page = 1, perPage = 10) => {
  console.log('Fetching movies with auth header:', getAuthHeader());
  try {
    const data = await fetchWithProxy(`/movies?page=${page}&per_page=${perPage}`, {
      headers: getAuthHeader()
    });
    
    // Handle different response formats from the API
    if (Array.isArray(data)) {
      // If the API returns just an array of movies directly
      return {
        movies: data.map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          description: movie.description,
          poster_url: movie.poster_url,
          genre: movie.genre,
          release_date: movie.release_date,
          natural_release_date: movie.natural_release_date || movie.release_date
        })),
        total_pages: 1,
        current_page: 1
      };
    } else if (data && typeof data === 'object') {
      // If the API returns a paginated object structure
      if (data.movies && Array.isArray(data.movies)) {
        return {
          movies: data.movies.map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            description: movie.description,
            poster_url: movie.poster_url,
            genre: movie.genre,
            release_date: movie.release_date,
            natural_release_date: movie.natural_release_date || movie.release_date
          })),
          total_pages: data.total_pages || data.pages || 1,
          current_page: data.current_page || page
        };
      } else {
        // If data is returned but doesn't match expected format
        console.warn('API returned unexpected data format:', data);
        return {
          movies: [],
          total_pages: 1,
          current_page: 1
        };
      }
    } else {
      console.error('API returned invalid data type:', typeof data);
      return {
        movies: [],
        total_pages: 1,
        current_page: 1
      };
    }
  } catch (error) {
    console.error('Failed to fetch movies:', error);
    throw error;
  }
};

export const searchMovies = async (genre?: string, title?: string) => {
  try {
    let url = `/movies/search`;
    const params = new URLSearchParams();
    if (genre) params.append('genre', genre);
    if (title) params.append('title', title);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    console.log(`Searching movies with params: genre=${genre || 'none'}, title=${title || 'none'}`);
    
    const response = await fetchWithProxy(url, { 
      headers: getAuthHeader() 
    });
    
    // Transform the response to match our expected format
    if (Array.isArray(response)) {
      console.log(`Found ${response.length} movies matching search criteria`);
      return response;
    } else if (response && typeof response === 'object') {
      console.log('Received object response from search, converting to array');
      return [response];
    }
    
    console.warn('Unexpected response format from search:', response);
    return [];
  } catch (error) {
    console.error('Movie search failed:', error);
    throw error;
  }
};

export const fetchMovieById = async (id: number): Promise<Movie> => {
  try {
    const response = await fetchWithProxy(`/movies/${id}`, {
      headers: getAuthHeader()
    });
    
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid movie data returned from API');
    }
    
    return response as Movie;
  } catch (error) {
    console.error(`Failed to fetch movie with ID ${id}:`, error);
    
    // Return mock data for demo/development
    return {
      id,
      title: "Mock Movie Title",
      description: "This is a placeholder description for when the API call fails.",
      poster_url: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070",
      genre: "Action",
      release_date: "2022-01-15"
    };
  }
};

export const createMovie = async (movieData: Omit<Movie, 'id'>) => {
  try {
    return await fetchWithProxy('/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(movieData)
    });
  } catch (error) {
    console.error('Failed to create movie:', error);
    throw error;
  }
};

export const updateMovie = async (id: number, movieData: Partial<Movie>) => {
  try {
    return await fetchWithProxy(`/movies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(movieData)
    });
  } catch (error) {
    console.error('Failed to update movie:', error);
    throw error;
  }
};

export const deleteMovie = async (id: number) => {
  try {
    return await fetchWithProxy(`/movies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
  } catch (error) {
    console.error('Failed to delete movie:', error);
    throw error;
  }
};

export const uploadPoster = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    return await fetchWithProxy('/upload-poster', {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData as any // FormData doesn't need stringify
    });
  } catch (error) {
    console.error('Failed to upload poster:', error);
    throw error;
  }
};

// Showtime API calls
export const createShowtime = async (movieId: number, startTime: string, duration: number) => {
  return fetchWithProxy('/showtimes', {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      movie_id: movieId,
      start_time: startTime,
      duration
    })
  });
};

export const searchShowtimes = async (date: string) => {
  try {
    const response = await fetchWithProxy(`/showtimes/search?date=${date}`, { 
      headers: getAuthHeader() 
    });
    
    // Ensure we return an array even if the API returns null or undefined
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Failed to fetch showtimes:', error);
    return [];
  }
};

// Seat API calls
export const createSeats = async (showtimeId: number, seatNumbers: string[]) => {
  return fetchWithProxy('/seats', {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      showtime_id: showtimeId,
      seat_numbers: seatNumbers
    })
  });
};

// Reservation API calls
export const createReservation = async (
  showtimeId: number, 
  seatIds: number[], 
  paymentMethod = PAYMENT_METHODS.CREDIT_CARD, 
  paymentToken?: string
) => {
  return fetchWithProxy('/reservations', {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      showtime_id: showtimeId,
      seat_ids: seatIds,
      payment_method: paymentMethod,
      payment_token: paymentToken
    })
  });
};

export const updateReservation = async (
  reservationId: number, 
  showtimeId: number, 
  seatIds: number[], 
  paymentMethod = PAYMENT_METHODS.CREDIT_CARD, 
  paymentToken?: string
) => {
  return fetchWithProxy(`/reservations/${reservationId}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      showtime_id: showtimeId,
      seat_ids: seatIds,
      payment_method: paymentMethod,
      payment_token: paymentToken
    })
  });
};

export const cancelReservation = async (reservationId: number) => {
  return fetchWithProxy(`/reservations/${reservationId}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
};

// Admin API calls
export const getAdminReport = async () => {
  return fetchWithProxy('/admin/report', {
    headers: getAuthHeader()
  });
};

export const getAdminReservations = async () => {
  return fetchWithProxy('/admin/reservations', {
    headers: getAuthHeader()
  });
};

export const promoteUser = async (userId: number) => {
  return fetchWithProxy(`/users/promote/${userId}`, {
    method: 'POST',
    headers: getAuthHeader()
  });
};

// Admin dashboard access
export const checkAdminAccess = async () => {
  try {
    return await fetchWithProxy('/admin', {
      headers: getAuthHeader()
    });
  } catch (error) {
    console.error('Admin access check error:', error);
    return false;
  }
};

// Process payment via Stripe
export const processStripePayment = async (amount: number, paymentToken: string) => {
  try {
    return await fetchWithProxy('/process-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        amount,
        payment_token: paymentToken
      })
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
};
