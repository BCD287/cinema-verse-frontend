
export interface Movie {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  genre: string;
  release_date: string;
  natural_release_date?: string;
}

export interface Showtime {
  id: number;
  movie_id: number;
  movie_title?: string;
  start_time: string;
  duration: number;
  available_seats?: number;
  admin_id?: number;
}

export interface Seat {
  id: number;
  seat_number: string;
  row: string;
  column: number;
  showtime_id: number;
  is_reserved: boolean;
}

export interface Payment {
  id: number;
  user_id: number;
  reservation_id: number;
  amount: number;
  payment_date?: string;
  payment_method: string;
  status: string;
  transaction_id?: string;
  timestamp?: string;
  created_at?: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  showtime_id: number;
  timestamp: string;
  status: string;
  seats: Seat[];
  payment?: Payment;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface Admin {
  id: number;
  username: string;
  email: string;
}

export interface AdminReference {
  id: number;
  admin_id: number;
  reference_text: string;
}

// Update the Genre type to match the seed data
export type Genre = 'Action' | 'Comedy' | 'Drama' | 'Horror' | 'Sci-Fi';

// Update payment methods based on seed.py
export type PaymentMethod = 'credit_card' | 'paypal' | 'cash' | 'M-Pesa';

export type PaymentStatus = 'pending' | 'completed' | 'processing' | 'failed';

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'awaiting_payment' | 'awaiting_verification';

// Stripe related types
export interface StripePayment {
  amount: number; // in cents
  currency: string;
  source: string; // payment token
  description?: string;
}

export interface StripeResponse {
  id: string;
  amount: number;
  status: string;
  created: number; // timestamp
  receipt_url?: string;
}
