'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '@/services/authService';
import api from '@/services/api';

interface User {
  id: number;
  supabase_id: string;
  email: string;
  rol: string;
  nombre: string | null;
  apellido: string | null;
  razon_social?: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.access_token);
      
      try {
        const profile = await authService.getProfile(data.access_token);
        setUser(profile);
      } catch (profileError: any) {
        console.error('Error fetching profile after login:', profileError);
        localStorage.removeItem('token');
        if (profileError.response?.status === 403) {
          throw new Error('Tu cuenta está autenticada pero no tiene permisos para este sistema.');
        }
        throw new Error('Error al obtener el perfil de usuario. Contacte al administrador.');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Email o contraseña incorrectos.');
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
