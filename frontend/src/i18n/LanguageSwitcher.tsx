'use client';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex gap-2 p-1 bg-gray-200 rounded-lg">
      <button 
        onClick={() => i18n.changeLanguage('es')} 
        className={`px-3 py-1 rounded-md font-medium transition-all ${
          i18n.language === 'es' 
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'text-gray-900 hover:bg-gray-300' // Forzamos texto negro/oscuro
        }`}
      >
        ES
      </button>
      <button 
        onClick={() => i18n.changeLanguage('en')} 
        className={`px-3 py-1 rounded-md font-medium transition-all ${
          i18n.language === 'en' 
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'text-gray-900 hover:bg-gray-300' // Forzamos texto negro/oscuro
        }`}
      >
        EN
      </button>
    </div>
  );
}