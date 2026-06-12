import logging
from datetime import datetime
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from email.message import EmailMessage
import aiosmtplib

from app.models.entidades import PlantillaNotificacion, HistorialNotificacion, Envio 
from app.config import settings

logger = logging.getLogger(__name__)

PLANTILLA_HTML_BASE = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CompuYa — Actualización de envío</title>
</head>
<body style="margin:0;padding:0;background:#f5f4f2;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f2;padding:36px 16px;">
        <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e4e0db;">
    <tr>
    <td style="padding:32px 40px 28px;border-bottom:1px solid #ede9e4;text-align:center;">
        <img src="https://iziqikqvzfbnmuwrxuev.supabase.co/storage/v1/object/public/assets/LogoCompuYa.png" alt="CompuYa" width="220" style="display:inline-block;" />
    </td>
    </tr>
    <tr>
    <td style="padding:32px 40px 0;">
    <p style="margin:0 0 6px;font-size:11px;color:#bbb;text-transform:uppercase;letter-spacing:1.3px;font-weight:600;">Estado del envío</p>
    <p style="margin:0;font-size:28px;font-weight:700;color:#1a1a1a;letter-spacing:-0.4px;">{estado_texto}</p>
    <div style="margin:14px 0 0;height:3px;width:48px;background:#E8521A;border-radius:2px;"></div>
    </td>
    </tr>
    <tr>
    <td style="padding:24px 40px 0;">
    <p style="margin:0 0 12px;font-size:15px;color:#1a1a1a;line-height:1.6;">Hola, <strong>{nombre_cliente}</strong>.</p>
    
    <p style="margin:0;font-size:14px;color:#666;line-height:1.8;">{mensaje_estado}</p>
    
    </td>
    </tr>
    <tr>
    <td style="padding:24px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f7;border-radius:6px;border:1px solid #ede9e4;">
    <tr><td style="padding:12px 18px;border-bottom:1px solid #ede9e4;">
        <span style="font-size:11px;color:#bbb;text-transform:uppercase;letter-spacing:1px;font-weight:600;display:block;margin-bottom:3px;">Código de envío</span>
        <span style="font-size:14px;color:#E8521A;font-weight:700;font-family:monospace;">{codigo_envio}</span>
    </td></tr>
    <tr><td style="padding:12px 18px;border-bottom:1px solid #ede9e4;">
        <span style="font-size:11px;color:#bbb;text-transform:uppercase;letter-spacing:1px;font-weight:600;display:block;margin-bottom:3px;">Producto</span>
        <span style="font-size:14px;color:#1a1a1a;font-weight:600;">{descripcion_producto}</span>
    </td></tr>
    <tr><td style="padding:12px 18px;">
        <span style="font-size:11px;color:#bbb;text-transform:uppercase;letter-spacing:1px;font-weight:600;display:block;margin-bottom:3px;">Actualización</span>
        <span style="font-size:14px;color:#1a1a1a;font-weight:600;">{fecha_actualizacion}</span>
    </td></tr>
    </table>
    </td>
    </tr>
    <tr>
    <td style="padding:28px 40px 0;text-align:center;">
        <a href="{link_aplicacion}" style="display:inline-block;background:#E8521A;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 32px;border-radius:5px;">Ver seguimiento en la app →</a>
    </td>
    </tr>
    <tr>
    <td style="padding:20px 40px 0;">
        <p style="margin:0;font-size:13px;color:#bbb;line-height:1.7;text-align:center;">
        ¿Alguna consulta? Escribinos a <a href="mailto:{email_contacto}" style="color:#E8521A;text-decoration:none;font-weight:600;">{email_contacto}</a>
        </p>
    </td>
    </tr>
    <tr>
    <td style="padding:28px 40px;border-top:1px solid #ede9e4;margin-top:24px;">
        <p style="margin:0;font-size:11px;color:#ccc;line-height:1.8;text-align:center;">
        © 2024 CompuYa · Computer Parts Logistics<br>
        Este es un mensaje automático, por favor no respondas este correo.
    </p>
    </td>
    </tr>
    </table>
    </td></tr>
</table>
</body>
</html>"""

class NotificacionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD

    async def procesar_notificacion_estado(self, envio: Envio, email_original: str, nombre_destinatario: str):
        if not all([self.smtp_host, self.smtp_user, self.smtp_password]):
            logger.error("Error SMTP: Faltan variables de configuración (HOST, USER o PASSWORD).")
            return

        query = select(PlantillaNotificacion).where(
            PlantillaNotificacion.estado_disparador == envio.estado.value,
            PlantillaNotificacion.activa == True
        )
        resultado = await self.db.execute(query)
        plantilla = resultado.scalars().first()

        if not plantilla:
            logger.info(f"Notificación ignorada: No hay plantilla para '{envio.estado.value}'")
            return

        try:
            asunto_final = f"{plantilla.asunto} #{envio.tracking_id}"
            
            variables = {
                "estado_texto": str(envio.estado.value).upper(),
                "nombre_cliente": nombre_destinatario or "Cliente",
                "codigo_envio": envio.tracking_id,
                "descripcion_producto": envio.descripcion or "Envío LogiTrack",
                "fecha_actualizacion": datetime.now().strftime("%d/%m/%Y"),
                "link_aplicacion": "https://logistica-compuya.onrender.com/dashboard",
                "email_contacto": "compuyalogistica@gmail.com"
            }

            mensaje_admin_formateado = plantilla.cuerpo.format(**variables)
            variables["mensaje_estado"] = mensaje_admin_formateado
            cuerpo_final = PLANTILLA_HTML_BASE.format(**variables)

        except KeyError as e:
            logger.error(f"Error de formato: Falta la etiqueta {e}")
            return

        msg = EmailMessage()
        msg["From"] = self.smtp_user
        msg["To"] = email_original  
        msg["Subject"] = asunto_final
        msg.set_content(cuerpo_final, subtype='html')

        resultado_envio = "Pendiente"
        motivo_del_error = None
        
        try:
            await aiosmtplib.send(
                msg, 
                hostname=self.smtp_host, 
                port=587,
                start_tls=True,  
                username=self.smtp_user, 
                password=self.smtp_password
            )
            resultado_envio = "Exitoso"
            logger.info(f"Correo enviado correctamente a {email_original}")
            
        except Exception as e:
            logger.error(f"Fallo envío SMTP: {str(e)}")
            resultado_envio = "Fallido"
            motivo_del_error = str(e)

        nuevo_historial = HistorialNotificacion(
            envio_id=envio.id,
            destinatario_email=email_original,
            asunto_enviado=asunto_final,
            cuerpo_enviado=cuerpo_final, 
            resultado=resultado_envio,
            canal="correo",
            motivo_error=motivo_del_error
        )
        self.db.add(nuevo_historial)
        await self.db.commit()

    async def obtener_historial_auditoria(self):
        query = select(HistorialNotificacion).order_by(HistorialNotificacion.fecha_envio.desc())
        resultado = await self.db.execute(query)
        return resultado.scalars().all()