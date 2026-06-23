'use client';

import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

// Layout y Seguridad
import DashboardLayout from '@/components/layout/DashboardLayout';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';

// Componentes UI Genéricos
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';

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
        <div role="alert" className="py-16 text-center bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-xl font-bold text-red-600 mb-2">{t('importCsvPage.acceso_denegado')}</p>
          <p className="text-gray-600">{t('importCsvPage.no_contas_con_permisos_necesarios')}</p>
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
          <BackButton 
            label="" // Si no quieres que diga "Volver", puedes dejarlo vacío o pasarle un label oculto visualmente. Asumiré que lo usaremos solo como ícono aquí, o le agregamos el texto.
            onClick={() => router.push('/dashboard')}
            title={t('importCsvPage.volver_a_envios', 'Volver a Envíos')}
            className="self-start mt-1"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t('importCsvPage.importar_envios_por_csv')}</h1>
            <p className="text-sm text-gray-600 mt-1">
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
              <Button className="w-full sm:w-auto" variant="secondary" onClick={() => router.push('/dashboard')}>
                {t('importCsvPage.ir_a_lista_de_envios')}
              </Button>
              <Button className="w-full sm:w-auto" variant="primary" onClick={resetProcess}>
                {t('importCsvPage.importar_otro_archivo')}
              </Button>
            </>
          ) : (
            /* BOTONERA DURANTE EL PROCESO */
            <>
              <Button
                className="w-full sm:w-auto"
                variant="secondary"
                onClick={resetProcess}
                disabled={isValidating || isImporting || !file}
              >
                {t('importCsvPage.limpiar')}
              </Button>

              {/* Lógica condicional: Validar (Azul) vs Confirmar (Verde) */}
              {!validationSuccess ? (
                <Button
                  className="w-full sm:w-auto"
                  variant="primary"
                  onClick={validateFile}
                  disabled={!file || isValidating}
                  aria-busy={isValidating}
                >
                  {isValidating ? (
                    <span className="flex items-center justify-center gap-2">
                      <span aria-hidden="true" className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      {t('importCsvPage.validando')}
                    </span>
                  ) : (
                    t('importCsvPage.validar_archivo')
                  )}
                </Button>
              ) : (
                <Button
                  className="w-full sm:w-auto"
                  variant="success"
                  onClick={confirmImport}
                  disabled={isImporting}
                  aria-busy={isImporting} 
                >
                  {isImporting ? (
                    <span className="flex items-center justify-center gap-2">
                      {/* 6. a11y: Spinner oculto */}
                      <span aria-hidden="true" className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
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