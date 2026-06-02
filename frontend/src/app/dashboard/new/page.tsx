'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import withAuth from '@/components/auth/withAuth';
import shipmentService from '@/services/shipmentService';
import { useRouter } from 'next/navigation';

const NewShipmentPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        razon_social_destinatario: '',
        cuit_destinatario: '',
        consent: false,
        descripcion: '',
        tipo_envio: 'normal',
        restriccion: 'ninguna',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const { consent, ...shipmentData } = formData;
            if (!consent) {
                setError("Debes aceptar el consentimiento para el tratamiento de datos.");
                setIsLoading(false);
                return;
            }
            await shipmentService.createShipment(shipmentData);
            router.push('/dashboard');
        } catch (err: any) {
            let errorMessage = 'Error al crear el envío. Por favor, revisa los datos e intenta de nuevo.';
            
            if (err.response?.data?.detail) {
                if (typeof err.response.data.detail === 'string') {
                    errorMessage = err.response.data.detail;
                } else if (Array.isArray(err.response.data.detail)) {
                    // Si es una lista de errores de Pydantic, tomamos el mensaje del primero
                    errorMessage = err.response.data.detail[0]?.msg || errorMessage;
                }
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6 group"
        >
          <span className="mr-1 group-hover:-translate-x-1 transition-transform inline-block">←</span> Volver
        </button>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Registrar Nuevo Envío</h2>
        <p className="text-gray-600 mb-8">
          Completa los datos del destinatario y del componente de computadora.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
              Datos del Destinatario
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="razon_social_destinatario" className="block text-sm font-medium text-gray-700 mb-2">
                  Razón Social / Nombre Completo <span className="text-red-500">*</span>
                </label>
                <Input
                  id="razon_social_destinatario"
                  name="razon_social_destinatario"
                  value={formData.razon_social_destinatario}
                  onChange={handleChange}
                  placeholder="Ej. TechStore Argentina S.A. o Juan Pérez"
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="cuit_destinatario" className="block text-sm font-medium text-gray-700 mb-2">
                  CUIT/CUIL del Destinatario <span className="text-red-500">*</span>
                </label>
                <Input
                  id="cuit_destinatario"
                  name="cuit_destinatario"
                  value={formData.cuit_destinatario}
                  onChange={handleChange}
                  placeholder="Ej. 30123456789 (CUIT) o 20123456789 (CUIL)"
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                <Checkbox
                  id="consent"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  label="Se cuenta con el consentimiento para el tratamiento de datos personales (Ley 25.326)."
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></span>
                  Detalles del Componente y Envío
                </h3>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Componente <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  rows={3}
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow disabled:bg-gray-50"
                  placeholder="Ej. Tarjeta gráfica NVIDIA RTX 4090, Procesador AMD Ryzen 9 7950X..."
                  required
                  disabled={isLoading}
                ></textarea>
                 <p className="text-xs text-gray-400 mt-2">Especifica marca, modelo y características principales del componente.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="tipo_envio" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Envío <span className="text-red-500">*</span>
                    </label>
                    <Select id="tipo_envio" name="tipo_envio" value={formData.tipo_envio} onChange={handleChange} disabled={isLoading}>
                        <option value="normal">Normal</option>
                        <option value="express">Express</option>
                    </Select>
                </div>
                <div>
                    <label htmlFor="restriccion" className="block text-sm font-medium text-gray-700 mb-2">
                    Manejo Especial <span className="text-red-500">*</span>
                    </label>
                    <Select id="restriccion" name="restriccion" value={formData.restriccion} onChange={handleChange} disabled={isLoading}>
                        <option value="ninguna">Ninguna - Componente estándar</option>
                        <option value="fragil">Frágil</option>
                        <option value="valioso">Valioso</option>
                    </Select>
                    <p className="text-xs text-gray-400 mt-2">Requerimientos especiales para el transporte.</p>
                </div>
              </div>
            </div>
          </div>
          
          {error ? (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm animate-pulse">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <Button 
              variant="secondary" 
              type="button" 
              onClick={() => router.push('/dashboard')} 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto shadow-md"
            >
              {isLoading ? 'Registrando...' : 'Generar Tracking ID y Registrar'}
            </Button>
          </div>
          <p className="text-xs text-center text-gray-400 pb-8">Los campos con (*) son obligatorios.</p>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default withAuth(NewShipmentPage);
