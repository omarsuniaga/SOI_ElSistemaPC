-- ============================================================
-- PORTAL MAESTROS - Agregar columnas faltantes a tablas existentes
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Agregar columna maestro_id a la tabla clases (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clases' AND column_name = 'maestro_id') THEN
        ALTER TABLE clases ADD COLUMN maestro_id UUID;
    END IF;
END $$;

-- 2. Agregar columna maestro_id a la tabla clase_horarios (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clase_horarios' AND column_name = 'maestro_id') THEN
        ALTER TABLE clase_horarios ADD COLUMN maestro_id UUID;
    END IF;
END $$;

-- 3. Agregar columna borrador a sesiones_clase (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sesiones_clase' AND column_name = 'borrador') THEN
        ALTER TABLE sesiones_clase ADD COLUMN borrador BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ============================================================
-- TABLAS NUEVAS PARA PORTAL MAESTROS
-- ============================================================

-- Tabla de sesiones de clase (asistencia + contenido)
CREATE TABLE IF NOT EXISTS sesiones_clase (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clase_id UUID REFERENCES clases(id) ON DELETE CASCADE,
  maestro_id UUID NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  contenido_dsl TEXT,
  contenido TEXT,
  borrador BOOLEAN DEFAULT true,
  asistencia JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para sesiones_clase
CREATE INDEX IF NOT EXISTS idx_sesiones_clase_maestro_fecha ON sesiones_clase(maestro_id, fecha);
CREATE INDEX IF NOT EXISTS idx_sesiones_clase_clase_fecha ON sesiones_clase(clase_id, fecha);

-- Tabla de clases emergentes
CREATE TABLE IF NOT EXISTS clases_emergentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id UUID NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  clase_id UUID,
  nombre_clase TEXT,
  motivo TEXT,
  contenido TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clases_emergentes_maestro_fecha ON clases_emergentes(maestro_id, fecha);

-- Tabla de tareas del maestro
CREATE TABLE IF NOT EXISTS maestro_tareas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id UUID NOT NULL,
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  sesion_id UUID REFERENCES sesiones_clase(id) ON DELETE SET NULL,
  tarea TEXT NOT NULL,
  fecha_recordatorio DATE,
  completada BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maestro_tareas_maestro_fecha ON maestro_tareas(maestro_id, fecha_recordatorio);

-- Tabla de solicitudes de ausencia
CREATE TABLE IF NOT EXISTS solicitudes_ausencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id UUID NOT NULL,
  fecha_ausencia DATE NOT NULL,
  motivo TEXT,
  contenido_reemplazo TEXT,
  suplente_id UUID,
  dinamica_trabajo TEXT,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_ausencia_maestro ON solicitudes_ausencia(maestro_id);

-- Tabla de acceso temporal para sustitutos
CREATE TABLE IF NOT EXISTS clase_acceso_temporal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clase_id UUID REFERENCES clases(id) ON DELETE CASCADE,
  maestro_suplente_id UUID NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de planificación de nodos curriculares
CREATE TABLE IF NOT EXISTS planificacion_nodos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id UUID NOT NULL,
  programa_id UUID,
  codigo TEXT,
  nombre TEXT,
  descripcion TEXT,
  nivel INTEGER,
  bloque INTEGER,
  ponderacion NUMERIC,
  padre_id UUID REFERENCES planificacion_nodos(id),
  estado TEXT DEFAULT 'disponible' CHECK (estado IN ('bloqueado', 'disponible', 'en_progreso', 'completado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planificacion_nodos_maestro ON planificacion_nodos(maestro_id);

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar config inicial
INSERT INTO system_config (key, value, description) VALUES 
  ('dominio', 'https://tu-dominio.com', 'Dominio de la aplicación'),
  ('timezone', 'America/Santo_Domingo', 'Zona horaria'),
  ('groq_api_key', '', 'API key para GROQ (IA)'),
  ('maestros_pueden_crear_clases', 'false', 'Permite a los maestros crear clases desde su portal (true/false)')
ON CONFLICT (key) DO NOTHING;

-- Tabla de suscripciones push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT UNIQUE NOT NULL,
  subscription_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verificar resultado
SELECT '✅ Columns added and tables created' as status;