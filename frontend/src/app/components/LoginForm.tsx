import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import LoadingTruck from '@/components/LoadingTruck';

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  error: string;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  isLoginLoading: boolean;
  handleLogin: (e: React.FormEvent) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  error,
  showPassword,
  togglePasswordVisibility,
  isLoginLoading,
  handleLogin,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 items-center justify-center p-6 lg:p-12 z-0">
      <div className="relative overflow-hidden w-full max-w-[420px] bg-white p-8 md:p-12 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
        
        {isLoginLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <LoadingTruck />
            <p className="mt-4 text-xl font-medium text-gray-800">
              {t('login.iniciando_sesion', 'Iniciando sesión...')}
            </p>
          </div>
        )}

        <h2 className="text-[24px] font-bold text-gray-900 mb-1">{t('login.bienvenido')}</h2>
        <p className="text-[14px] text-gray-700 font-medium mb-8">
          {t('login.subtitulo', 'Inicia sesión para continuar')}
        </p>

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
                className="pl-11 w-full h-12 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-[#EB6534] transition-colors rounded-xl text-[14px]"
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
                className="pl-11 pr-12 w-full h-12 bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-[#EB6534] transition-colors rounded-xl text-[14px]"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                disabled={isLoginLoading}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          {/* }
          <div className="flex justify-end pt-1">
            <a href="#" className="text-[13px] text-[#EB6534] hover:text-[#d4562a] transition-colors font-semibold">
              {t('login.olvidaste_tu_contraseña')}
            </a>
          </div>
          */}

          {error && <p role="alert" className="text-sm text-red-600 font-medium">{t(error)}</p>}

          <Button 
            type="submit" 
            disabled={isLoginLoading}
            variant="brand"
            className="w-full h-12 rounded-xl mt-4 flex items-center justify-center gap-2 shadow-none text-[15px]"
          >
            {isLoginLoading ? t('login.verificando', 'Verificando...') : (
              <>{t('login.iniciar_sesion', 'Iniciar Sesión')}</>
            )}
          </Button>
        </form>

        <p className="text-center text-[13px] text-gray-700 font-medium mt-10 leading-relaxed">
          {t('login.necesitas_acceso')}<br />
          {t('login.contacta_tu_administrador')}
        </p>
      </div>
    </div>
  );
};