import random
import string
from datetime import datetime, timedelta, date, time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import select, func
from fastapi import HTTPException, status, BackgroundTasks
from app.models.entidades import AsignacionEnvio, Envio, PrioridadEnvio, TipoEnvio, Usuario, TipoCliente, EstadoEnvio, Historial, PerfilEmpresa
from app.models.esquemas import EnvioCrear, EditarEnvio, CancelarEnvio
from app.services.servicio_ruteo import ServicioRuteo
from app.ml.modelo_prioridad import predecir_prioridad
from app.services.servicio_notificacion import NotificacionService
from app.services.servicio__alertas import crear_alerta_y_enviar_push
from app.utils.generadores import generar_pin_seguridad


MENSAJES_ALERTA = {
    "PREPARANDO_TITULO": "Estamos preparando tu pedido",
    "PREPARANDO_CUERPO": "El envío {tracking_id} está siendo preparado.",
    "ENTREGADO_TITULO": "Envío Entregado",
    "ENTREGADO_CUERPO": "El envío {tracking_id} ha sido entregado.",
    "CANCELADO_TITULO": "Envío Cancelado",
    "CANCELADO_CUERPO": "El envío {tracking_id} fue cancelado.",
    "ACTUALIZADO_TITULO": "Estado del Envío Actualizado a {estado}",
    "ACTUALIZADO_CUERPO": "El estado del envío {tracking_id} ha sido actualizado a {estado}.",
    "EN_TRANSITO_TITULO": "Envío en Tránsito 🚚",
    "EN_TRANSITO_CUERPO": "El envío {tracking_id} está en camino. Tu PIN de entrega es: {pin}"
}


class EnvioService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ruteo_service = ServicioRuteo(db)

    async def obtenerMailDestinatario(self, envio: Envio):
        if envio.destinatario:
            return envio.destinatario.email
        usuario_db = await self.db.execute(select(Usuario).where(Usuario.id == envio.destinatario_id))
        user_obj = usuario_db.scalar_one_or_none()
        return user_obj.email if user_obj else None

    def generar_tracking_id(self) -> str:
        anio = datetime.now().year
        caracteres = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return f"CY-{anio}-{caracteres}"

    async def crear_envio(self, envio_data: EnvioCrear, usuario_id: int, background_tasks: BackgroundTasks) -> Envio:
        query = (
            select(PerfilEmpresa)
            .options(joinedload(PerfilEmpresa.usuario))
            .where(
                PerfilEmpresa.razon_social == envio_data.razon_social_destinatario,
                PerfilEmpresa.cuit == envio_data.cuit_destinatario,
            )
        )
        result = await self.db.execute(query)
        perfil_empresa = result.scalar_one_or_none()
        
        if not perfil_empresa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="La empresa destinataria no existe o no tiene perfil configurado"
            )
        
        usuario = perfil_empresa.usuario
        
        if not usuario or not usuario.activo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La empresa destinataria no esta activa o no tiene un usuario asociado"
            )
        
        lat_dest = perfil_empresa.latitud
        lon_dest = perfil_empresa.longitud
        destinatario_id = perfil_empresa.usuario_id
        
        sucursal_optima = await self.ruteo_service.obtener_sucursal_mas_cercana(lat_dest, lon_dest)
        
        if not sucursal_optima:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay sucursales disponibles para asignar este envío"
            )
        
        distancia = self.ruteo_service.calcular_distancia_haversine(sucursal_optima.latitud, sucursal_optima.longitud, lat_dest, lon_dest)
        
        datos_para_modelo = {
            "distancia": distancia,
            "tipo_envio": envio_data.tipo_envio.value,
            "restriccion": envio_data.restriccion.value,
            "antiguedad_dias": 0
        }
        
        prioridad_predicha = predecir_prioridad(datos_para_modelo)
        
        fecha_limite = self._calcular_fecha_limite(envio_data.tipo_envio, prioridad_predicha)

        tracking_id = self.generar_tracking_id()
        nuevo_envio = Envio(
            **envio_data.model_dump(),
            tracking_id=tracking_id,
            creado_por_id=usuario_id,
            destinatario_id=destinatario_id,
            sucursal_id=sucursal_optima.id,
            latitud_destino=lat_dest,
            longitud_destino=lon_dest,
            prioridad=prioridad_predicha,
            fecha_limite=fecha_limite
        )
        
        self.db.add(nuevo_envio)
        await self.db.flush()
        
        await self.registrar_historial(nuevo_envio.id, usuario_id, nuevo_envio.estado)
        email_destinatario = usuario.email

        await self.db.commit()
        await self.db.refresh(nuevo_envio)
        
        query_final = (
            select(Envio)
            .options(
                joinedload(Envio.creador).joinedload(Usuario.perfil_empleado),
                joinedload(Envio.destinatario).joinedload(Usuario.perfil_empresa),
                joinedload(Envio.destinatario).joinedload(Usuario.perfil_empleado),
                joinedload(Envio.sucursal)
            )
            .where(Envio.id == nuevo_envio.id)
        )
        result_final = await self.db.execute(query_final)
        envio_completo = result_final.unique().scalar_one()

        servicio_notificacion = NotificacionService(db=self.db)
    
        if email_destinatario:
            background_tasks.add_task(
                servicio_notificacion.procesar_notificacion_estado, 
                envio_completo, 
                email_destinatario, 
                envio_completo.razon_social_destinatario
            )
            
            titulo = MENSAJES_ALERTA["PREPARANDO_TITULO"]
            mensaje = MENSAJES_ALERTA["PREPARANDO_CUERPO"].format(tracking_id=envio_completo.tracking_id)
            
            await crear_alerta_y_enviar_push(
                self.db, 
                envio_completo.destinatario_id, 
                titulo, 
                mensaje, 
                envio_id=envio_completo.id
            )

        return envio_completo
    
    def _calcular_fecha_limite(self, tipo_envio: TipoEnvio, prioridad: PrioridadEnvio) -> datetime:
        if tipo_envio == TipoEnvio.EXPRESS: 
            if prioridad == PrioridadEnvio.ALTA:
                dias_base = 1
                variacion = random.randint(0, 1) 
            elif prioridad== PrioridadEnvio.MEDIA:
                dias_base = 3
                variacion = random.randint(0, 1) 
            else: 
                dias_base = 5
                variacion = random.randint(0, 1)         
        else: 
            if prioridad == PrioridadEnvio.ALTA:
                dias_base = 8
                variacion = random.randint(0, 1)
            elif prioridad == PrioridadEnvio.MEDIA:
                dias_base = 11
                variacion = random.randint(0, 1)
            else:
                dias_base = 14
                variacion = random.randint(0, 2) 
            
        dias_totales = dias_base + variacion
            
        fecha_objetivo = date.today() + timedelta(days=max(1, dias_totales))
        return datetime.combine(fecha_objetivo, time.min)

    async def obtener_envio_por_id(self, tracking_id: str) -> Envio:
        query = select(Envio).where(Envio.tracking_id == tracking_id).options(
            joinedload(Envio.creador).joinedload(Usuario.perfil_empleado),
            joinedload(Envio.destinatario).joinedload(Usuario.perfil_empresa),
            joinedload(Envio.destinatario).joinedload(Usuario.perfil_empleado),
            joinedload(Envio.sucursal)
        )
        result = await self.db.execute(query)
        envio = result.unique().scalar_one_or_none()
        if not envio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Envio no encontrado"
            )
        return envio
    
    async def editar_envio(self, tracking_id: str, datos_actualizados: EditarEnvio, usuario_id: int) -> Envio:
        envio = await self.obtener_envio_por_id(tracking_id)
        if not envio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Envio no encontrado"
            )
        if envio.estado in [EstadoEnvio.EN_TRANSITO, EstadoEnvio.ENTREGADO, EstadoEnvio.CANCELADO]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El envío no se puede editar ya que su estado es {envio.estado.value}"
            )
    
        cuit_nuevo = datos_actualizados.cuit_destinatario
        razon_nueva = datos_actualizados.razon_social_destinatario

        if cuit_nuevo is not None or razon_nueva is not None:
            query = select(PerfilEmpresa)

            if cuit_nuevo is not None and razon_nueva is not None:
                query = query.where(
                    (PerfilEmpresa.cuit == cuit_nuevo) & 
                    (PerfilEmpresa.razon_social == razon_nueva)
                )
            elif cuit_nuevo is not None:
                query = query.where(PerfilEmpresa.cuit == cuit_nuevo)
            elif razon_nueva is not None:
                query = query.where(PerfilEmpresa.razon_social == razon_nueva)
            resultado = await self.db.execute(query)
            empresa_validada = resultado.scalars().first()
            if not empresa_validada:
                raise HTTPException(
                    status_code=404, 
                    detail="La empresa destino ingresada no existe en el sistema."
                )
            envio.cuit_destinatario = empresa_validada.cuit
            envio.razon_social_destinatario = empresa_validada.razon_social
            envio.destinatario_id = empresa_validada.usuario_id
            envio.latitud_destino = empresa_validada.latitud
            envio.longitud_destino = empresa_validada.longitud

        if datos_actualizados.descripcion is not None:
            envio.descripcion = datos_actualizados.descripcion
        if datos_actualizados.tipo_envio is not None:
            envio.tipo_envio = datos_actualizados.tipo_envio
        if datos_actualizados.restriccion is not None:
            envio.restriccion = datos_actualizados.restriccion

        await self.db.commit()
        return envio

    async def entregar_envio(self, tracking_id: str, usuario_id: int,codigo_ingresado: str ,background_tasks: BackgroundTasks) -> Envio:
        envio = await self.obtener_envio_por_id(tracking_id)
        if envio.estado != EstadoEnvio.EN_TRANSITO:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El envío no se puede entregar ya que su estado esta {envio.estado}"
            )
        if envio.codigo_verificacion != codigo_ingresado:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PIN inválido. Verifique el código con el cliente."
            )
        envio.estado = EstadoEnvio.ENTREGADO
        envio.fecha_entrega_real = datetime.now()
        envio.codigo_verificacion = None
        await self.registrar_historial(envio.id, usuario_id, EstadoEnvio.ENTREGADO)
        await self.db.commit()

        servicio = NotificacionService(db=self.db)
        email = await self.obtenerMailDestinatario(envio)
        if email:
            background_tasks.add_task(servicio.procesar_notificacion_estado, envio, email, envio.razon_social_destinatario)
            
            titulo = MENSAJES_ALERTA["ENTREGADO_TITULO"]
            mensaje = MENSAJES_ALERTA["ENTREGADO_CUERPO"].format(tracking_id=tracking_id)
            await crear_alerta_y_enviar_push(self.db, envio.destinatario_id, titulo, mensaje, envio_id=envio.id)
            
        return envio

    async def cancelar_envio(self, tracking_id: str, usuario_id: int, datos_cancelacion: CancelarEnvio, background_tasks: BackgroundTasks) -> Envio:
        envio = await self.obtener_envio_por_id(tracking_id)

        if envio.estado in [EstadoEnvio.CANCELADO, EstadoEnvio.ENTREGADO]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El envío no se puede cancelar ya que su estado está {envio.estado}"
            )

        envio.estado = EstadoEnvio.CANCELADO
        envio.prioridad = "baja"
        envio.codigo_verificacion = None
        
        nuevo_historial = Historial(
            envio_id=envio.id,
            id_empleado=usuario_id,
            estado=EstadoEnvio.CANCELADO,
            motivo=datos_cancelacion.motivo
        )
        self.db.add(nuevo_historial)

        
        await self.db.commit()
        email = envio.destinatario.email if envio.destinatario else None
        if email:
            servicio = NotificacionService(db=self.db)
            background_tasks.add_task(servicio.procesar_notificacion_estado, envio, email, envio.razon_social_destinatario)
            
            titulo = MENSAJES_ALERTA["CANCELADO_TITULO"]
            mensaje = MENSAJES_ALERTA["CANCELADO_CUERPO"].format(tracking_id=tracking_id)
            await crear_alerta_y_enviar_push(self.db, envio.destinatario_id, titulo, mensaje, envio_id=envio.id)
            
        return envio

    async def actualizar_estado_envio(self, tracking_id: str, nuevo_estado: EstadoEnvio, usuario: Usuario, background_tasks: BackgroundTasks) -> Envio:
        envio = await self.obtener_envio_por_id(tracking_id)
        if envio.estado == EstadoEnvio.CANCELADO or envio.estado == EstadoEnvio.ENTREGADO:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El estado del envío no se puede actualizar ya que su estado actual es {envio.estado}"
            )
        if nuevo_estado == EstadoEnvio.CANCELADO and usuario.rol not in ["admin", "supervisor"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para cancelar un envío. Solo los supervisores pueden realizar esta acción."
            )
        envio.estado = nuevo_estado
        
        if nuevo_estado == EstadoEnvio.ENTREGADO:
            envio.fecha_entrega_real = datetime.now()
        else:
            envio.fecha_entrega_real = None    
        
        
        await self.registrar_historial(envio.id, usuario.id, nuevo_estado)
        await self.db.commit()

        servicio = NotificacionService(db=self.db)
        email = await self.obtenerMailDestinatario(envio)
        if email:
            background_tasks.add_task(servicio.procesar_notificacion_estado, envio, email, envio.razon_social_destinatario)
            
            titulo = MENSAJES_ALERTA["ACTUALIZADO_TITULO"].format(estado=nuevo_estado.value)
            mensaje = MENSAJES_ALERTA["ACTUALIZADO_CUERPO"].format(tracking_id=tracking_id, estado=nuevo_estado.value)
            await crear_alerta_y_enviar_push(self.db, envio.destinatario_id, titulo, mensaje, envio_id=envio.id) 

        return envio

    async def listar_envios(self, usuario: Usuario) -> list[Envio]:
        query = select(Envio).options(
            joinedload(Envio.creador).joinedload(Usuario.perfil_empleado),
            joinedload(Envio.destinatario).joinedload(Usuario.perfil_empresa),
            joinedload(Envio.destinatario).joinedload(Usuario.perfil_empleado),
            joinedload(Envio.sucursal)
        )
        if usuario.rol == "cliente":
            query = query.where(Envio.destinatario_id == usuario.id)
            
        result = await self.db.execute(query)
        return result.unique().scalars().all()

    async def registrar_historial(self, envio_id: int, usuario_id: int, nuevo_estado: EstadoEnvio, motivo: str = None):
        nuevo_historial = Historial(
            envio_id=envio_id,
            id_empleado=usuario_id,
            estado=nuevo_estado,
            motivo=motivo
        )
        self.db.add(nuevo_historial)

    async def obtener_historial_envio(self, tracking_id: str):
        envio_query = select(Envio.id).where(Envio.tracking_id == tracking_id)
        result = await self.db.execute(envio_query)
        envio_id = result.scalar_one_or_none()

        if not envio_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Envio no encontrado"
            )
        historial_query = select(Historial).where(Historial.envio_id == envio_id).options(
            joinedload(Historial.empleado).joinedload(Usuario.perfil_empleado)
        ).order_by(Historial.fecha.desc())

        result = await self.db.execute(historial_query)
        historial = result.unique().scalars().all()
        return historial

    async def asignar_envio_manual(self, tracking_id: str, id_repartidor: int, background_tasks: BackgroundTasks):
        envio = await self.obtener_envio_por_id(tracking_id)

        if envio.estado != EstadoEnvio.EN_SUCURSAL:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Solo se pueden asignar envíos que estén en sucursal. Estado actual: {envio.estado.value}"
            )

        query_repartidor = select(Usuario).where(Usuario.id == id_repartidor, Usuario.rol == "repartidor")
        repartidor_obj = (await self.db.execute(query_repartidor)).scalar_one_or_none()

        if repartidor_obj is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="No se encontró un repartidor con el ID proporcionado"
            )

        query_existente = select(AsignacionEnvio).where(AsignacionEnvio.envio_id == envio.id)
        asignacion_existente = (await self.db.execute(query_existente)).scalar_one_or_none()

        if asignacion_existente:
            asignacion_existente.id_empleado = id_repartidor
        else:
            self.db.add(AsignacionEnvio(envio_id=envio.id, id_empleado=id_repartidor))

        envio.estado = EstadoEnvio.EN_TRANSITO
        envio.codigo_verificacion = generar_pin_seguridad()
        
        await self.registrar_historial(envio.id, id_repartidor, EstadoEnvio.EN_TRANSITO)

        await self.db.commit()

        servicio = NotificacionService(db=self.db)
        email = envio.destinatario.email if envio.destinatario else None
        
        if email:
            background_tasks.add_task(servicio.procesar_notificacion_estado, envio, email, envio.razon_social_destinatario)
            
            titulo = MENSAJES_ALERTA["EN_TRANSITO_TITULO"]
            mensaje = MENSAJES_ALERTA["EN_TRANSITO_CUERPO"].format(tracking_id=tracking_id, pin=envio.codigo_verificacion)
            await crear_alerta_y_enviar_push(self.db, envio.destinatario_id, titulo, mensaje, envio_id=envio.id)
            
        return {"message": f"Envío {tracking_id} asignado manualmente al repartidor ID {id_repartidor} (Estado: EN_TRANSITO)"}

    async def asignar_todos_pendientes(self, background_tasks: BackgroundTasks):
        query_pendientes = select(Envio).where(Envio.estado == EstadoEnvio.EN_SUCURSAL).options(
            joinedload(Envio.destinatario)
        )
        result_pendientes = await self.db.execute(query_pendientes)
        envios_pendientes = result_pendientes.unique().scalars().all()

        if not envios_pendientes:
            return {"message": "No hay envíos pendientes en sucursal", "asignados": 0}

        query_carga = (
            select(Usuario.id, func.count(AsignacionEnvio.id).label("carga"))
            .where(Usuario.rol == "repartidor", Usuario.tipo == TipoCliente.EMPLEADO)
            .outerjoin(AsignacionEnvio, Usuario.id == AsignacionEnvio.id_empleado)
            .group_by(Usuario.id)
        )
        result_carga = await self.db.execute(query_carga)
        
        carga_repartidores = {row.id: row.carga for row in result_carga.all()}

        if not carga_repartidores:
            raise HTTPException(status_code=404, detail="No se encontraron repartidores en el sistema.")

        nuevas_asignaciones = []
        historial_a_registrar = []
        count = 0

        for envio in envios_pendientes:
            mejor_repartidor_id = min(carga_repartidores, key=carga_repartidores.get)
            
            envio.estado = EstadoEnvio.EN_TRANSITO
            envio.codigo_verificacion = generar_pin_seguridad()
            
            nuevas_asignaciones.append(AsignacionEnvio(envio_id=envio.id, id_empleado=mejor_repartidor_id))
            historial_a_registrar.append(Historial(envio_id=envio.id, id_empleado=mejor_repartidor_id, estado=EstadoEnvio.EN_TRANSITO))
            
            carga_repartidores[mejor_repartidor_id] += 1
            count += 1
        
        if nuevas_asignaciones:
            self.db.add_all(nuevas_asignaciones)
        if historial_a_registrar:
            self.db.add_all(historial_a_registrar)
            
        await self.db.commit()
        
        servicio = NotificacionService(db=self.db)
        for envio in envios_pendientes:
            email = envio.destinatario.email if envio.destinatario else None
            if email:
                background_tasks.add_task(servicio.procesar_notificacion_estado, envio, email, envio.razon_social_destinatario)
                
                titulo = MENSAJES_ALERTA["EN_TRANSITO_TITULO"]
                mensaje = MENSAJES_ALERTA["EN_TRANSITO_CUERPO"].format(tracking_id=envio.tracking_id, pin=envio.codigo_verificacion)
                await crear_alerta_y_enviar_push(self.db, envio.destinatario_id, titulo, mensaje, envio_id=envio.id)
                
        return {"message": f"Se han asignado {count} envíos exitosamente de forma masiva", "asignados": count}

    async def actualizar_prioridades_pendientes(self):
        envios_en_sucursal = await self.db.execute(select(Envio).where(Envio.estado == EstadoEnvio.EN_SUCURSAL).options(
                joinedload(Envio.sucursal)
            ))
        envios = envios_en_sucursal.unique().scalars().all()
        if not envios:
            return {"message": "No hay envíos pendientes en sucursal para actualizar prioridades", "actualizados": 0}
        
        update_count = 0
        now = datetime.now()
        for envio in envios:
            if not envio.sucursal:
                continue
            antiguedad = now - envio.fecha_creacion
            distancia = self.ruteo_service.calcular_distancia_haversine(envio.sucursal.latitud, envio.sucursal.longitud, envio.latitud_destino, envio.longitud_destino)
            datos_para_modelo = {
                "distancia": distancia,
                "tipo_envio": envio.tipo_envio.value,
                "restriccion": envio.restriccion.value,
                "antiguedad_dias": antiguedad.days + antiguedad.seconds / 86400
            }
            prioridad_actual = envio.prioridad.value
            nueva_prioridad = predecir_prioridad(datos_para_modelo)
            
            if nueva_prioridad != prioridad_actual:
                envio.prioridad = nueva_prioridad
                update_count += 1
        if update_count > 0:
            await self.db.commit()
        return {"message": f"Se han actualizado las prioridades de {update_count} envíos pendientes en sucursal", "actualizados": update_count}
            
    async def obtener_hoja_ruta(self, id_empleado: int):
        query = (
            select(Envio)
            .join(AsignacionEnvio, Envio.id == AsignacionEnvio.envio_id)
            .where(AsignacionEnvio.id_empleado == id_empleado)
            .where(Envio.estado == EstadoEnvio.EN_TRANSITO)
            .options(
                joinedload(Envio.creador).joinedload(Usuario.perfil_empleado),
                joinedload(Envio.destinatario).joinedload(Usuario.perfil_empresa),
                joinedload(Envio.destinatario).joinedload(Usuario.perfil_empleado),
                joinedload(Envio.sucursal)
            )
        )
        result = await self.db.execute(query)
        envios = result.unique().scalars().all()

        if not envios:
            return []

        lat_actual = envios[0].sucursal.latitud if envios[0].sucursal else -34.6037
        lon_actual = envios[0].sucursal.longitud if envios[0].sucursal else -58.3816

        ruta_ordenada = []
        pendientes = list(envios)

        while pendientes:
            proximo = min(
                pendientes,
                key=lambda e: self.ruteo_service.calcular_distancia_haversine(
                    lat_actual, lon_actual, e.latitud_destino, e.longitud_destino
                )
            )
            ruta_ordenada.append(proximo)
            pendientes.remove(proximo)
            lat_actual = proximo.latitud_destino
            lon_actual = proximo.longitud_destino

        return ruta_ordenada