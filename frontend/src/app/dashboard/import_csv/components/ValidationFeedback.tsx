import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { ValidationError } from '@/types/importacion';

import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

/*
    Se encarga de mostrar si el archivo está roto de forma general (ej. no es CSV), 
    si tiene errores de datos en las filas, o si está perfecto para importar.
*/

interface ValidationFeedbackProps {
  generalError: string | null;
  validationErrors: ValidationError[];
  isSuccess: boolean;
}

export const ValidationFeedback = ({ generalError, validationErrors, isSuccess }: ValidationFeedbackProps) => {
  const {t} = useTranslation();
  
    if (isSuccess) {
    return (
      <div role="alert" className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 mb-6">
        <FaCheckCircle aria-hidden="true" className="text-green-500 mt-0.5" size={20} />
        <div>
          <h4 className="text-green-800 font-bold">{t('importCsvPage.archivo_validado_correctamente')}</h4>
          <p className="text-green-700 text-sm">{t('importCsvPage.formato_correcto_datos_listos')}</p>
        </div>
      </div>
    );
  }

  if (generalError || validationErrors.length > 0) {
    return (
      <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-red-800 font-bold mb-3">
          <FaExclamationTriangle aria-hidden="true" />
          <h4>{t('importCsvPage.errores_en_el_archivo')}</h4>
        </div>
        
        {generalError && (
          <p className="text-sm text-red-700 bg-red-100 p-2 rounded mb-3">{generalError}</p>
        )}

        {validationErrors.length > 0 && (
          <div 
            // 2. a11y: Permite a los usuarios de teclado enfocar el div para hacer scroll
            tabIndex={0}
            // 3. a11y: Etiqueta para que el lector avise de qué trata este contenedor
            aria-label={t('importCsvPage.lista_errores_validacion', 'Lista de errores de validación')}
            className="max-h-60 overflow-y-auto focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
          >
            <table className="w-full text-sm text-left">
              <thead className="bg-red-100 text-red-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2 rounded-tl-md">{t('importCsvPage.fila')}</th>
                  <th className="px-3 py-2 rounded-tr-md">{t('importCsvPage.detalle_del_error')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {validationErrors.map((err, idx) => (
                  <tr key={idx} className="text-red-700 hover:bg-red-100/50">
                    <td className="px-3 py-2 font-mono font-bold w-20">#{err.fila}</td>
                    <td className="px-3 py-2">
                      <ul className="list-disc list-inside">
                        {err.errores.map((msg, i) => <li key={i}>{msg}</li>)}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return null;
};