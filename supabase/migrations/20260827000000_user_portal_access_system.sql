-- =============================================================================
-- MIGRATION: Dynamic User Portal Access System
-- File: supabase/migrations/20260827_user_portal_access_system.sql
-- Description:
--   1. Creates portal_catalog table for listing all available system portals.
--   2. Creates user_portal_access table for granular portal assignments per user.
--   3. Defines secure RPC helpers: has_portal_access, get_user_portales, set_user_portales.
--   4. Configures RLS policies and seeds existing 11 portal definitions with role fallbacks.
-- =============================================================================

BEGIN;

-- 1. PORTAL CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.portal_catalog (
  portal_id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  ruta TEXT NOT NULL,
  icono TEXT DEFAULT 'bi-door-open',
  roles_default TEXT[] DEFAULT '{}'::TEXT[],
  activo BOOLEAN NOT NULL DEFAULT true,
  orden INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. USER PORTAL ACCESS TABLE
CREATE TABLE IF NOT EXISTS public.user_portal_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  portal_id TEXT NOT NULL REFERENCES public.portal_catalog(portal_id) ON UPDATE CASCADE ON DELETE CASCADE,
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_portal_access_user_portal_unique UNIQUE (user_id, portal_id)
);

CREATE INDEX IF NOT EXISTS idx_user_portal_access_user_id ON public.user_portal_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portal_access_portal_id ON public.user_portal_access(portal_id);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.portal_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portal_access ENABLE ROW LEVEL SECURITY;

-- portal_catalog policies
DROP POLICY IF EXISTS "portal_catalog_select_authenticated" ON public.portal_catalog;
CREATE POLICY "portal_catalog_select_authenticated"
  ON public.portal_catalog FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "portal_catalog_admin_all" ON public.portal_catalog;
CREATE POLICY "portal_catalog_admin_all"
  ON public.portal_catalog FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol IN ('superadmin', 'admin')
    )
  );

-- user_portal_access policies
DROP POLICY IF EXISTS "user_portal_access_select_own_or_admin" ON public.user_portal_access;
CREATE POLICY "user_portal_access_select_own_or_admin"
  ON public.user_portal_access FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol IN ('superadmin', 'admin')
    )
  );

DROP POLICY IF EXISTS "user_portal_access_admin_write" ON public.user_portal_access;
CREATE POLICY "user_portal_access_admin_write"
  ON public.user_portal_access FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol IN ('superadmin', 'admin')
    )
  );

-- 4. RPC FUNCTIONS

-- A. has_portal_access: Valida si el usuario actual (o específico) tiene acceso al portal
CREATE OR REPLACE FUNCTION public.has_portal_access(p_portal_id text, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_uid uuid;
  v_rol text;
  v_has boolean := false;
  v_normalized_portal text;
BEGIN
  v_uid := COALESCE(p_user_id, auth.uid());
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  v_normalized_portal := upper(trim(p_portal_id));

  SELECT rol INTO v_rol FROM public.profiles WHERE id = v_uid;
  IF v_rol IS NULL THEN
    RETURN false;
  END IF;

  -- Superadmin siempre tiene acceso total
  IF v_rol = 'superadmin' THEN
    RETURN true;
  END IF;

  -- Validar asignación explícita en user_portal_access
  SELECT EXISTS (
    SELECT 1 FROM public.user_portal_access
    WHERE user_id = v_uid AND upper(portal_id) = v_normalized_portal
  ) INTO v_has;

  IF v_has THEN
    RETURN true;
  END IF;

  -- Fallback a roles por defecto del portal
  SELECT EXISTS (
    SELECT 1 FROM public.portal_catalog
    WHERE upper(portal_id) = v_normalized_portal
      AND activo = true
      AND v_rol = ANY(roles_default)
  ) INTO v_has;

  RETURN v_has;
END;
$$;

-- B. get_user_portales: Lista todos los portales autorizados para un usuario
CREATE OR REPLACE FUNCTION public.get_user_portales(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  portal_id text,
  nombre text,
  descripcion text,
  ruta text,
  icono text,
  orden int,
  origen text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_uid uuid;
  v_rol text;
BEGIN
  v_uid := COALESCE(p_user_id, auth.uid());
  IF v_uid IS NULL THEN
    RETURN;
  END IF;

  SELECT rol INTO v_rol FROM public.profiles WHERE id = v_uid;
  IF v_rol IS NULL THEN
    RETURN;
  END IF;

  -- Si es Superadmin, ve todos los portales activos
  IF v_rol = 'superadmin' THEN
    RETURN QUERY
    SELECT 
      c.portal_id, 
      c.nombre, 
      c.descripcion, 
      c.ruta, 
      c.icono, 
      c.orden, 
      'superadmin'::text AS origen
    FROM public.portal_catalog c
    WHERE c.activo = true
    ORDER BY c.orden ASC, c.nombre ASC;
    RETURN;
  END IF;

  -- Usuarios generales: Portales con asignación explícita o rol inherente
  RETURN QUERY
  SELECT 
    c.portal_id,
    c.nombre,
    c.descripcion,
    c.ruta,
    c.icono,
    c.orden,
    CASE
      WHEN a.id IS NOT NULL THEN 'asignado'::text
      ELSE 'rol_default'::text
    END AS origen
  FROM public.portal_catalog c
  LEFT JOIN public.user_portal_access a 
    ON a.portal_id = c.portal_id AND a.user_id = v_uid
  WHERE c.activo = true
    AND (a.id IS NOT NULL OR v_rol = ANY(c.roles_default))
  ORDER BY c.orden ASC, c.nombre ASC;
END;
$$;

-- C. set_user_portales: Asigna la lista completa de portales a un usuario
CREATE OR REPLACE FUNCTION public.set_user_portales(p_user_id uuid, p_portal_ids text[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_rol text;
  v_pid text;
  v_inserted int := 0;
BEGIN
  SELECT rol INTO v_caller_rol FROM public.profiles WHERE id = auth.uid();
  IF v_caller_rol NOT IN ('superadmin', 'admin') THEN
    RAISE EXCEPTION 'No autorizado para asignar portales a usuarios';
  END IF;

  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id es requerido';
  END IF;

  DELETE FROM public.user_portal_access WHERE user_id = p_user_id;

  IF p_portal_ids IS NOT NULL AND array_length(p_portal_ids, 1) > 0 THEN
    FOREACH v_pid IN ARRAY p_portal_ids
    LOOP
      IF EXISTS (SELECT 1 FROM public.portal_catalog WHERE upper(portal_id) = upper(trim(v_pid))) THEN
        INSERT INTO public.user_portal_access (user_id, portal_id, granted_by)
        VALUES (p_user_id, upper(trim(v_pid)), auth.uid())
        ON CONFLICT (user_id, portal_id) DO NOTHING;
        v_inserted := v_inserted + 1;
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'assigned_count', v_inserted
  );
END;
$$;

-- 5. SEED INICIAL DEL CATÁLOGO DE PORTALES
INSERT INTO public.portal_catalog (portal_id, nombre, descripcion, ruta, icono, roles_default, orden, activo)
VALUES
  ('SUPERADMIN', 'SuperAdmin Master', 'Centro de comando global institucional', '/admin.html', 'bi-shield-lock-fill', ARRAY['superadmin'], 1, true),
  ('ADM', 'Portal Administración', 'Gestión administrativa, compras y logística', '/adm.html', 'bi-briefcase-fill', ARRAY['superadmin', 'admin', 'coordinacion_academica'], 2, true),
  ('ACM', 'Portal Académico', 'Programación académica, cohortes y planes', '/acm.html', 'bi-mortarboard-fill', ARRAY['superadmin', 'admin', 'direccion', 'coordinacion_academica'], 3, true),
  ('FIN', 'Portal Finanzas SOI', 'Tesorería, cobros, cuotas y contabilidad', '/soi-finanzas.html', 'bi-cash-coin', ARRAY['superadmin', 'admin', 'finanzas'], 4, true),
  ('CAL', 'Portal Calendario', 'Eventos, temporadas, ensayos y protocolos', '/calendario.html', 'bi-calendar3', ARRAY['superadmin', 'admin', 'direccion', 'coordinacion_academica', 'maestro', 'monitor', 'operaciones'], 5, true),
  ('MAE', 'Portal Docente', 'Asistencias, clases, evaluaciones y diario', '/index.html', 'bi-person-video3', ARRAY['superadmin', 'admin', 'maestro', 'monitor'], 6, true),
  ('COM', 'Portal Comunicaciones', 'Campañas, difusión institucional y medios', '/com.html', 'bi-megaphone-fill', ARRAY['superadmin', 'admin', 'direccion', 'coordinacion_academica'], 7, true),
  ('TEC', 'Portal Técnico', 'Mantenimiento de infraestructura y equipos', '/tecnico.html', 'bi-wrench-adjustable', ARRAY['superadmin', 'admin', 'operaciones'], 8, true),
  ('LUT', 'Portal Lutería', 'Inventario, reparación y taller de lutería', '/luteria.html', 'bi-music-note-beamed', ARRAY['superadmin', 'admin', 'operaciones'], 9, true),
  ('SIM', 'Portal Simulador', 'Simulador de escenarios y balance de carga', '/simulador.html', 'bi-sliders', ARRAY['superadmin', 'admin'], 10, true),
  ('AUD', 'Portal Audiciones', 'Evaluación de postulantes y jurados', '/audiciones.html', 'bi-award-fill', ARRAY['superadmin', 'admin', 'jurado', 'direccion'], 11, true)
ON CONFLICT (portal_id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  ruta = EXCLUDED.ruta,
  icono = EXCLUDED.icono,
  roles_default = EXCLUDED.roles_default,
  orden = EXCLUDED.orden,
  activo = EXCLUDED.activo,
  updated_at = now();

COMMIT;
