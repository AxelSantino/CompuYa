'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '@/services/authService';
import LoadingTruck from '@/components/LoadingTruck';
import './LoadingScreen.css';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

interface User {
  id: number;
  supabase_id: string;
  email: string;
  rol: string;
  tipo: 'empleado' | 'empresa';
  perfil_empleado?: {
    nombre: string | null;
    apellido: string | null;
  } | null;
  perfil_empresa?: {
    razon_social: string | null;
    latitud: number;
    longitud: number;
    provincia?: string | null;
    municipio?: string | null;
    cod_postal?: string | null;
  } | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isLoginLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const {t} = useTranslation();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoginLoading(true);
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.access_token);
      
      try {
        const profile = await authService.getProfile(data.access_token);
        setUser(profile);
      } catch (profileError) {
        const errorData = profileError as { response?: { status?: number } };
        localStorage.removeItem('token');
        if (errorData.response?.status === 403) {
          throw new Error(t('loadingOverlay.cuenta_auten_sin_permis'));
        }
        throw new Error(t('loadingOverlay.error_obtener_perfil'));
      }
    } catch (error) {
      const errorData = error as { response?: { status?: number } };
      if (errorData.response?.status === 401) {
        throw new Error(t('loadingOverlay.email_contra_incorr'));
      }
      throw error;
    } finally {
      setIsLoginLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAuthenticated = !!user;
  if (isLoading) {
    return (
      <div className="loading-screen">
        <LoadingTruck />
        <p></p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading, isLoginLoading }}>
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
