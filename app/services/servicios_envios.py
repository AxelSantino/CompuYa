import random
import string
from datetime import datetime
from fastapi_cloud_cli.cli import app
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func
from fastapi import HTTPException, status, BackgroundTasks
from app.models.entidades import AsignacionEnvio, Envio, Usuario, TipoCliente, EstadoEnvio, Historial, PerfilEmpresa
from app.models.esquemas import EnvioCrear, EditarEnvio
from app.services.servicio_ruteo import ServicioRuteo
from app.services.servicio_notificacion import NotificacionService

class EnvioService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ruteo_service = ServicioRuteo(db)

    def generar_tracking_id(self) -> str:
        anio = datetime.now().year
        caracteres = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return f"CY-{anio}-{caracteres}"

    async def crear_envio(self, envio_data: EnvioCrear, usuario_id: int) -> Envio:
        query = (
            select(Usuario)
            .join(Usuario.perfil_empresa)
            .where(
                PerfilEmpresa.razon_social == envio_data.razon_social_destinatario,
                PerfilEmpresa.cuit == envio_data.cuit_destinatario,
                Usuario.tipo == TipoCliente.EMPRESA
            )
            .options(selectinload(Usuario.perfil_empresa))
        )
        result = await self.db.execute(query)
        empresa = result.scalar_one_or_none()
        
        if not empresa or not empresa.perfil_empresa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="La empresa destinataria no existe o no tiene perfil configurado"
            )
        
        lat_dest = empresa.perfil_empresa.latitud
        lon_dest = empresa.perfil_empresa.longitud
        
        sucursal_optima = await self.ruteo_service.obtener_sucursal_mas_cercana(lat_dest, lon_dest)
        
        if not sucursal_optima:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay sucursales disponibles para asignar este envío"
            )
        
        tracking_id = self.generar_tracking_id()
        nuevo_envio = Envio(
            **envio_data.model_dump(),
            tracking_id=tracking_id,
            creado_por_id=usuario_id,
            destinatario_id=empresa.id,
            sucursal_id=sucursal_optima.id,
            latitud_destino=lat_dest,
            longitud_destino=lon_dest,
        )
        
        self.db.add(nuevo_envio)
        await self.db.flush()
        
        await self.registrar_historial(nuevo_envio.id, usuario_id, nuevo_envio.estado)
        await self.db.commit()
        await self.db.refresh(nuevo_envio)

        return await self.obtener_envio_por_id(nuevo_envio.tracking_id)
    
    async def obtenerMailDestinatario(self, envio: Envio) -> str:
        query = select(Usuario.email).where(Usuario.id == envio.destinatario_id)
        result = await self.db.execute(query)
        email_destinatario = result.scalar_one_or_none()
        return email_destinatario  

    async def obtener_envio_por_id(self, tracking_id: str) -> Envio:
        query = select(Envio).where(Envio.tracking_id == tracking_id).options(
            selectinload(Envio.creador).selectinload(Usuario.perfil_empleado),
            selectinload(Envio.destinatario).selectinload(Usuario.perfil_empresa),
            selectinload(Envio.destinatario).selectinload(Usuario.perfil_empleado),
            selectinload(Envio.sucursal)
        )
        result = await self.db.execute(query)
        envio = result.scalar_one_or_none()
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
                detail=f"El envÃ­o no se puede editar ya que su estado es {envio.estado.value}"
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
        await self.db.refresh(envio)

        return await self.obtener_envio_por_id(envio.tracking_id)

    async def entregar_envio(self, tracking_id: str, usuario_id: int) -> Envio:
        envio = await self.obtener_envio_por_id(tracking_id)
        if envio.estado != EstadoEnvio.EN_TRANSITO:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El envío no se puede entregar ya que su estado esta {envio.estado}"
            )
        envio.estado = EstadoEnvio.ENTREGADO
        await self.registrar_historial(envio.id, usuario_id, EstadoEnvio.ENTREGADO)
        await self.db.commit()
        await self.db.refresh(envio)

        return await self.obtener_envio_por_id(envio.tracking_id)

    async def cancelar_envio(self, tracking_id: str, usuario_id: int) -> Envio:
        envio = await self.obtener_envio_por_id(tracking_id)
        if envio.estado == EstadoEnvio.CANCELADO or envio.estado == EstadoEnvio.ENTREGADO:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El envío no se puede cancelar ya que su estado esta {envio.estado}"
            )
        envio.estado = EstadoEnvio.CANCELADO
        

        await self.registrar_historial(envio.id, usuario_id, EstadoEnvio.CANCELADO)
        await self.db.commit()
        await self.db.refresh(envio)

        servicio = NotificacionService(db=self.db) 
        email = await self.obtenerMailDestinatario(envio)
        await servicio.procesar_notificacion_estado(envio, email, envio.razon_social_destinatario)

        return await self.obtener_envio_por_id(envio.tracking_id)

    async def actualizar_estado_envio(self, tracking_id: str, nuevo_estado: EstadoEnvio, usuario: Usuario) -> Envio:
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
        await self.registrar_historial(envio.id, usuario.id, nuevo_estado)
        await self.db.commit()
        await self.db.refresh(envio)

        notificacion_service = NotificacionService(db=self.db) 
        email = await self.obtenerMailDestinatario(envio)
        await notificacion_service.procesar_notificacion_estado(envio, email, envio.razon_social_destinatario)

        return await self.obtener_envio_por_id(envio.tracking_id)

    async def listar_envios(self, usuario: Usuario) -> list[Envio]:
        query = select(Envio).options(
            selectinload(Envio.creador).selectinload(Usuario.perfil_empleado),
            selectinload(Envio.destinatario).selectinload(Usuario.perfil_empresa),
            selectinload(Envio.destinatario).selectinload(Usuario.perfil_empleado),
            selectinload(Envio.sucursal)
        )
        if usuario.rol == "cliente":
            query = query.where(Envio.destinatario_id == usuario.id)
            
        result = await self.db.execute(query)
        return result.scalars().all()

    async def registrar_historial(self, envio_id: int, usuario_id: int, nuevo_estado: EstadoEnvio):
        nuevo_historial = Historial(
            envio_id=envio_id,
            id_empleado=usuario_id,
            estado=nuevo_estado
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
            selectinload(Historial.empleado).selectinload(Usuario.perfil_empleado)
        ).order_by(Historial.fecha.desc())

        result = await self.db.execute(historial_query)
        historial = result.scalars().all()
        return historial

    async def asignar_envio_automatico(self, tracking_id: str):
        envio = await self.obtener_envio_por_id(tracking_id)

        if envio.estado != EstadoEnvio.EN_SUCURSAL:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Solo se pueden asignar envíos que estén en sucursal. Estado actual: {envio.estado.value}"
            )

        query_carga = (
            select(Usuario.id)
            .where(
                Usuario.tipo == TipoCliente.EMPLEADO,
                Usuario.rol == "repartidor"
            )
            .outerjoin(AsignacionEnvio, Usuario.id == AsignacionEnvio.id_empleado)
            .outerjoin(
                Envio,
                (AsignacionEnvio.envio_id == Envio.id) & 
                (Envio.estado.in_([EstadoEnvio.EN_TRANSITO, EstadoEnvio.EN_SUCURSAL]))
            )
            .group_by(Usuario.id)
            .order_by(func.count(Envio.id).asc())
            .limit(1)
        )

        result_carga = await self.db.execute(query_carga)
        mejor_repartidor_id = result_carga.scalar_one_or_none()

        if mejor_repartidor_id is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="No hay repartidores disponibles en el sistema"
            )

        query_existente = select(AsignacionEnvio).where(AsignacionEnvio.envio_id == envio.id)
        asignacion_existente = (await self.db.execute(query_existente)).scalar_one_or_none()

        if asignacion_existente:
            asignacion_existente.id_empleado = mejor_repartidor_id
        else:
            self.db.add(AsignacionEnvio(envio_id=envio.id, id_empleado=mejor_repartidor_id))

        envio.estado = EstadoEnvio.EN_TRANSITO

        notificacion_service = NotificacionService(db=self.db) 
        email = await self.obtenerMailDestinatario(envio)
        await notificacion_service.procesar_notificacion_estado(envio, email, envio.razon_social_destinatario)

        await self.registrar_historial(envio.id, mejor_repartidor_id, EstadoEnvio.EN_TRANSITO)
        await self.db.commit()
        return {"message": f"Envío {tracking_id} asignado automáticamente al repartidor ID {mejor_repartidor_id} (Estado: EN_TRANSITO)"}

    async def asignar_todos_pendientes(self, background_tasks: BackgroundTasks):
        query_pendientes = select(Envio).where(Envio.estado == EstadoEnvio.EN_SUCURSAL)
        result_pendientes = await self.db.execute(query_pendientes)
        envios_pendientes = result_pendientes.scalars().all()

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

        ids_pendientes = [e.id for e in envios_pendientes]
        query_existentes = select(AsignacionEnvio).where(AsignacionEnvio.envio_id.in_(ids_pendientes))
        result_existentes = await self.db.execute(query_existentes)
        asignaciones_existentes = {a.envio_id: a for a in result_existentes.scalars().all()}

        nuevas_asignaciones = []
        historial_a_registrar = []
        count = 0

        notificacion_service = NotificacionService(self.db)

        for envio in envios_pendientes:
            mejor_repartidor_id = min(carga_repartidores, key=carga_repartidores.get)
            
            envio.estado = EstadoEnvio.EN_TRANSITO

            email_destinatario = await self.obtenerMailDestinatario(envio)

            background_tasks.add_task(
                notificacion_service.procesar_notificacion_estado, 
                envio, 
                email_destinatario,  
                envio.razon_social_destinatario
            )
            
            if envio.id in asignaciones_existentes:
                asignaciones_existentes[envio.id].id_empleado = mejor_repartidor_id
            else:
                nuevas_asignaciones.append(AsignacionEnvio(envio_id=envio.id, id_empleado=mejor_repartidor_id))
                
            historial_a_registrar.append(Historial(envio_id=envio.id, id_empleado=mejor_repartidor_id, estado=EstadoEnvio.EN_TRANSITO))
            
            carga_repartidores[mejor_repartidor_id] += 1
            count += 1
        
        if nuevas_asignaciones:
            self.db.add_all(nuevas_asignaciones)
        if historial_a_registrar:
            self.db.add_all(historial_a_registrar)
            
        await self.db.commit()
        
        return {"message": f"Se han asignado {count} envíos exitosamente de forma masiva", "asignados": count}

    async def obtener_hoja_ruta(self, id_empleado: int):
        query = (
            select(Envio)
            .join(AsignacionEnvio, Envio.id == AsignacionEnvio.envio_id)
            .where(AsignacionEnvio.id_empleado == id_empleado)
            .where(Envio.estado == EstadoEnvio.EN_TRANSITO)
            .options(
                selectinload(Envio.creador).selectinload(Usuario.perfil_empleado),
                selectinload(Envio.destinatario).selectinload(Usuario.perfil_empresa),
                selectinload(Envio.destinatario).selectinload(Usuario.perfil_empleado),
                selectinload(Envio.sucursal)
            )
        )
        result = await self.db.execute(query)
        envios = result.scalars().all()

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