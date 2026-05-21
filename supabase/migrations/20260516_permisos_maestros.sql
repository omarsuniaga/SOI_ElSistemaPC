-- ============================================================================
-- Migration: permisos_maestros
-- Descripción: Tabla de permisos para maestros (registrar alumnos, inscribir clases)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.permisos_maestros (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  maestro_id uuid UNIQUE NOT NULL REFERENCES public.maestros(id) ON DELETE CASCADE,
  puede_registrar_alumnos boolean DEFAULT false,
  puede_inscribir_clases boolean DEFAULT false,
  concedido_por uuid REFERENCES public.maestros(id),
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

-- Trigger para actualizar actualizado_en automáticamente
CREATE OR REPLACE FUNCTION public.actualizar_timestamp_permisos()
RETURNS trigger AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_actualizado_en_permisos
  BEFORE UPDATE ON public.permisos_maestros
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_timestamp_permisos();

-- Índice para búsqueda por maestro
CREATE INDEX IF NOT EXISTS idx_permisos_maestros_maestro_id ON public.permisos_maestros(maestro_id);

-- Políticas de seguridad RLS
ALTER TABLE public.permisos_maestros ENABLE ROW LEVEL SECURITY;

-- 1. Políticas de RLS
DROP POLICY IF EXISTS "Solo admin puede insertar permisos" ON public.permisos_maestros;
DROP POLICY IF EXISTS "Solo admin puede actualizar permisos" ON public.permisos_maestros;
DROP POLICY IF EXISTS "Todos pueden leer permisos" ON public.permisos_maestros;
DROP POLICY IF EXISTS "Permitir insertar sus propios permisos o por admin" ON public.permisos_maestros;
DROP POLICY IF EXISTS "Permitir actualizar sus propios permisos o por admin" ON public.permisos_maestros;

CREATE POLICY "Todos pueden leer permisos"
  ON public.permisos_maestros
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir insertar sus propios permisos o por admin"
  ON public.permisos_maestros
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.es_admin()
    OR maestro_id IN (
      SELECT m.id
      FROM public.maestros m
      WHERE m.user_id = auth.uid()
    )
  );

CREATE POLICY "Permitir actualizar sus propios permisos o por admin"
  ON public.permisos_maestros
  FOR UPDATE
  TO authenticated
  USING (
    public.es_admin()
    OR maestro_id IN (
      SELECT m.id
      FROM public.maestros m
      WHERE m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.es_admin()
    OR maestro_id IN (
      SELECT m.id
      FROM public.maestros m
      WHERE m.user_id = auth.uid()
    )
  );

-- 2. Trigger de integridad para evitar auto-concesión de privilegios
CREATE OR REPLACE FUNCTION public.check_permisos_maestros_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Admin: no tocamos nada
  IF public.es_admin() THEN
    RETURN NEW;
  END IF;

  -- No-admin: no puede modificar la fila de otro maestro
  IF NEW.maestro_id NOT IN (
    SELECT m.id
    FROM public.maestros m
    WHERE m.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No tenés permisos para modificar el registro de otro maestro.';
  END IF;

  -- Protegemos integridad de los privilegios reales
  IF TG_OP = 'INSERT' THEN
    NEW.puede_registrar_alumnos := false;
    NEW.puede_inscribir_clases := false;
    NEW.permisos := ARRAY[]::text[];
    NEW.concedido_por := NULL;

  ELSIF TG_OP = 'UPDATE' THEN
    NEW.puede_registrar_alumnos := OLD.puede_registrar_alumnos;
    NEW.puede_inscribir_clases := OLD.puede_inscribir_clases;
    NEW.permisos := OLD.permisos;
    NEW.concedido_por := OLD.concedido_por;
  END IF;

  RETURN NEW;
END;
$$;

-- Registrar el trigger
DROP TRIGGER IF EXISTS trigger_check_permisos_maestros_integrity ON public.permisos_maestros;
CREATE TRIGGER trigger_check_permisos_maestros_integrity
  BEFORE INSERT OR UPDATE ON public.permisos_maestros
  FOR EACH ROW
  EXECUTE FUNCTION public.check_permisos_maestros_integrity();


