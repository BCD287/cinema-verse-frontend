
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { API_URL } from '@/lib/constants';
import { fetchWithProxy } from '@/middleware/corsProxy';

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing token
    const storedToken = localStorage.getItem('cinemaToken');
    if (storedToken) {
      setToken(storedToken);
      validateToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      console.log('Validating token:', token.substring(0, 10) + '...');
      const response = await fetchWithProxy('/test-auth', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Token validation response:', response);
      if (response) {
        // For this version, we'll assume a valid response means the token is valid
        // We'll check if the response contains user info
        const userId = response.user_id || response.sub;
        const userRole = response.role || 'user';
        
        setUser({
          id: userId,
          username: response.username || 'User',
          role: userRole
        });
      } else {
        handleInvalidToken();
      }
    } catch (error) {
      console.error('Token validation error:', error);
      handleInvalidToken();
    } finally {
      setLoading(false);
    }
  };

  const handleInvalidToken = () => {
    localStorage.removeItem('cinemaToken');
    setToken(null);
    setUser(null);
    setLoading(false);
    toast({
      title: "Session expired",
      description: "Please log in again",
      variant: "destructive",
    });
  };

  const login = async (username: string, password: string) => {
    try {
      const data = await fetchWithProxy('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      if (!data || !data.access_token) {
        throw new Error('Invalid response from server');
      }

      const accessToken = data.access_token;
      
      localStorage.setItem('cinemaToken', accessToken);
      setToken(accessToken);
      
      // Get user info from token
      const tokenParts = accessToken.split('.');
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('Token payload:', payload);
          const userId = payload.sub || payload.user_id;
          const userRole = payload.role || 'user';
          
          setUser({
            id: userId,
            username, // We use the username from login
            role: userRole
          });
          
          toast({
            title: "Login successful",
            description: `Welcome back, ${username}!`,
          });
        } catch (e) {
          console.error('Error parsing token payload:', e);
          await validateToken(accessToken);
        }
      } else {
        await validateToken(accessToken);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      await fetchWithProxy('/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
      });

      toast({
        title: "Registration successful",
        description: "You can now log in with your new account.",
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('cinemaToken');
    setToken(null);
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
