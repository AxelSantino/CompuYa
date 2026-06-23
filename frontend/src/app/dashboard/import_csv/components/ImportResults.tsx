import { ConfirmImportResponse } from '@/types/importacion';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

interface ImportResultsProps {
  results: ConfirmImportResponse | null;
}

export const ImportResults = ({ results }: ImportResultsProps) => {
  const {t} = useTranslation();
  
  if (!results) return null;

  return (
    <div className="space-y-6 mb-6">
      {/* Resumen General */}
      <div role="status" className={`p-4 rounded-lg border ${results.creados.length > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <h3 className={`font-bold text-lg ${results.creados.length > 0 ? 'text-green-800' : 'text-red-800'}`}>
          {/* Mensaje proveniente del backend */}
          {results.mensaje}
        </h3>
      </div>

      {/* Tabla de Éxitos */}
      {results.creados.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <FaCheckCircle aria-hidden="true" className="text-green-500" />
            <h4 className="font-semibold text-gray-700">
                {t('importCsvPage.envios_creados', { cantidad: results.creados.length })}
            </h4>
          </div>
          <div 
            tabIndex={0}
            aria-label={t('importCsvPage.lista_envios_creados', 'Lista de envíos creados exitosamente')}
            className="max-h-60 overflow-y-auto focus:outline-none focus:ring-2 focus:ring-green-500 rounded-b-lg"
          >
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 font-medium text-gray-600">{t('importCsvPage.tracking_id')}</th>
                  <th className="px-4 py-2 font-medium text-gray-600">{t('importCsvPage.destinatario')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.creados.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {/* 4. Contraste mejorado a text-gray-600 */}
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">{item.tracking_id}</td>
                    <td className="px-4 py-2 font-medium text-gray-800">{item.destinatario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla de Errores de Inserción */}
      {results.errores.length > 0 && (
        <div className="border border-red-200 rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex items-center gap-2">
            {/* 2. a11y: Ícono silenciado */}
            <FaTimesCircle aria-hidden="true" className="text-red-500" />
            <h4 className="font-semibold text-red-800">
                {t('importCsvPage.fallos_al_guardar', { errores: results.errores.length })}
            </h4>
          </div>
          {/* 3. a11y: Contenedor con scroll accesible por teclado */}
          <div 
            tabIndex={0}
            aria-label={t('importCsvPage.lista_errores_guardado', 'Lista de errores al intentar guardar')}
            className="max-h-60 overflow-y-auto focus:outline-none focus:ring-2 focus:ring-red-500 rounded-b-lg"
          >
            <table className="w-full text-sm text-left">
              <thead className="bg-red-100 sticky top-0 text-red-800">
                <tr>
                  <th className="px-4 py-2 font-medium">{t('importCsvPage.fila')}</th>
                  <th className="px-4 py-2 font-medium">{t('importCsvPage.motivo_del_error')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {results.errores.map((item, idx) => (
                  <tr key={idx} className="hover:bg-red-50 text-red-700">
                    <td className="px-4 py-2 font-mono w-20">#{item.fila}</td>
                    <td className="px-4 py-2">{item.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};