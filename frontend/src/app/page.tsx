'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingTruck from '@/components/LoadingTruck';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import axios from 'axios';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/i18n/LanguageSwitcher';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoginLoading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated && user) {
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

  return (
    <main 
      className={`relative flex min-h-screen w-full bg-[#F4F5F7] overflow-hidden transition-opacity duration-400 ease-in-out ${isExiting ? 'opacity-0' : 'opacity-100'}`}
    >
      
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      {isLoginLoading && !isExiting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <LoadingTruck />
          <p className="mt-4 text-lg font-medium text-gray-800">{t('login.iniciando_sesion')}</p>
        </div>
      )}

      <div className="hidden lg:flex flex-col w-[60%] xl:w-[65%] relative overflow-hidden z-10 bg-gradient-to-br from-[#25272B] via-[#1E1F24] to-[#18191D]">
        
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="h-full w-full bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:32px_32px]" />
        </div>
        <div className="absolute -top-52 -left-20 w-[700px] h-[700px] rounded-full border border-[#EB6534]/30" />
        <div className="absolute top-[-15%] right-[-10%] w-[75%] h-[130%] bg-white/[0.03] rounded-[50%]" />
        <div className="absolute bottom-[-300px] right-[-200px] w-[800px] h-[800px] rounded-full bg-white/[0.03]" />

        <div className="relative z-20 flex flex-col h-full p-12 xl:p-20">
          
          <div>
            <Image
              src="/LogoCompuYaBlanco.svg"
              alt="CompuYa"
              width={180}
              height={60}
              priority
            />
          </div>


          <div className="flex flex-col justify-center flex-grow mt-10 w-full">

            <div className="w-full">
              <h1 className="leading-[0.95] tracking-[-3px]">
                <span className="text-white text-[68px] xl:text-[92px] font-bold">
                  Gestión logística
                </span>
                <span className="block text-[#EB6534] text-[68px] xl:text-[92px] font-bold ml-6 xl:ml-14">
                  en tiempo real.
                </span>
              </h1>
              
              <p className="text-gray-300 text-[20px] xl:text-[22px] max-w-[550px] mt-8 ml-2 leading-relaxed">
                Controlá cada etapa de tus envíos. Desde la sucursal hasta que llega a la puerta, con precisión total.
              </p>

              <div className="mt-20 ml-2 w-[320px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-2xl">
                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 rounded-full bg-[#EB6534] flex items-center justify-center text-white text-xl">
                    📦
                  </div>
                  <div>
                    <p className="text-white font-semibold tracking-wide">
                      CY-2026-CTJ4
                    </p>
                    <p className="text-[#EB6534] text-sm font-medium mt-0.5">
                      En tránsito
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 ml-4 flex items-center gap-6 text-[13px] text-gray-400 font-medium tracking-wide">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EB6534]/80"></div>
                  +15.000 envíos gestionados
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EB6534]/80"></div>
                  99.8% entregas exitosas
                </div>
              </div>
            </div>

            <div className="mt-12 xl:mt-16 w-full flex justify-end pr-8 xl:pr-16">
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes trail-grow { 0% { stroke-dashoffset: 100; } 80%, 100% { stroke-dashoffset: 0; } }
                /* El nodo se prende en naranja al pasar el 50% del tiempo (segundo 4) */
                @keyframes dot-trigger-transit { 0%, 49% { fill: #4A4B50; } 50%, 100% { fill: #EB6534; } }
                /* El nodo final se prende al pasar el 80% del tiempo (segundo 6.4) */
                @keyframes dot-trigger-delivery { 0%, 79% { fill: #4A4B50; } 80%, 100% { fill: #EB6534; } }
              `}} />
              
              <svg viewBox="0 0 380 140" className="w-full max-w-[680px] xl:max-w-[850px] overflow-visible">

                <path
                  d="M30 70 C120 20, 200 110, 345 60"
                  fill="none"
                  stroke="#4A4B50"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                
                <path
                  d="M30 70 C120 20, 200 110, 345 60"
                  fill="none"
                  stroke="#EB6534"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength="100"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="100;0"
                    dur="8s"
                    repeatCount="indefinite"
                    calcMode="paced"
                  />
                </path>
          
                <circle cx="30" cy="70" r="6" fill="#EB6534" />
                <circle cx="194" cy="71" r="5" fill="#4A4B50" style={{ animation: 'dot-trigger-transit 8s linear infinite' }} />
                <circle cx="345" cy="60" r="5" fill="#4A4B50" style={{ animation: 'dot-trigger-delivery 8s linear infinite' }} />
                
                <text x="30" y="105" textAnchor="middle" fontSize="15" fill="#EB6534" fontFamily="sans-serif" fontWeight="bold">En Sucursal</text>
                <text x="194" y="105" textAnchor="middle" fontSize="15" fill="#88898E" fontFamily="sans-serif">En Tránsito</text>
                <text x="345" y="95" textAnchor="middle" fontSize="15" fill="#88898E" fontFamily="sans-serif">Entregado</text>
                
                <g>
                  <animateMotion 
                    dur="8s" 
                    repeatCount="indefinite" 
                    calcMode="paced"
                    path="M30 70 C120 20, 200 110, 345 60" 
                  />
                  
                  <circle cx="0" cy="0" r="20" fill="#EB6534" opacity="0.25" className="blur-[3px]" />
                  
                  <g transform="translate(-32, -42) scale(0.85)">
                    <rect x="12" y="30" width="26" height="22" rx="2" fill="white"/>
                    <line x1="16" y1="41" x2="34" y2="41" stroke="#e0e0e0" strokeWidth="1"/>
                    <rect x="12" y="47" width="26" height="4" fill="#EB6534"/>
                    <path d="M38,35 L44,35 Q49,35 50,40 L52,47 L38,47 Z" fill="white"/>
                    <rect x="38" y="47" width="14" height="4" fill="#EB6534"/>
                    <path d="M39,37 L44,37 Q47,37 48,41 L49,44 L39,44 Z" fill="#1A1A1A" opacity="0.3"/>
                    <circle cx="20" cy="53" r="5" fill="#1A1A1A"/>
                    <circle cx="20" cy="53" r="2.5" fill="#D5CFE1"/>
                    <circle cx="46" cy="53" r="5" fill="#1A1A1A"/>
                    <circle cx="46" cy="53" r="2.5" fill="#D5CFE1"/>
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO CLARO (El login pasa a tomar el resto del ancho y se centra) ── */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12 z-0">
        
        <div className="w-full max-w-[420px] bg-white p-8 md:p-12 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          
          <h2 className="text-[24px] font-bold text-gray-900 mb-1">Bienvenido de vuelta</h2>
          <p className="text-[14px] text-gray-700 font-medium mb-8">{t('login.subtitulo', 'Inicia sesión para continuar')}</p>

          <form className="space-y-6" onSubmit={handleLogin}>
            
            <div>
              <label htmlFor="email" className="block text-[13px] font-bold text-gray-900 mb-2">
                {t('login.email', 'Email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-500" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.placeholder_email', 'tu@email.com')}
                  disabled={isLoginLoading}
                  className="pl-11 w-full h-12 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#EB6534] focus:ring-1 focus:ring-[#EB6534] transition-colors rounded-xl text-[14px]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[13px] font-bold text-gray-900 mb-2">
                {t('login.password', 'Contraseña')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-500" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoginLoading}
                  className="pl-11 pr-12 w-full h-12 bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#EB6534] focus:ring-1 focus:ring-[#EB6534] transition-colors rounded-xl text-[14px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                  disabled={isLoginLoading}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <a href="#" className="text-[13px] text-[#EB6534] hover:text-[#d4562a] transition-colors font-semibold">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <Button 
              type="submit" 
              disabled={isLoginLoading}
              style={{ backgroundColor: '#EB6534' }}
              className="w-full h-12 text-white font-semibold rounded-xl mt-4 flex items-center justify-center gap-2 transition-colors shadow-none text-[15px] hover:bg-[#d4562a] !bg-[#EB6534]"
            >
              {isLoginLoading ? t('login.verificando', 'Verificando...') : (
                <>
                  {t('login.iniciar_sesion', 'Iniciar Sesión')}
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-[13px] text-gray-700 font-medium mt-10 leading-relaxed">
            ¿Necesitás acceso?<br />
            Contactá a tu administrador para crear tu cuenta.
          </p>
        </div>
      </div>
    </main>
  );
}