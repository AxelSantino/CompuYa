# CompuYa - Solución Logística B2B con IA
CompuYa es una plataforma logística integral diseñada para resolver los cuellos de botella en la distribución de hardware crítico (Data Centers y tiendas retail). Construida con una arquitectura asíncrona robusta utilizando FastAPI y SQLAlchemy, la plataforma centraliza la trazabilidad de paquetes, automatiza la asignación masiva de rutas para repartidores y notifica a los clientes en tiempo real. Su principal diferencial técnico es la integración de un modelo de Machine Learning (Scikit-Learn) que evalúa y prioriza dinámicamente los envíos basándose en su nivel de urgencia, optimizando la toma de decisiones operativas.



## Manual de Usuario — Sistema CompuYa

Este documento está diseñado para proporcionar autonomía operativa a los usuarios del sistema sin depender del equipo técnico, conforme a las especificaciones de los perfiles de Administrador, Supervisor, Operador y Repartidor.

# 1. Acceso General al Sistema (Login)
Esta acción es el paso inicial y obligatorio para todos los perfiles de la plataforma.
Ingrese a la URL de la plataforma desde un navegador web de escritorio o dispositivo móvil.
Introduzca su correo electrónico corporativo y su contraseña asignada.
Haga clic en el botón "Iniciar Sesión".
Resultado esperado: Redirección automática al panel correspondiente a su nivel de acceso tras la validación de credenciales.

# 2. Módulo de Operaciones del Administrador
El perfil de Administrador cuenta con el máximo nivel de acceso en la plataforma. Está enfocado en la configuración estructural del sistema, la gestión del personal y la visualización del rendimiento global.
2.1 Gestión de Usuarios y Roles
Permite dar de alta a nuevos empleados en el sistema, asignarles su rol correspondiente (Supervisor, Operador o Repartidor), editar sus datos personales o dar de baja accesos cuando sea necesario.
2.2 Auditoría y Reportes Globales
Acceso a estadísticas históricas y reportes generales de la operación de CompuYa. Permite visualizar el flujo total de los envíos, métricas de rendimiento y trazabilidad completa de las acciones realizadas por cualquier usuario en el sistema.
2.3 Gestión de clientes registrados en la plataforma
Permite dar de alta nuevos clientes en el sistema, editar sus datos como su Razón Social, Localidad, Código Postal y Activar/Desactivar sus cuentas.
2.4 Gestión de notificaciones 
Permite ver y editar las plantillas de las notificaciones En Sucursal, En camino, Cancelado y Entregado que le llegan a los clientes por correo cuando un envío es creado en Plantillas de correo.
También puede ver el Historial de notificaciones en la pestaña subsiguiente 




# 3. Módulo de Operaciones del Supervisor
El perfil de Supervisor cuenta con capacidades administrativas para el control global de la carga logística, la asignación de recursos y la ingesta masiva de datos.
3.1 Gestión de Envíos
Panel interactivo que consolida las métricas operacionales del día en tiempo real, divididas en estados críticos: En Sucursal, En Tránsito, Entregados y Cancelados. Incluye un buscador avanzado por tracking id.
3.2 Control Logístico
Localiza el paquete en el listado de los envíos en sucursal mediante su tracking id.
Seleccione la opción "Seleccionar Repartidor para ver su Ruta".
Una vez elegido el repartido, puede asignarle un envío que esté pendiente en sucursal presionando el botón "Asignar".
3.3 Asignación Masiva Automatizada
Mediante el botón "Asignar Todo", el sistema distribuye de manera equitativa y balanceada todos los paquetes en estado "En Sucursal" entre los repartidores activos de la jornada, optimizando la carga operativa del equipo de calle.
3.4 Importación Masiva mediante CSV 
Para dar de alta múltiples pedidos en un solo bloque, prepare un archivo con extensión .csv respetando la estructura de columnas requerida. Desde el panel, seleccione "Importar Envíos", cargue el archivo y procese para la generación automática de los identificadores de seguimiento y prioridades del sistema.

# 4. Módulo de Operaciones del Operador
El perfil de Operador está centrado en el trabajo administrativo de base y la atención en la sucursal. Su función principal es la ingesta de datos individuales y la recepción física de la mercadería.
4.1 Carga Manual de Envíos
Permite registrar nuevos paquetes en el sistema de forma individual. El operador ingresa los datos del destinatario, tipo de paquete y restricciones, y el sistema genera automáticamente un Tracking ID y calcula su prioridad logística.
4.2 Recepción en Sucursal
Acción de confirmar que un paquete físico ingresó a la base operativa. Permite actualizar el estado del pedido para que quede "En Sucursal", dejándolo visible y habilitado para que los Supervisores puedan asignarlo a una hoja de ruta.

# 5. Módulo de Operaciones del Repartidor
El perfil de Repartidor está optimizado exclusivamente para dispositivos móviles, facilitando el trabajo dinámico en la vía pública. 
5.1 Interfaz Móvil Responsiva
Al ingresar con este rol, la pantalla adapta su diseño con botones táctiles de gran tamaño, menús colapsables y visualización simplificada para evitar distracciones durante el traslado. 
5.2 Hoja de Ruta Optimizada (Mapa)
Una vez ingresado, aparecerá en el panel "Control Logístico" y verá el mapa interactivo con los envíos por entregar.
Los puntos de entrega aparecen ordenados numéricamente siguiendo un criterio de cercanía geográfica para reducir los tiempos de viaje.
5.3 Confirmación de Entrega
Una vez entregada la mercadería físicamente al cliente, busque el pedido en su lista activa en la parte baja.
Presione el botón "Entregado".
Resultado esperado: El sistema registrará la marca de tiempo exacta, pasará el estado a "Entregado" y actualizará el historial logístico de forma definitiva.



## 🔑 Credenciales para probar la App en Vivo
- **Link:** [[https://tu-app.onrender.com](https://compuyalogistica.onrender.com/)]


- **Usuario:** admin2@compuya.com
- **Contraseña:** 123456

- **Usuario:** supervisor1@compuya.com
- **Contraseña:** 123456

**Usuario:** rp1@compuya.com (repartidor)
- **Contraseña:** 123456

**Usuario:** cliente4@compuya.com
- **Contraseña:** 123456

**Usuario:** operador1@compuya.com
- **Contraseña:** 123456
