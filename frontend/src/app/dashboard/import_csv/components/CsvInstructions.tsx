import { FaDownload, FaInfoCircle } from 'react-icons/fa';

import '@/i18n/i18n';
import { useTranslation, Trans } from 'react-i18next';

/*
    Le explica al usuario qué espera el sistema e incluye una función muy 
    útil que genera la plantilla CSV vacía sobre la marcha, sin necesidad de pegarle al servidor.
*/

export const CsvInstructions = () => {
  const handleDownloadTemplate = () => {
    // Generamos el CSV vacío solo con las cabeceras requeridas por el backend
    const headers = "razon_social_destinatario,cuit_destinatario,descripcion,tipo_envio,restriccion\n";
    const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = t('importCsvPage.plantilla_importacion_envios');
    link.click();
    URL.revokeObjectURL(url);
  };

  const {t} = useTranslation();

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mb-6">
      <div className="flex items-center gap-2 text-blue-800 font-bold mb-3">
        <FaInfoCircle size={18} />
        <h3>{t('importCsvPage.instrucciones_de_importacion')}</h3>
      </div>
      
      <p className="text-sm text-blue-900 mb-4">
        <Trans
            i18nKey="importCsvPage.instrucciones_formato"
            components={{ bold: <strong /> }}
        />
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 mb-4 bg-white/60 p-4 rounded border border-blue-100">
        <ul className="list-disc list-inside space-y-1">
          <li><code className="bg-blue-100 px-1 py-0.5 rounded">razon_social_destinatario</code></li>
          <li><code className="bg-blue-100 px-1 py-0.5 rounded">cuit_destinatario</code></li>
          <li><code className="bg-blue-100 px-1 py-0.5 rounded">descripcion</code></li>
        </ul>
        <ul className="list-disc list-inside space-y-1">
          <li><code className="bg-blue-100 px-1 py-0.5 rounded">tipo_envio</code> ({t('importCsvPage.revisar_mayusculas')})</li>
          <li><code className="bg-blue-100 px-1 py-0.5 rounded">restriccion</code> ({t('importCsvPage.revisar_mayusculas')})</li>
        </ul>
      </div>

      <button 
        onClick={handleDownloadTemplate}
        className="flex items-center gap-2 text-sm bg-white text-blue-700 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-md transition-colors font-medium"
      >
        <FaDownload />
        {t('importCsvPage.descargar_plantilla_vacia')}
      </button>
    </div>
  );
};