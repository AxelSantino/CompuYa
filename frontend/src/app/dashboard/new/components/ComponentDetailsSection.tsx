import React from 'react';
import { Select } from '@/components/ui/Select';
import { ShipmentSectionProps } from './RecipientSection';
import { Input } from '@/components/ui/Input';

export const ComponentDetailsSection = ({ formData, handleChange, isLoading }: ShipmentSectionProps) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></span>
                    Detalles del Componente y Envío
                </h3>
            </div>
            <div className="space-y-6 text-gray-800">
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
    );
};