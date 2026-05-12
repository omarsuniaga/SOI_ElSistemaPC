-- ============================================================================
-- MIGRACIONES COMPLETAS - Sistema Académico PWA
-- ============================================================================
-- Ejecutar en Supabase SQL Editor
-- Orden: ejecutar de arriba hacia abajo
-- ============================================================================

-- ============================================================================
-- 1. TABLA: students (alumnos)
-- Coincide con el schema existente + campos adicionales del frontend
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  section TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  final_score NUMERIC,
  ensemble_id UUID,
  ensemble_section TEXT,
  atril INTEGER,
  posicion_atril TEXT,
  parent_email TEXT DEFAULT '',
  parent_phone TEXT DEFAULT '',
  acudiente TEXT DEFAULT '',
  email TEXT,
  cedula TEXT,
  fecha_nacimiento DATE,
  genero TEXT,
  direccion TEXT,
  es_activo BOOLEAN DEFAULT true,
  
  -- Relaciones
  CONSTRAINT students_ensemble_id_fkey 
    FOREIGN KEY (ensemble_id) REFERENCES public.ensembles(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_students_name ON public.students(name);
CREATE INDEX IF NOT EXISTS idx_students_section ON public.students(section);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);
CREATE INDEX IF NOT EXISTS idx_students_cedula ON public.students(cedula);

-- Habilitar API
ALTER TABLE public.students ENABLE API;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Policy para acceso público (ajustar según necesidades)
CREATE POLICY "Allow public access" ON public.students FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE public.students IS 'Tabla de estudiantes/alumnos del sistema académico';

-- ============================================================================
-- 2. TABLA: progresos_academicos (calificaciones)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.progresos_academicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id UUID NOT NULL,
  clase_id UUID NOT NULL,
  maestro_id UUID,
  fecha_evaluacion DATE NOT NULL DEFAULT current_date,
  tipo_evaluacion TEXT NOT NULL DEFAULT 'continua',
  calificacion DECIMAL(4,2) CHECK (calificacion IS NULL OR (calificacion >= 0 AND calificacion <= 5)),
  observaciones TEXT DEFAULT '',
  estado TEXT DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'completado', 'pendiente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Relaciones
  CONSTRAINT progresos_alumno_id_fkey 
    FOREIGN KEY (alumno_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT progresos_clase_id_fkey 
    FOREIGN KEY (clase_id) REFERENCES public.clases(id) ON DELETE CASCADE,
  CONSTRAINT progresos_maestro_id_fkey 
    FOREIGN KEY (maestro_id) REFERENCES public.maestros(id) ON DELETE SET NULL
);

-- Índice único (opcional - descomentar si se necesita)
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_progresos_unique 
--   ON public.progresos_academicos(alumno_id, clase_id, tipo_evaluacion);

-- Índices
CREATE INDEX IF NOT EXISTS idx_progresos_alumno ON public.progresos_academicos(alumno_id);
CREATE INDEX IF NOT EXISTS idx_progresos_clase ON public.progresos_academicos(clase_id);
CREATE INDEX IF NOT EXISTS idx_progresos_fecha ON public.progresos_academicos(fecha_evaluacion DESC);
CREATE INDEX IF NOT EXISTS idx_progresos_estado ON public.progresos_academicos(estado);

-- Habilitar API
ALTER TABLE public.progresos_academicos ENABLE API;
ALTER TABLE public.progresos_academicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON public.progresos_academicos FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE public.progresos_academicos IS 'Calificaciones y seguimiento académico de estudiantes';

-- ============================================================================
-- 3. TABLA: observaciones (anotaciones disciplinarias)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.observaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id UUID NOT NULL,
  maestro_id UUID,
  tipo TEXT NOT NULL CHECK (tipo IN ('comportamiento', 'academico', 'social', 'disciplina')),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  prioridad TEXT DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta')),
  estado TEXT DEFAULT 'abierta' CHECK (estado IN ('abierta', 'resuelta', 'seguimiento')),
  fecha_observacion DATE NOT NULL DEFAULT current_date,
  seguimiento_fecha DATE,
  seguimiento_observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Relaciones
  CONSTRAINT observaciones_alumno_id_fkey 
    FOREIGN KEY (alumno_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT observaciones_maestro_id_fkey 
    FOREIGN KEY (maestro_id) REFERENCES public.maestros(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_observaciones_alumno ON public.observaciones(alumno_id);
CREATE INDEX IF NOT EXISTS idx_observaciones_tipo ON public.observaciones(tipo);
CREATE INDEX IF NOT EXISTS idx_observaciones_estado ON public.observaciones(estado);
CREATE INDEX IF NOT EXISTS idx_observaciones_prioridad ON public.observaciones(prioridad);
CREATE INDEX IF NOT EXISTS idx_observaciones_fecha ON public.observaciones(fecha_observacion DESC);

-- Habilitar API
ALTER TABLE public.observaciones ENABLE API;
ALTER TABLE public.observaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON public.observaciones FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE public.observaciones IS 'Anotaciones y seguimiento disciplinario de estudiantes';

-- ============================================================================
-- 4. TABLA: planificaciones (opcional - solo si se necesita)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.planificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clase_id UUID NOT NULL,
  maestro_id UUID,
  fecha_inicio DATE,
  tema TEXT NOT NULL,
  objetivos TEXT DEFAULT '',
  contenido TEXT DEFAULT '',
  recursos TEXT[] DEFAULT '{}',
  evaluacion_metodo TEXT DEFAULT '',
  observaciones TEXT DEFAULT '',
  estado TEXT DEFAULT 'planificado' CHECK (estado IN ('planificado', 'ejecutado', 'revisado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Relaciones
  CONSTRAINT planificaciones_clase_id_fkey 
    FOREIGN KEY (clase_id) REFERENCES public.clases(id) ON DELETE CASCADE,
  CONSTRAINT planificaciones_maestro_id_fkey 
    FOREIGN KEY (maestro_id) REFERENCES public.maestros(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_planificaciones_clase ON public.planificaciones(clase_id);
CREATE INDEX IF NOT EXISTS idx_planificaciones_fecha ON public.planificaciones(fecha_inicio DESC);
CREATE INDEX IF NOT EXISTS idx_planificaciones_estado ON public.planificaciones(estado);

-- Habilitar API
ALTER TABLE public.planificaciones ENABLE API;
ALTER TABLE public.planificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON public.planificaciones FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE public.planificaciones IS 'Planificación pedagógica de clases';

-- ============================================================================
-- 5. AGREGAR CAMPOS FALTANTES A TABLAS EXISTENTES
-- ============================================================================

-- Agregar campos opcionales a salones (si no existen)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salones' AND column_name = 'codigo_salon') THEN
    ALTER TABLE public.salones ADD COLUMN codigo_salon TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salones' AND column_name = 'ubicacion') THEN
    ALTER TABLE public.salones ADD COLUMN ubicacion TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salones' AND column_name = 'piso') THEN
    ALTER TABLE public.salones ADD COLUMN piso INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salones' AND column_name = 'updated_at') THEN
    ALTER TABLE public.salones ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
END $$;

-- Agregar campos opcionales a maestros (si no existen)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maestros' AND column_name = 'name') THEN
    ALTER TABLE public.maestros ADD COLUMN name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maestros' AND column_name = 'especialidad') THEN
    ALTER TABLE public.maestros ADD COLUMN especialidad TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maestros' AND column_name = 'bio') THEN
    ALTER TABLE public.maestros ADD COLUMN bio TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maestros' AND column_name = 'is_active') THEN
    ALTER TABLE public.maestros ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- ============================================================================
-- 6. ACTUALIZAR SCHEMA CACHE DE SUPABASE
-- ============================================================================

-- Notificar a Supabase que hubo cambios (esto es automático pero ayuda a acelerar)
NOTIFY pgrst, 'reload';

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

SELECT 'Tablas creadas:' AS status;
SELECT 
  'students' AS table_name,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'students' AND table_schema = 'public') AS exists_flag
UNION ALL
SELECT 
  'progresos_academicos',
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'progresos_academicos' AND table_schema = 'public')
UNION ALL
SELECT 
  'observaciones',
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'observaciones' AND table_schema = 'public')
UNION ALL
SELECT 
  'planificaciones',
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'planificaciones' AND table_schema = 'public');

-- ============================================================================
-- FIN DE MIGRACIONES
-- ============================================================================