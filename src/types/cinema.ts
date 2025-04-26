
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

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export type Genre = 'Action' | 'Comedy' | 'Drama' | 'Horror' | 'Sci-Fi';

