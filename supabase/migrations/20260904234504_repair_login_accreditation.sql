-- Repair Portal Maestros authentication and authorization drift.
-- 1. Restore self-read access required by maestro_actual() and loginMaestro().
-- 2. Prevent users from changing authorization fields on their own profile.
-- 3. Materialize missing maestros rows for already-approved teacher profiles.

BEGIN;

ALTER TABLE public.maestros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Maestros pueden leer su propia información" ON public.maestros;
DROP POLICY IF EXISTS maestros_select_self ON public.maestros;

CREATE POLICY maestros_select_self
ON public.maestros
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- The previous policy allowed any authenticated user to update every column of
-- their own profile, including rol and estado. Authorization changes are admin-only.
DROP POLICY IF EXISTS profiles_admin_update ON public.profiles;

CREATE POLICY profiles_admin_update
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.es_admin())
WITH CHECK (public.es_admin());

-- Approved profiles are authoritative. Create only missing teacher records;
-- never reactivate retired teachers and never overwrite an existing record.
INSERT INTO public.maestros (
  user_id,
  nombre_completo,
  correo,
  especialidad,
  resena,
  activo
)
SELECT
  p.id,
  COALESCE(NULLIF(BTRIM(p.nombre_completo), ''), p.email),
  p.email,
  COALESCE(NULLIF(BTRIM(p.solicitud_instrumento), ''), ''),
  p.solicitud_resena,
  true
FROM public.profiles p
WHERE p.rol = 'maestro'
  AND p.estado = 'activo'
  AND NOT EXISTS (
    SELECT 1
    FROM public.maestros m
    WHERE m.user_id = p.id
  )
ON CONFLICT DO NOTHING;

-- Match the default permissions granted by approve_maestro_profile().
-- The integrity trigger expects an authenticated admin context even during a
-- migration, so establish one locally for this transaction only.
SELECT set_config(
  'request.jwt.claim.sub',
  COALESCE((
    SELECT p.id::text
    FROM public.profiles p
    WHERE p.rol = 'admin' AND p.estado = 'activo'
    ORDER BY p.created_at
    LIMIT 1
  ), ''),
  true
);

INSERT INTO public.permisos_maestros (
  maestro_id,
  puede_registrar_alumnos,
  puede_inscribir_clases,
  permisos
)
SELECT
  m.id,
  true,
  true,
  ARRAY['alumnos:create', 'clases:enroll', 'registrar_alumnos', 'inscribir_clases']::text[]
FROM public.maestros m
JOIN public.profiles p ON p.id = m.user_id
WHERE p.rol = 'maestro'
  AND p.estado = 'activo'
  AND m.activo = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.permisos_maestros pm
    WHERE pm.maestro_id = m.id
  )
ON CONFLICT DO NOTHING;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.profiles p
    LEFT JOIN public.maestros m ON m.user_id = p.id
    WHERE p.rol = 'maestro'
      AND p.estado = 'activo'
      AND m.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Active teacher profiles remain without maestros linkage';
  END IF;
END;
$$;

COMMIT;
