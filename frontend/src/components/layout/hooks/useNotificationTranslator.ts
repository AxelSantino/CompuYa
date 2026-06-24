import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
// Asegúrate de importar la interfaz Alerta desde donde la tengas definida
import { Alerta } from './useNotificationBell'; 

export const useNotificationTranslator = () => {
    const { t } = useTranslation();

    const translateNotification = useCallback((alerta: Alerta): Alerta => {
        const rawTitle = alerta.titulo || "";
        const rawMessage = alerta.mensaje || "";
        
        let translatedTitle = rawTitle;
        let translatedMessage = rawMessage;

        // 1. Extraemos el tracking ID con Regex
        const trackingMatch = rawMessage.match(/CY-\d{4}-[A-Z0-9]+/);
        const tracking_id = trackingMatch ? trackingMatch[0] : "";

        // 2. Mapeamos por palabras clave del backend
        if (rawTitle.includes("preparando")) {
            translatedTitle = t('notificaciones.PREPARANDO_TITULO');
            translatedMessage = t('notificaciones.PREPARANDO_CUERPO', { tracking_id });
        } 
        else if (rawTitle.includes("Entregado")) {
            translatedTitle = t('notificaciones.ENTREGADO_TITULO');
            translatedMessage = t('notificaciones.ENTREGADO_CUERPO', { tracking_id });
        } 
        else if (rawTitle.includes("Cancelado")) {
            translatedTitle = t('notificaciones.CANCELADO_TITULO');
            translatedMessage = t('notificaciones.CANCELADO_CUERPO', { tracking_id });
        } 
        else if (rawTitle.includes("Actualizado")) {
            const estadoMatch = rawTitle.match(/Actualizado a (.*)/);
            const estado = estadoMatch ? estadoMatch[1] : "";
            translatedTitle = t('notificaciones.ACTUALIZADO_TITULO', { estado });
            translatedMessage = t('notificaciones.ACTUALIZADO_CUERPO', { tracking_id, estado });
        } 
        else if (rawTitle.includes("Tránsito")) {
            const pinMatch = rawMessage.match(/es:\s*([A-Z0-9]+)/i);
            const pin = pinMatch ? pinMatch[1] : "";
            translatedTitle = t('notificaciones.EN_TRANSITO_TITULO');
            translatedMessage = t('notificaciones.EN_TRANSITO_CUERPO', { tracking_id, pin });
        }

        return {
            ...alerta,
            titulo: translatedTitle,
            mensaje: translatedMessage
        };
    }, [t]);

    return { translateNotification };
};