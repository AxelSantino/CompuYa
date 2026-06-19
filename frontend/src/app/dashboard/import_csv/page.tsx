'use client';

import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

// Layout y Seguridad
import DashboardLayout from '@/components/layout/DashboardLayout';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';

// Componentes UI Genéricos
import { Button } from '@/components/ui/Button';

// Hook
import { useCsvImport } from '@/app/dashboard/import_csv/hooks/useCsvImport';

// Componentes Visuales
import { CsvInstructions } from '@/app/dashboard/import_csv/components/CsvInstructions';
import { FileDropzone } from '@/app/dashboard/import_csv/components/FileDropZone';
import { ValidationFeedback } from '@/app/dashboard/import_csv/components/ValidationFeedback';
import { ImportResults } from '@/app/dashboard/import_csv/components/ImportResults';

// Traduccion
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

const ImportCsvPage = () => {
  const router = useRouter();
  const { user } = useAuth();

  const {t} = useTranslation();

  const {
    file,
    isValidating,
    isImporting,
    validationErrors,
    validationSuccess,
    importResults,
    generalError,
    handleFileSelect,
    validateFile,
    confirmImport,
    resetProcess,
  } = useCsvImport();

  // Protección de la ruta según los roles del endpoint del backend
  if (!user || !['operador', 'supervisor'].includes(user.rol)) {
    return (
      <DashboardLayout>
        <div className="py-16 text-center text-gray-700 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-xl font-bold text-red-600 mb-2">{t('importCsvPage.acceso_denegado')}</p>
          <p className="text-gray-500">{t('importCsvPage.no_contas_con_permisos_necesarios')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
        
        {/* =========================================
            1. HEADER Y NAVEGACIÓN
            ========================================= */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-orange-600 transition-colors p-2 rounded-full hover:bg-orange-50"
            title="Volver a Envíos"
          >
            <FaArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t('importCsvPage.importar_envios_por_csv')}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {t('importCsvPage.agrega_multiples_envios_al_sistema')}
            </p>
          </div>
        </div>

        {/* =========================================
            2. FLUJO PRINCIPAL DE PANTALLA
            ========================================= */}
        {/* Si ya hay resultados finales, limpiamos la pantalla y mostramos solo el resumen */}
        {!importResults ? (
          <div className="animate-in fade-in duration-300">
            <CsvInstructions />

            <FileDropzone
              selectedFile={file}
              onFileSelect={handleFileSelect}
              disabled={isValidating || isImporting}
            />

            <ValidationFeedback
              generalError={generalError}
              validationErrors={validationErrors}
              isSuccess={validationSuccess}
            />
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <ImportResults results={importResults} />
          </div>
        )}

        {/* =========================================
            3. BOTONERA INFERIOR (Acciones)
            ========================================= */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
          
          {importResults ? (
            /* BOTONERA POST-IMPORTACIÓN */
            <>
              <Button variant="secondary" onClick={() => router.push('/dashboard')}>
                {t('importCsvPage.ir_a_lista_de_envios')}
              </Button>
              <Button variant="primary" onClick={resetProcess}>
                {t('importCsvPage.importar_otro_archivo')}
              </Button>
            </>
          ) : (
            /* BOTONERA DURANTE EL PROCESO */
            <>
              <Button
                variant="secondary"
                onClick={resetProcess}
                disabled={isValidating || isImporting || !file}
              >
                {t('importCsvPage.limpiar')}
              </Button>

              {/* Lógica condicional: Validar (Azul) vs Confirmar (Verde) */}
              {!validationSuccess ? (
                <Button
                  variant="primary"
                  onClick={validateFile}
                  disabled={!file || isValidating}
                >
                  {isValidating ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      {t('importCsvPage.validando')}
                    </span>
                  ) : (
                    t('importCsvPage.validar_archivo')
                  )}
                </Button>
              ) : (
                <Button
                  variant="success"
                  onClick={confirmImport}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      {t('importCsvPage.procesando')}
                    </span>
                  ) : (
                    t('importCsvPage.confirmar_e_importar')
                  )}
                </Button>
              )}
            </>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default withAuth(ImportCsvPage, ['operador', 'supervisor']);