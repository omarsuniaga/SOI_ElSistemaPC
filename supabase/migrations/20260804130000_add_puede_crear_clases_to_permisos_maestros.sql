-- ============================================================================
-- Migration: separar permiso clases:create
-- Descripción:
--   1. Agrega el booleano puede_crear_clases a permisos_maestros
--   2. Actualiza el trigger de integridad para preservar este permiso
-- ============================================================================

ALTER TABLE public.permisos_maestros
ADD COLUMN IF NOT EXISTS puede_crear_clases boolean DEFAULT false;

CREATE OR REPLACE FUNCTION public.check_permisos_maestros_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.es_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.maestro_id NOT IN (
    SELECT m.id
    FROM public.maestros m
    WHERE m.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No tenés permisos para modificar el registro de otro maestro.';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.puede_registrar_alumnos := false;
    NEW.puede_inscribir_clases := false;
    NEW.puede_crear_clases := false;
    NEW.permisos := ARRAY[]::text[];
    NEW.concedido_por := NULL;

  ELSIF TG_OP = 'UPDATE' THEN
    NEW.puede_registrar_alumnos := OLD.puede_registrar_alumnos;
    NEW.puede_inscribir_clases := OLD.puede_inscribir_clases;
    NEW.puede_crear_clases := OLD.puede_crear_clases;
    NEW.permisos := OLD.permisos;
    NEW.concedido_por := OLD.concedido_por;
  END IF;

  RETURN NEW;
END;
$$;
