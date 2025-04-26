
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { API_URL } from '@/lib/constants';

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
      const response = await fetch(`${API_URL}/debug/token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        fetchUserDetails(token, data.user_id);
      } else {
        localStorage.removeItem('cinemaToken');
        setToken(null);
        setUser(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('cinemaToken');
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const fetchUserDetails = async (token: string, userId: number) => {
    try {
      // For this example, we're setting basic user info since the API doesn't have a specific endpoint
      // In a real app, you would fetch user details from an API endpoint
      const userRole = await getUserRole(token);
      
      setUser({
        id: userId,
        username: 'User', // This would come from the API
        role: userRole
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setLoading(false);
    }
  };

  const getUserRole = async (token: string): Promise<string> => {
    try {
      // This is a simplified approach. In a real app, you would decode the JWT or fetch from an API
      const response = await fetch(`${API_URL}/test-auth`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // For demo, we'll assume the user is a regular user unless we know otherwise
        // In reality, you'd extract this from the JWT or a specific endpoint
        return 'user';
      }
      return 'user';
    } catch (error) {
      console.error('Error checking user role:', error);
      return 'user';
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const accessToken = data.access_token;
      
      localStorage.setItem('cinemaToken', accessToken);
      setToken(accessToken);
      
      // Get user info from token
      const tokenParts = accessToken.split('.');
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
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
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

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
