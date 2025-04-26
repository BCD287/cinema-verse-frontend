export const API_URL = 'http://localhost:5000';

// Roles
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Reservation statuses
export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
};

// Genres from seeded data
export const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'] as const;

// Movie constants
export const MOVIES_PER_PAGE = 10;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_TITLE_LENGTH = 200;

// Seat layout
export const SEATS_PER_ROW = 5;
export const TOTAL_ROWS = 4; // A-D
