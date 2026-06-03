import logging
from datetime import datetime
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from email.message import EmailMessage
import aiosmtplib

from app.models.entidades import PlantillaNotificacion, HistorialNotificacion, Envio 
from app.config import settings

logger = logging.getLogger(__name__)

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
            cuerpo_final = plantilla.cuerpo.format(
                estado_texto=str(envio.estado.value).upper(),
                nombre_cliente=nombre_destinatario or "Cliente",
                mensaje_estado=f"Te informamos que tu envío {envio.tracking_id} cambió al estado: {envio.estado.value}.",
                codigo_envio=envio.tracking_id,
                descripcion_producto=envio.descripcion or "Envío LogiTrack",
                fecha_actualizacion=datetime.now().strftime("%d/%m/%Y"),
                link_aplicacion="https://logistica-compuya.onrender.com/dashboard",
                email_contacto="compuyalogistica@gmail.com"
            )
        except KeyError as e:
            logger.error(f"Error de formato: Falta la etiqueta {e}")
            return

        msg = EmailMessage()
        msg["From"] = self.smtp_user
        msg["To"] = email_original  
        msg["Subject"] = asunto_final
        msg.set_content(cuerpo_final, subtype='html')

        resultado_envio = "Pendiente"
        try:
            await aiosmtplib.send(
                msg, 
                hostname=self.smtp_host, 
                port=int(self.smtp_port or 465), 
                use_tls=True, 
                username=self.smtp_user, 
                password=self.smtp_password
            )
            resultado_envio = "Enviado OK"
            logger.info(f"Correo enviado correctamente a {email_original}")
        except Exception as e:
            logger.error(f"Fallo envío SMTP: {str(e)}")
            resultado_envio = f"Error: {str(e)}"

        nuevo_historial = HistorialNotificacion(
            envio_id=envio.id,
            destinatario_email=email_original,
            asunto_enviado=asunto_final,
            cuerpo_enviado=cuerpo_final,
            resultado=resultado_envio
        )
        self.db.add(nuevo_historial)
        await self.db.commit()