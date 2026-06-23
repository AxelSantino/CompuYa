import { useState, useEffect, useCallback } from 'react';
import notificationService from '@/services/notificationService';
import { HistorialNotificacion, PlantillaCorreo } from '@/types/notificacion';
import toast from 'react-hot-toast';
// 1. Importamos las herramientas de i18n y manejo de errores globales
import { useTranslation } from 'react-i18next';
import { useErrorTranslator } from '@/hooks/useErrorTranslator';

export type TabType = 'templates' | 'history';

export const useNotifications = () => {
    // 2. Instanciamos los hooks
    const { t } = useTranslation();
    const { translateError } = useErrorTranslator();

    const [activeTab, setActiveTab] = useState<TabType>('templates');

    const [templates, setTemplates] = useState<PlantillaCorreo[]>([]);
    const [history, setHistory] = useState<HistorialNotificacion[]>([]);

    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const [historyLoaded, setHistoryLoaded] = useState(false);

    // 1. Carga inicial de templates
    const loadTemplates = useCallback(async () => {
        setIsLoadingTemplates(true);
        try {
            const data = await notificationService.getPlantillas();
            setTemplates(data);
        } catch (error) {
            // Arquitectura: Delegamos la interpretación del error a nuestra función centralizada
            toast.error(translateError(error, 'notificationsPage.error_cargar_templates'));
            console.error(error);
        } finally {
            setIsLoadingTemplates(false);
        }
    // 3. React Hook Rules: Agregamos translateError a las dependencias
    }, [translateError]);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    // 2. Carga Manual del Historial
    const loadHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const data = await notificationService.getHistorial();
            setHistory(data);
            setHistoryLoaded(true);
            // i18n: Pasamos el mensaje de éxito por el traductor
            toast.success(t('notificationsPage.success_historial_cargado', 'Historial cargado exitosamente.'));
        } catch (error) {
            // Arquitectura: Delegamos el error
            toast.error(translateError(error, 'notificationsPage.error_descargar_historial'));
            console.error(error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // 3. Actualización de Plantilla
    const handleUpdateTemplate = async (plantillaActualizada: PlantillaCorreo) => {
        setIsUpdating(true);
        try {
            const data = await notificationService.updatePlantilla(plantillaActualizada.id, plantillaActualizada);
            
            setTemplates(prev => prev.map(p => p.id === data.id ? data : p));
            
            // i18n: Pasamos el mensaje de éxito por el traductor
            toast.success(t('notificationsPage.success_plantilla_actualizada', 'Plantilla actualizada correctamente.'));
            return true;
        } catch (error) {
            // Arquitectura: Delegamos el error
            toast.error(translateError(error, 'notificationsPage.error_guardar_plantilla'));
            console.error(error);
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        activeTab,
        setActiveTab,
        templates,
        history,
        isLoadingTemplates,
        isLoadingHistory,
        isUpdating,
        historyLoaded,
        loadHistory,
        handleUpdateTemplate
    };
};