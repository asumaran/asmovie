'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('movieapp_user'); // Remove old format
      }
    } else {
      // Check for old format and clean up
      const oldUser = localStorage.getItem('movieapp_user');
      if (oldUser) {
        localStorage.removeItem('movieapp_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      // Handle different response formats
      let authToken, userData;
      if (data.success) {
        authToken = data.data?.accessToken || data.data?.token || data.token;
        userData = data.data?.user || data.user;
      } else {
        authToken = data.accessToken || data.token;
        userData = data.user;
      }

      if (!authToken) {
        throw new Error('No token received from server');
      }

      // Store in localStorage
      localStorage.setItem('auth_token', authToken);
      if (userData) {
        localStorage.setItem('auth_user', JSON.stringify(userData));
      }

      // Update state
      setToken(authToken);
      setUser(userData || { id: 0, email });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<void> => {
    setIsLoading(true);

    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();

      // Handle different response formats
      let authToken, userData;
      if (data.success) {
        authToken = data.data?.accessToken || data.data?.token || data.token;
        userData = data.data?.user || data.user;
      } else {
        authToken = data.accessToken || data.token;
        userData = data.user;
      }

      if (!authToken) {
        throw new Error('No token received from server');
      }

      // Store in localStorage
      localStorage.setItem('auth_token', authToken);
      if (userData) {
        localStorage.setItem('auth_user', JSON.stringify(userData));
      }

      // Update state
      setToken(authToken);
      setUser(userData || { id: 0, email, firstName, lastName });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('movieapp_user'); // Remove old format too

    // Clear state
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    logout,
    isLoading,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
