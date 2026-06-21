import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

export function useLogin() {
  const router = useRouter();
  const { login, isAuthenticated, isLoginLoading, user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Efecto para manejar la redirección según el rol cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && user) {
      // Iniciamos la animación de salida
      setIsExiting(true);
      
      const timer = setTimeout(() => {
        if (user.rol === 'repartidor') {
          router.push('/dashboard/routes');
        } else if (user.rol === 'admin') {
          router.push('/dashboard/metrics');
        } else {
          router.push('/dashboard');
        }
      }, 400); 
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, router]);

  // Manejador del envío del formulario
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const backendMessage = err.response?.data?.detail;
        setError(backendMessage || 'Ocurrió un error de conexión con el servidor.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
      }
    }
  };

  // Función auxiliar para alternar la visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    showPassword,
    togglePasswordVisibility,
    isExiting,
    isLoginLoading,
    handleLogin
  };
}