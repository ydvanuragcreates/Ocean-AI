import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = authAPI.getToken();
    if (token) {
      // Token exists, assume user is logged in
      // In a production app, you might want to validate the token with the backend
      setUser({ id: 0, email: 'user@example.com' }); // Placeholder
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await authAPI.login({ username: email, password });
      setUser({ id: 0, email }); // Set basic user info
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const newUser = await authAPI.register({ email, password });
      // Auto-login after registration
      await authAPI.login({ username: email, password });
      setUser(newUser);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

