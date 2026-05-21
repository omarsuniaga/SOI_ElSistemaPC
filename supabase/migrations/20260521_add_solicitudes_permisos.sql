-- ============================================================================
-- Migration: Agregar tabla solicitudes_permisos y columnas faltantes
-- Descripción:
--   1. Agregar columnas solicitudes y permisos a permisos_maestros
--   2. Crear tabla solicitudes_permisos para registrar solicitudes de maestros
-- ============================================================================

-- 1. Agregar columnas faltantes a permisos_maestros
ALTER TABLE public.permisos_maestros
ADD COLUMN IF NOT EXISTS solicitudes TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS permisos TEXT[] DEFAULT '{}';

-- 2. Crear tabla solicitudes_permisos
CREATE TABLE IF NOT EXISTS public.solicitudes_permisos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL UNIQUE REFERENCES public.maestros(id) ON DELETE CASCADE,
  estado TEXT DEFAULT 'pendiente', -- pendiente, aprobado, rechazado
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

-- Asegurar que las columnas de solicitud existan (por si la tabla ya existía sin ellas)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solicitudes_permisos' AND column_name = 'solicita_alumnos') THEN
        ALTER TABLE public.solicitudes_permisos ADD COLUMN solicita_alumnos boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solicitudes_permisos' AND column_name = 'solicita_clases') THEN
        ALTER TABLE public.solicitudes_permisos ADD COLUMN solicita_clases boolean DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solicitudes_permisos' AND column_name = 'aprobado_en') THEN
        ALTER TABLE public.solicitudes_permisos ADD COLUMN aprobado_en timestamptz;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solicitudes_permisos' AND column_name = 'aprobado_por') THEN
        ALTER TABLE public.solicitudes_permisos ADD COLUMN aprobado_por uuid REFERENCES public.maestros(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solicitudes_permisos' AND column_name = 'motivo_rechazo') THEN
        ALTER TABLE public.solicitudes_permisos ADD COLUMN motivo_rechazo TEXT;
    END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON public.solicitudes_permisos(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_maestro_id ON public.solicitudes_permisos(maestro_id);

-- Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION public.actualizar_timestamp_solicitudes()
RETURNS trigger AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS set_actualizado_en_solicitudes
  BEFORE UPDATE ON public.solicitudes_permisos
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_timestamp_solicitudes();

-- RLS para solicitudes_permisos
ALTER TABLE public.solicitudes_permisos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Maestro puede ver su solicitud" ON public.solicitudes_permisos;
DROP POLICY IF EXISTS "Maestro puede crear su solicitud" ON public.solicitudes_permisos;
DROP POLICY IF EXISTS "Admin puede ver todas" ON public.solicitudes_permisos;
DROP POLICY IF EXISTS "Admin puede actualizar" ON public.solicitudes_permisos;

CREATE POLICY "Maestro puede ver su solicitud"
  ON public.solicitudes_permisos
  FOR SELECT
  TO authenticated
  USING (
    maestro_id IN (
      SELECT m.id FROM public.maestros m
      WHERE m.user_id = auth.uid()
    )
    OR public.es_admin()
  );

CREATE POLICY "Maestro puede crear su solicitud"
  ON public.solicitudes_permisos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    maestro_id IN (
      SELECT m.id FROM public.maestros m
      WHERE m.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin puede ver y actualizar todas"
  ON public.solicitudes_permisos
  FOR ALL
  TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());
