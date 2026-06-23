import logging
import os
from datetime import datetime
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from email.message import EmailMessage
import aiosmtplib

from app.models.entidades import PlantillaNotificacion, HistorialNotificacion, Envio, EstadoEnvio, Historial
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
        estado=envio.estado 
        if not plantilla:
            logger.info(f"Notificación ignorada: No hay plantilla para '{estado.value}'")
            return

        try:
            motivo_cancelacion = ""

            if envio.estado == EstadoEnvio.CANCELADO:
                query_historial = select(Historial).where(
                    Historial.envio_id == envio.id
                ).order_by(Historial.fecha.desc()).limit(1)
                
                res_historial = await self.db.execute(query_historial)
                ultimo_historial = res_historial.scalar_one_or_none()
                motivo_cancelacion = ultimo_historial.motivo if ultimo_historial else "No especificado"

            asunto_final = f"{plantilla.asunto} #{envio.tracking_id}"
            nombre_plantilla_html = f"{envio.estado.value.lower().replace(' ', '_')}.html"
            ruta_template = os.path.join(os.path.dirname(__file__), f"../templates/{nombre_plantilla_html}")
            
            if not os.path.exists(ruta_template):
                logger.error(f"Error de infraestructura: No existe el archivo HTML en: {ruta_template}")
                return

            with open(ruta_template, "r", encoding="utf-8") as f:
                html_base_estado = f.read()

            variables = {
                "estado_texto": str(envio.estado.value).replace("_", " ").upper(),
                "nombre_cliente": nombre_destinatario or "Cliente",
                "codigo_envio": envio.tracking_id,
                "descripcion_producto": envio.descripcion or "Envío LogiTrack",
                "fecha_actualizacion": datetime.now().strftime("%d/%m/%Y"),
                "link_aplicacion": "https://compuyalogistica.onrender.com/",
                "email_contacto": "compuyalogistica@gmail.com",
                "pin": envio.codigo_verificacion if envio.codigo_verificacion else "",
                "motivo_cancelacion": motivo_cancelacion   
            }

            mensaje_admin_formateado = plantilla.cuerpo.format(**variables)
            variables["mensaje_estado"] = mensaje_admin_formateado
            
            cuerpo_final = html_base_estado.format(**variables)

        except KeyError as e:
            logger.error(f"Error de formato string: Falta la etiqueta {e} en la DB o en el HTML.")
            return

        msg = EmailMessage()
        msg["From"] = "CompuYa Logística <compuyalogistica@gmail.com>"
        msg["To"] = email_original  
        msg["Subject"] = asunto_final
        msg.set_content(cuerpo_final, subtype='html')

        resultado_envio = "Pendiente"
        motivo_del_error = None

        try:
            await aiosmtplib.send(
                msg, 
                hostname=self.smtp_host, 
                port=int(self.smtp_port or 2525), 
                use_tls=False,
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

        nuevo_historial_notif = HistorialNotificacion(
            envio_id=envio.id,
            destinatario_email=email_original,
            asunto_enviado=asunto_final,
            cuerpo_enviado=cuerpo_final, 
            resultado=resultado_envio,
            canal="correo",
            motivo_error=motivo_del_error
        )
        self.db.add(nuevo_historial_notif)
        await self.db.commit()

    async def obtener_historial_auditoria(self):
        query = select(HistorialNotificacion).order_by(HistorialNotificacion.fecha_envio.desc())
        resultado = await self.db.execute(query)
        return resultado.scalars().all()