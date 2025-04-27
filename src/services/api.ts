import { API_URL } from '@/lib/constants';
// Import types for use within this file
import type { Movie, Showtime, Seat, Reservation, User } from '@/types/cinema';
// Re-export types from types/cinema.ts
export type { Movie, Showtime, Seat, Reservation, User } from '@/types/cinema';
import { fetchWithProxy } from '@/middleware/corsProxy';

// Error handling helper
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

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

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('cinemaToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Authentication API calls
export const register = async (data: { username: string; email: string; password: string }) => {
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

export const login = async (data: { username: string; password: string }) => {
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
    await fetchWithProxy('/test-auth', {
      headers: getAuthHeader()
    });
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// Movie API calls
export const fetchMovies = async (page = 1, perPage = 10) => {
  return fetchWithProxy(`/movies?page=${page}&per_page=${perPage}`, {
    headers: getAuthHeader()
  });
};

export const searchMovies = async (genre?: string, title?: string) => {
  let url = `/movies/search`;
  const params = new URLSearchParams();
  if (genre) params.append('genre', genre);
  if (title) params.append('title', title);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  return fetchWithProxy(url, { 
    headers: getAuthHeader() 
  });
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
      ...getAuthHeader()
    },
    body: JSON.stringify({
      movie_id: movieId,
      start_time: startTime,
      duration
    })
  });
};

export const searchShowtimes = async (date: string) => {
  return fetchWithProxy(`/showtimes/search?date=${date}`, { 
    headers: getAuthHeader() 
  });
};

// Seat API calls
export const createSeats = async (showtimeId: number, seatNumbers: string[]) => {
  return fetchWithProxy('/seats', {
    method: 'POST',
    headers: {
      ...getAuthHeader()
    },
    body: JSON.stringify({
      showtime_id: showtimeId,
      seat_numbers: seatNumbers
    })
  });
};

// Reservation API calls
export const createReservation = async (showtimeId: number, seatIds: number[]) => {
  return fetchWithProxy('/reservations', {
    method: 'POST',
    headers: {
      ...getAuthHeader()
    },
    body: JSON.stringify({
      showtime_id: showtimeId,
      seat_ids: seatIds
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

export const promoteUser = async (userId: number) => {
  return fetchWithProxy(`/users/promote/${userId}`, {
    method: 'POST',
    headers: getAuthHeader()
  });
};
