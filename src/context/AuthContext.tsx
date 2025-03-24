
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define user types
export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing user on load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);
  
  // Save user to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('user');
    }
  }, [currentUser]);
  
  // Mock login function - would be replaced with real API call
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication logic
      if (email.includes('teacher')) {
        setCurrentUser({
          id: 't1',
          name: 'Professor Smith',
          email: email,
          role: 'teacher',
          avatar: 'https://i.pravatar.cc/150?img=11'
        });
      } else {
        setCurrentUser({
          id: 's1',
          name: 'Student Johnson',
          email: email,
          role: 'student',
          avatar: 'https://i.pravatar.cc/150?img=12'
        });
      }
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };
  
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    logout,
    setCurrentUser
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
