import { Select } from '@/components/ui/Select';
import { ShipmentSectionProps } from './RecipientSection';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';


export const ComponentDetailsSection = ({ formData, handleChange, isLoading }: ShipmentSectionProps) => {
    const {t} = useTranslation();

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span aria-hidden="true" className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></span>
                    {t('componentDetailsSection.detalles_del_componente')}
                </h3>
            </div>

            <div className="space-y-6 text-gray-800">
                {/* TEXTAREA DESCRIPCIÓN */}
                <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('componentDetailsSection.descripcion_del_componente')} 
                        <span aria-hidden="true" className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        rows={3}
                        value={formData.descripcion}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow disabled:bg-gray-50"
                        placeholder={t('componentDetailsSection.placeholder_desc_comp')}
                        required
                        disabled={isLoading}
                        // 1. a11y: Vinculamos el texto de ayuda inferior usando aria-describedby
                        aria-describedby="desc-help"
                    ></textarea>
                    <p id="desc-help" className="text-xs text-gray-600 mt-2">
                        {t('componentDetailsSection.especifica_marca')}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SELECT TIPO DE ENVÍO */}
                    <div>
                        <label htmlFor="tipo_envio" className="block text-sm font-medium text-gray-700 mb-2">
                            {t('componentDetailsSection.tipo_envio')} 
                            <span aria-hidden="true" className="text-red-500 ml-1">*</span>
                        </label>
                        <Select id="tipo_envio" name="tipo_envio" value={formData.tipo_envio} onChange={handleChange} disabled={isLoading}>
                            <option value="normal">{t('componentDetailsSection.tipos.normal', 'Normal')}</option>
                            <option value="express">{t('componentDetailsSection.tipos.express', 'Express')}</option>
                        </Select>
                    </div>
                    {/* SELECT MANEJO ESPECIAL */}
                    <div>
                        <label htmlFor="restriccion" className="block text-sm font-medium text-gray-700 mb-2">
                            {t('componentDetailsSection.manejo_especial')} 
                            <span aria-hidden="true" className="text-red-500 ml-1">*</span>
                        </label>
                        <Select 
                            id="restriccion" 
                            name="restriccion" 
                            value={formData.restriccion} 
                            onChange={handleChange} 
                            disabled={isLoading}
                            // a11y: Vinculamos el texto de ayuda
                            aria-describedby="restriccion-help"
                        >
                            <option value="ninguna">{t('componentDetailsSection.ninguna_comp_estandar')}</option>
                            <option value="fragil">{t('componentDetailsSection.fragil')}</option>
                            <option value="valioso">{t('componentDetailsSection.valioso')}</option>
                        </Select>
                        <p id="restriccion-help" className="text-xs text-gray-600 mt-2">
                            {t('componentDetailsSection.requerimientos_especiales')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};