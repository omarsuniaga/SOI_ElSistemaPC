-- ============================================================================
-- MIGRACIONES - Sistema Académico PWA
-- ============================================================================
-- Ejecutar en Supabase SQL Editor
-- Orden: ejecutar de arriba hacia abajo
-- ============================================================================

-- ============================================================================
-- 1. TABLA: planificaciones
-- Especificación: MODULES_SPECIFICATION.md - Sección 6️⃣
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.planificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clase_id UUID NOT NULL,
  maestro_id UUID,
  fecha_inicio DATE,
  tema TEXT NOT NULL,
  objetivos TEXT,
  contenido TEXT,
  recursos TEXT[],
  evaluacion_metodo TEXT,
  observaciones TEXT,
  estado TEXT DEFAULT 'planificado' CHECK (estado IN ('planificado', 'ejecutado', 'revisado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Relaciones
  CONSTRAINT planificaciones_clase_id_fkey
    FOREIGN KEY (clase_id) REFERENCES public.clases(id) ON DELETE CASCADE,
  CONSTRAINT planificaciones_maestro_id_fkey
    FOREIGN KEY (maestro_id) REFERENCES public.maestros(id) ON DELETE SET NULL
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_planificaciones_clase_id
  ON public.planificaciones(clase_id);
CREATE INDEX IF NOT EXISTS idx_planificaciones_fecha_inicio
  ON public.planificaciones(fecha_inicio DESC);
CREATE INDEX IF NOT EXISTS idx_planificaciones_estado
  ON public.planificaciones(estado);

-- Comentario para documentación
COMMENT ON TABLE public.planificaciones IS 'Planificación pedagógica de clases';

-- ============================================================================
-- 2. TABLA: progresos_academicos
-- Especificación: MODULES_SPECIFICATION.md - Sección 7️⃣
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.progresos_academicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id UUID NOT NULL,
  clase_id UUID NOT NULL,
  maestro_id UUID,
  fecha_evaluacion DATE NOT NULL,
  tipo_evaluacion TEXT NOT NULL CHECK (tipo_evaluacion IN ('parcial', 'final', 'continua')),
  calificacion DECIMAL(4, 2) CHECK (calificacion >= 0 AND calificacion <= 5),
  observaciones TEXT,
  estado TEXT DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'completado', 'pendiente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Relaciones
  CONSTRAINT progresos_alumno_id_fkey
    FOREIGN KEY (alumno_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT progresos_clase_id_fkey
    FOREIGN KEY (clase_id) REFERENCES public.clases(id) ON DELETE CASCADE,
  CONSTRAINT progresos_maestro_id_fkey
    FOREIGN KEY (maestro_id) REFERENCES public.maestros(id) ON DELETE SET NULL,

  -- Unicidad: un alumno, una clase, un tipo de evaluación (solo puede haber 1 final, 1 parcial, etc)
  CONSTRAINT unique_evaluacion_por_tipo
    UNIQUE(alumno_id, clase_id, tipo_evaluacion)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_progresos_alumno_id
  ON public.progresos_academicos(alumno_id);
CREATE INDEX IF NOT EXISTS idx_progresos_clase_id
  ON public.progresos_academicos(clase_id);
CREATE INDEX IF NOT EXISTS idx_progresos_fecha
  ON public.progresos_academicos(fecha_evaluacion DESC);
CREATE INDEX IF NOT EXISTS idx_progresos_estado
  ON public.progresos_academicos(estado);

COMMENT ON TABLE public.progresos_academicos IS 'Calificaciones y progreso académico de estudiantes';

-- ============================================================================
-- 3. TABLA: observaciones
-- Especificación: MODULES_SPECIFICATION.md - Sección 8️⃣
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
  fecha_observacion DATE NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_observaciones_alumno_id
  ON public.observaciones(alumno_id);
CREATE INDEX IF NOT EXISTS idx_observaciones_tipo
  ON public.observaciones(tipo);
CREATE INDEX IF NOT EXISTS idx_observaciones_estado
  ON public.observaciones(estado);
CREATE INDEX IF NOT EXISTS idx_observaciones_prioridad
  ON public.observaciones(prioridad);
CREATE INDEX IF NOT EXISTS idx_observaciones_fecha
  ON public.observaciones(fecha_observacion DESC);

COMMENT ON TABLE public.observaciones IS 'Anotaciones y seguimiento de estudiantes';

-- ============================================================================
-- 4. CAMPOS OPCIONALES A AGREGAR A TABLAS EXISTENTES
-- (Comentado - Revisar antes de ejecutar)
-- ============================================================================

-- OPCIONAL: Agregar updated_at a salones
-- ALTER TABLE public.salones ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- OPCIONAL: Agregar planificacion_id a clases (ya existe en el schema actual)
-- ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS planificacion_id UUID REFERENCES public.planificaciones(id) ON DELETE SET NULL;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) - OPCIONAL
-- Descomenta si implementas autenticación
-- ============================================================================

-- ALTER TABLE public.planificaciones ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.progresos_academicos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.observaciones ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY planificaciones_maestro_policy ON public.planificaciones
--   FOR ALL USING (maestro_id = auth.uid());

-- ============================================================================
-- FIN DE MIGRACIONES
-- ============================================================================
