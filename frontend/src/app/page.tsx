'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingTruck from '@/components/LoadingTruck';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/i18n/LanguageSwitcher';


export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoginLoading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const {t} = useTranslation();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.rol === 'repartidor') {
        router.push('/dashboard/routes');
      } else if (user.rol === 'admin') {
        router.push('/dashboard/metrics');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const backendMessage = err.response?.data?.detail;

        setError(backendMessage || 'Ocurrió un error de conexión con el servidor.');
      } 
      else if (err instanceof Error) {
        setError(err.message);

      } 
      else {
        setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 md:p-24">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher></LanguageSwitcher>
      </div>
      <div className="relative w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-gray-900">
        {isLoginLoading ? (
          <div className="login-overlay">
            <LoadingTruck />
            <p className="mt-4 text-lg">{t('login.iniciando_sesion')}</p>
          </div>
        ) : null}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Compuya</h1>
          <p className="text-gray-600 font-medium">{t('login.subtitulo')}</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
              {t('login.email')}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.placeholder_email')}
              disabled={isLoginLoading}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-800"
            >
              {t('login.password')}
            </label>
            {/* Contenedor relativo para poder posicionar el botón del ojo de forma absoluta */}
            <div className="relative">
              <Input
                id="password"
                name="password"
                // Alternamos dinámicamente entre 'text' y 'password'
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoginLoading}
                className="pr-10" // Agregamos padding a la derecha para que el texto no se superponga con el ícono
              />
              <button
                type="button" // MUY IMPORTANTE: type="button" para que no envíe el formulario al hacer clic
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors cursor-pointer"
                disabled={isLoginLoading}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <div>
            <Button type="submit" className="w-full" disabled={isLoginLoading}>
              {isLoginLoading ? t('login.verificando') : t('login.iniciar_sesion')}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
