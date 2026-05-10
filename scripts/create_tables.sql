-- Script para crear tablas en Supabase PostgreSQL
-- Optimizado siguiendo las mejores prácticas de Supabase Postgres

-- Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('empleado', 'empresa')),
    supabase_id UUID UNIQUE NOT NULL, -- Los IDs de Supabase Auth son UUID
    email TEXT UNIQUE NOT NULL,        -- TEXT es preferible en Postgres
    rol VARCHAR(20) DEFAULT 'visor',
    nombre TEXT,
    apellido TEXT,
    direccion_normalizada TEXT,
    razon_social TEXT,
    provincia TEXT,
    municipio TEXT,
    cod_postal VARCHAR(20),
    fecha DATE DEFAULT CURRENT_DATE
);

-- Índices para mejorar rendimiento de consultas comunes
-- No creamos índices para email o supabase_id porque Postgres crea índices automáticos para restricciones UNIQUE
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- Comentarios para documentación
COMMENT ON TABLE usuarios IS 'Tabla que almacena información de usuarios (empleados y empresas)';
COMMENT ON COLUMN usuarios.tipo IS 'Tipo de cliente: empleado o empresa';
COMMENT ON COLUMN usuarios.supabase_id IS 'Identificador único del usuario en Supabase Auth (UUID)';
COMMENT ON COLUMN usuarios.email IS 'Correo electrónico del usuario';
COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario en el sistema (visor, operador, admin, etc.)';
COMMENT ON COLUMN usuarios.nombre IS 'Nombre del usuario';
COMMENT ON COLUMN usuarios.apellido IS 'Apellido del usuario';
COMMENT ON COLUMN usuarios.direccion_normalizada IS 'Dirección normalizada del usuario';
COMMENT ON COLUMN usuarios.razon_social IS 'Razón social (para empresas)';
COMMENT ON COLUMN usuarios.provincia IS 'Provincia del usuario';
COMMENT ON COLUMN usuarios.municipio IS 'Municipio del usuario';
COMMENT ON COLUMN usuarios.cod_postal IS 'Código postal del usuario';
COMMENT ON COLUMN usuarios.fecha IS 'Fecha de creación o registro';