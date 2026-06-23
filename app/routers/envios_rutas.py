from fastapi import APIRouter, Depends, status, BackgroundTasks, UploadFile, File, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import obtener_db
from app.services.servicios_envios import EnvioService
from app.models.esquemas import EnvioCrear, EnvioRespuesta, HistorialRespuesta, EditarEnvio, CancelarEnvio, PinRespuesta
from app.services.servicio_ruteo import ServicioRuteo
from app.models.entidades import Usuario, EstadoEnvio,TipoEnvio, RestriccionEnvio
from app.utils.auth import obtener_usuario_actual, tiene_rol
from typing import List
import csv
import io

router = APIRouter(prefix="/envios", tags=["Envios"])

async def get_envio_service(db: AsyncSession = Depends(obtener_db)) -> EnvioService:
    return EnvioService(db)

@router.get("/", response_model=List[EnvioRespuesta])
async def listar_envios(
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.listar_envios(usuario_actual)

@router.post("/", response_model=EnvioRespuesta, status_code=status.HTTP_201_CREATED, dependencies=[Depends(tiene_rol(["operador", "supervisor"]))])
async def crear_envio(
    envio_in: EnvioCrear,
    background_tasks: BackgroundTasks,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.crear_envio(envio_in, usuario_actual.id, background_tasks)

@router.put("/{tracking_id}", response_model=EnvioRespuesta, dependencies=[Depends(tiene_rol(["supervisor", "operador"]))])
async def editar_envio(
    tracking_id: str,
    envio_in: EditarEnvio,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.editar_envio(tracking_id, envio_in, usuario_actual.id)

@router.get("/{tracking_id}", response_model=EnvioRespuesta)
async def obtener_envio(
    tracking_id: str,
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.obtener_envio_por_id(tracking_id)

@router.post("/{tracking_id}/cancelar", response_model=EnvioRespuesta,dependencies=[Depends(tiene_rol(["supervisor"]))] ) 
async def cancelar_envio(
    tracking_id: str,
    datos_cancelacion: CancelarEnvio,
    background_tasks: BackgroundTasks,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.cancelar_envio(tracking_id, usuario_actual.id, datos_cancelacion, background_tasks)

@router.post("/{tracking_id}/entregar", response_model=EnvioRespuesta, dependencies=[Depends(tiene_rol(["supervisor","repartidor"]))])
async def entregar_envio(
    tracking_id: str,
    background_tasks: BackgroundTasks,
    codigo_ingresado: str = Body(..., embed=True),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.entregar_envio(tracking_id, usuario_actual.id, codigo_ingresado, background_tasks)

@router.post("/{tracking_id}/actualizar-estado", response_model=EnvioRespuesta, dependencies=[Depends(tiene_rol(["supervisor", "operador"]))])
async def actualizar_estado_envio(
    tracking_id: str,
    nuevo_estado: EstadoEnvio,
    background_tasks: BackgroundTasks,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.actualizar_estado_envio(tracking_id, nuevo_estado, usuario_actual, background_tasks)

@router.get("/{tracking_id}/historial", response_model=List[HistorialRespuesta], dependencies=[Depends(tiene_rol(["supervisor"]))])
async def obtener_historial(
    tracking_id: str,
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.obtener_historial_envio(tracking_id)

@router.post("/{tracking_id}/asignar-manual", dependencies=[Depends(tiene_rol(["supervisor"]))])
async def asignar_envio_manual(
    tracking_id: str,
    id_repartidor: int,
    background_tasks: BackgroundTasks,
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.asignar_envio_manual(tracking_id, id_repartidor, background_tasks)

@router.post("/asignar-todos", dependencies=[Depends(tiene_rol(["supervisor"]))])
async def asignar_todos_pendientes(
    background_tasks: BackgroundTasks,
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.asignar_todos_pendientes(background_tasks)

@router.get("/hoja-ruta/repartidor/{id_empleado}", response_model=List[EnvioRespuesta], dependencies=[Depends(tiene_rol(["supervisor"]))])
async def obtener_hoja_ruta_repartidor(
    id_empleado: int,
    envio_service: EnvioService = Depends(get_envio_service)
):  
    return await envio_service.obtener_hoja_ruta(id_empleado)

@router.get("/hoja-ruta/mi-recorrido", response_model=List[EnvioRespuesta])
async def obtener_hoja_ruta(
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.obtener_hoja_ruta(usuario_actual.id)

@router.post("/actualizar-prioridad", response_model=dict, tags=["Prioridad"])
async def actualizar_prioridad(db: AsyncSession = Depends(obtener_db)):
    envio_service = EnvioService(db)
    return await envio_service.actualizar_prioridad_pendientes()

@router.post("/importar/validar", dependencies=[Depends(tiene_rol(["operador", "supervisor"]))])
async def importar_validar(
    file: UploadFile = File(...),
    envio_service: EnvioService = Depends(get_envio_service)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="El archivo debe ser un archivo CSV")
    contents = await file.read()
    try:
        decoded = contents.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="El archivo debe tener codificación UTF-8")
        
    reader = csv.DictReader(io.StringIO(decoded))
    
    columnas_requeridas = {"razon_social_destinatario", "cuit_destinatario", "descripcion", "tipo_envio", "restriccion"}
    if not reader.fieldnames or not columnas_requeridas.issubset(set(reader.fieldnames)):
        faltantes = columnas_requeridas - set(reader.fieldnames)
        raise HTTPException(status_code=400, detail=f"Columnas faltantes: {', '.join(faltantes)}")
    
    validos = []
    errores = []
    
    for i, row in enumerate(reader, start=2):
        fila_errores = []
        # Validaciones de Enums
        if row.get("tipo_envio") not in [e.value for e in TipoEnvio]:
            fila_errores.append(f"Tipo de envío '{row.get('tipo_envio')}' inválido")
        if row.get("restriccion") not in [e.value for e in RestriccionEnvio]:
            fila_errores.append(f"Restricción '{row.get('restriccion')}' inválida")
            
        if not fila_errores:
            validos.append(row)
        else:
            errores.append({"fila": i, "errores": fila_errores})
            
    if errores:
        raise HTTPException(status_code=400, detail={"mensaje": "Errores de validación", "errores": errores})
    
    return {"mensaje": "CSV válido", "datos": validos}

@router.post("/importar/confirmar", status_code=status.HTTP_201_CREATED, dependencies=[Depends(tiene_rol(["operador", "supervisor"]))])
async def confirmar_importacion_csv(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    envio_service: EnvioService = Depends(get_envio_service)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="El archivo debe ser un archivo CSV")
        
    contents = await file.read()
    decoded = contents.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))
    
    creados = []
    errores = []
    
    for i, row in enumerate(reader, start=2):
        try:
            envio_in = EnvioCrear(**row)
            envio = await envio_service.crear_envio(envio_in, usuario_actual.id, background_tasks)
            creados.append({"tracking_id": envio.tracking_id, "destinatario": row["razon_social_destinatario"]})
        except Exception as e:
            errores.append({"fila": i, "error": str(e)})
            
    if errores and not creados:
        raise HTTPException(status_code=400, detail={"mensaje": "No se pudo crear ningún envío", "errores": errores})
        
    return {
        "mensaje": f"Proceso completado. Se crearon {len(creados)} envíos.",
        "creados": creados,
        "errores": errores
    }
@router.get("/{tracking_id}/pin", response_model=PinRespuesta, dependencies=[Depends(tiene_rol(["cliente", "supervisor", "operador"]))])
async def obtener_pin_envio(
    tracking_id: str,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    envio_service: EnvioService = Depends(get_envio_service)
):
    try:
        codigo = await envio_service.obtener_codigo_pin(tracking_id, usuario_actual)
        return PinRespuesta(codigo_verificacion=codigo)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )