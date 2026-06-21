'use client';

import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/i18n/LanguageSwitcher';
import LoadingTruck from '@/components/LoadingTruck';

import { useLogin } from './hooks/useLogin';
import { LoginBranding } from './components/LoginBranding';
import { LoginForm } from './components/LoginForm';

export default function LoginPage() {
  const { t } = useTranslation();
  const {
    email, setEmail,
    password, setPassword,
    error,
    showPassword, togglePasswordVisibility,
    isExiting,
    isLoginLoading,
    handleLogin
  } = useLogin();

  return (
    <main 
      className={`relative flex min-h-screen lg:h-screen w-full bg-[#F4F5F7] lg:overflow-hidden transition-opacity duration-400 ease-in-out ${isExiting ? 'opacity-0' : 'opacity-100'}`}
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

      {/* Componente visual de la izquierda */}
      <LoginBranding />

      {/* Componente funcional de la derecha */}
      <LoginForm 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
        showPassword={showPassword}
        togglePasswordVisibility={togglePasswordVisibility}
        isLoginLoading={isLoginLoading}
        handleLogin={handleLogin}
      />
    </main>
  );
}