
// API Configuration
export const DEFAULT_API_URL = 'https://9525-102-219-208-124.ngrok-free.app';
export let API_URL = localStorage.getItem('apiUrl') || DEFAULT_API_URL;

export const updateApiUrl = (url: string) => {
  API_URL = url;
  localStorage.setItem('apiUrl', url);
};

// Roles
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Reservation statuses
export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  AWAITING_PAYMENT: 'awaiting_payment',
  AWAITING_VERIFICATION: 'awaiting_verification'
};

// Genres from seeded data
export const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'] as const;

// Movie constants
export const MOVIES_PER_PAGE = 10;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_TITLE_LENGTH = 200;

// Seat layout (based on seed.py which uses rows A-E and 5 columns)
export const SEATS_PER_ROW = 5;
export const TOTAL_ROWS = 5; // A-E

// Payment Methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  PAYPAL: 'paypal',
  CASH: 'cash',
  MPESA: 'M-Pesa'
};

// Payment Statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  PROCESSING: 'processing',
  FAILED: 'failed'
};

// Prices
export const SEAT_PRICE = 10.00; // Price per seat in dollars

// Frontend URL for CORS
export const FRONTEND_URL = 'https://cinema-verse-frontend.vercel.app';
