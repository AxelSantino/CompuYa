'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingTruck from '@/components/LoadingTruck';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoginLoading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
      const error = err as Error;
      setError(error.message || 'Ocurrió un error inesperado. Por favor, intenta de nuevo.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-24">
      <div className="relative w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-gray-900">
        {isLoginLoading ? (
          <div className="login-overlay">
            <LoadingTruck />
            <p className="mt-4 text-lg">Iniciando sesión...</p>
          </div>
        ) : null}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">CompuYa</h1>
          <p className="text-gray-600 font-medium">Inicia sesión para continuar</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={isLoginLoading}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-800"
            >
              Contraseña
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoginLoading}
            />
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <div>
            <Button type="submit" className="w-full" disabled={isLoginLoading}>
              {isLoginLoading ? 'Verificando...' : 'Iniciar Sesión'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
