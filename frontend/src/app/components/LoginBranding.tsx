
import Image from 'next/image';

import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';
import { FaBox } from 'react-icons/fa'; 

export const LoginBranding = () => {

    const {t} = useTranslation();

  return (
    <div className="hidden lg:flex flex-col w-[60%] xl:w-[65%] relative overflow-hidden z-10 bg-gradient-to-br from-[#25272B] via-[#1E1F24] to-[#18191D]">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:32px_32px]" />
      </div>
      <div className="absolute -top-52 -left-20 w-[700px] h-[700px] rounded-full border border-[#EB6534]/30" />
      <div className="absolute top-[-15%] right-[-10%] w-[75%] h-[130%] bg-white/[0.03] rounded-[50%]" />
      <div className="absolute bottom-[-300px] right-[-200px] w-[800px] h-[800px] rounded-full bg-white/[0.03]" />

      <div className="relative z-20 flex flex-col h-full p-8 xl:p-12">
        
        {/* Logo */}
        <div>
          <Image
            src="/LogoCompuYaBlanco.svg"
            alt="CompuYa"
            width={180}
            height={60}
            priority
          />
        </div>

        {/* Textos y métricas */}
        <div className="flex flex-col flex-grow mt-8 w-full">
          <div className="w-full">
            <h1 className="flex flex-col">
              {/* 1. "Compu" en blanco y "Ya" en naranja */}
              <span className="text-[56px] xl:text-[72px] 2xl:text-[92px] font-bold leading-none tracking-[-2px]">
                <span className="text-white">Compu</span>
                <span className="text-[#EB6534]">Ya</span>
              </span>
              
              {/* 2. Eslogan más chico y alineado */}
              <span className="block text-gray-300 text-[28px] xl:text-[36px] 2xl:text-[44px] font-bold mt-1 tracking-tight">
                {t('login.logistica_de_extremo_a_extremo')}
              </span>
            </h1>
            
            <p className="text-gray-400 text-[18px] xl:text-[20px] max-w-[550px] mt-4 ml-2 leading-relaxed">
              {t('login.controla_cada_etapa_de_tus_envios')}
            </p>

            <div className="mt-8 ml-2 w-[320px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-2xl">
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-full bg-[#EB6534] flex items-center justify-center text-white text-xl">
                  <FaBox className="text-lg" />
                </div>
                <div>
                  <p className="text-white font-semibold tracking-wide">
                    CY-2026-CTJ4
                  </p>
                  <p className="text-[#EB6534] text-sm font-medium mt-0.5">
                    {t('login.en_transito')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 ml-4 flex items-center gap-6 text-[13px] text-gray-400 font-medium tracking-wide">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EB6534]/80"></div>
                {t('login.envios_gestionados')}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EB6534]/80"></div>
                {t('login.entregas_exitosas')}
              </div>
            </div>
          </div>

          {/* Animación SVG */}
          <div className="mt-auto pt-6 w-full flex justify-end pr-4 xl:pr-16">
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes trail-grow { 0% { stroke-dashoffset: 100; } 80%, 100% { stroke-dashoffset: 0; } }
              @keyframes dot-trigger-transit { 0%, 49% { fill: #4A4B50; } 50%, 100% { fill: #EB6534; } }
              @keyframes dot-trigger-delivery { 0%, 97% { fill: #4A4B50; } 98%, 100% { fill: #EB6534; } }
            `}} />
            
            <svg viewBox="0 0 380 140" className="w-full max-w-[500px] xl:max-w-[700px] 2xl:max-w-[850px] overflow-visible">
              
              {/* Filtro nativo SVG para el brillo, compatible con Safari/iOS */}
              <defs>
                <filter id="orange-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Estilos con keyframes sincronizados */}
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes trail-grow { 0% { stroke-dashoffset: 100; } 80%, 100% { stroke-dashoffset: 0; } }
                @keyframes dot-trigger-transit { 0%, 54% { fill: #4A4B50; } 55%, 100% { fill: #EB6534; } }
                @keyframes dot-trigger-delivery { 0%, 97% { fill: #4A4B50; } 98%, 100% { fill: #EB6534; } }
                @keyframes text-trigger-transit { 0%, 54% { fill: #88898E; } 55%, 100% { fill: #EB6534; } }
                @keyframes text-trigger-delivery { 0%, 97% { fill: #88898E; } 98%, 100% { fill: #EB6534; } }
              `}} />

              {/* Línea de ruta base (gris) */}
              <path 
                d="M30 70 C120 20, 200 110, 345 60" 
                fill="none" 
                stroke="#4A4B50" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />
              
              {/* Línea de progreso animada (naranja) */}
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
        
              {/* Nodos interactivos */}
              <circle cx="30" cy="70" r="6" fill="#EB6534" />
              <circle cx="194" cy="71" r="5" fill="#4A4B50" style={{ animation: 'dot-trigger-transit 8s linear infinite' }} />
              <circle cx="345" cy="60" r="5" fill="#4A4B50" style={{ animation: 'dot-trigger-delivery 8s linear infinite' }} />
              
              {/* Textos sincronizados */}
              <text x="30" y="105" textAnchor="middle" fontSize="15" fill="#EB6534" fontFamily="sans-serif" fontWeight="bold">
                {t('login.en_sucursal')}
              </text>
              <text x="194" y="105" textAnchor="middle" fontSize="15" fill="#88898E" fontFamily="sans-serif" fontWeight="bold" style={{ animation: 'text-trigger-transit 8s linear infinite' }}>
                {t('login.en_transito')}
              </text>
              <text x="345" y="95" textAnchor="middle" fontSize="15" fill="#88898E" fontFamily="sans-serif" fontWeight="bold" style={{ animation: 'text-trigger-delivery 8s linear infinite' }}>
                {t('login.entregado')}
              </text>
              
              {/* Grupo del camión en movimiento */}
              <g>
                <animateMotion 
                  dur="8s" 
                  repeatCount="indefinite" 
                  calcMode="paced" 
                  path="M30 70 C120 20, 200 110, 345 60" 
                />
                
                {/* Aura de luz con el filtro nativo aplicado */}
                {/* <circle cx="0" cy="0" r="20" fill="#EB6534" opacity="0.25" filter="url(#orange-glow)" /> */}
                
                {/* Dibujo del camión */}
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
  );
};