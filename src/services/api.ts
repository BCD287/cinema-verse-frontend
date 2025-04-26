
import { API_URL } from '@/lib/constants';

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  genre: string;
  release_date: string;
}

export interface Showtime {
  id: number;
  movie_id: number;
  movie_title?: string;
  start_time: string;
  duration: number;
  available_seats?: number;
}

export interface Seat {
  id: number;
  seat_number: string;
  row: string;
  column: number;
  showtime_id: number;
  is_reserved: boolean;
}

export interface Reservation {
  id: number;
  user_id: number;
  showtime_id: number;
  timestamp: string;
  status: string;
  seats: Seat[];
}

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
export const register = async (data: RegisterData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }
  
  return await response.json();
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }
  
  return await response.json();
};

export const validateToken = async () => {
  const response = await fetch(`${API_URL}/test-auth`, {
    headers: getAuthHeader()
  });
  
  return response.ok;
};

// Movie API calls
export const fetchMovies = async (page = 1, perPage = 10) => {
  const response = await fetch(
    `${API_URL}/movies?page=${page}&per_page=${perPage}`, 
    { headers: getAuthHeader() }
  );
  if (!response.ok) throw new Error('Failed to fetch movies');
  return await response.json();
};

export const searchMovies = async (genre?: string, title?: string) => {
  let url = `${API_URL}/movies/search`;
  const params = new URLSearchParams();
  if (genre) params.append('genre', genre);
  if (title) params.append('title', title);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await fetch(url, { headers: getAuthHeader() });
  if (!response.ok) throw new Error('Movie search failed');
  return await response.json();
};

export const createMovie = async (movieData: Omit<Movie, 'id'>) => {
  const response = await fetch(`${API_URL}/movies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(movieData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create movie');
  }
  
  return await response.json();
};

export const updateMovie = async (id: number, movieData: Partial<Movie>) => {
  const response = await fetch(`${API_URL}/movies/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(movieData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update movie');
  }
  
  return await response.json();
};

export const deleteMovie = async (id: number) => {
  const response = await fetch(`${API_URL}/movies/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete movie');
  }
  
  return await response.json();
};

export const uploadPoster = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/upload-poster`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload poster');
  }
  
  return await response.json();
};

// Showtime API calls
export const createShowtime = async (movieId: number, startTime: string, duration: number) => {
  const response = await fetch(`${API_URL}/showtimes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({
      movie_id: movieId,
      start_time: startTime,
      duration
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create showtime');
  }
  
  return await response.json();
};

export const searchShowtimes = async (date: string) => {
  const response = await fetch(
    `${API_URL}/showtimes/search?date=${date}`,
    { headers: getAuthHeader() }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch showtimes');
  }
  
  return await response.json();
};

// Seat API calls
export const createSeats = async (showtimeId: number, seatNumbers: string[]) => {
  const response = await fetch(`${API_URL}/seats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({
      showtime_id: showtimeId,
      seat_numbers: seatNumbers
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create seats');
  }
  
  return await response.json();
};

// Reservation API calls
export const createReservation = async (showtimeId: number, seatIds: number[]) => {
  const response = await fetch(`${API_URL}/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({
      showtime_id: showtimeId,
      seat_ids: seatIds
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create reservation');
  }
  
  return await response.json();
};

export const cancelReservation = async (reservationId: number) => {
  const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel reservation');
  }
  
  return await response.json();
};

// Admin API calls
export const getAdminReport = async () => {
  const response = await fetch(`${API_URL}/admin/report`, {
    headers: getAuthHeader()
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch admin report');
  }
  
  return await response.json();
};

export const promoteUser = async (userId: number) => {
  const response = await fetch(`${API_URL}/users/promote/${userId}`, {
    method: 'POST',
    headers: getAuthHeader()
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to promote user');
  }
  
  return await response.json();
};
