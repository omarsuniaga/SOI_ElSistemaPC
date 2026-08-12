-- ============================================================================
-- Migration: Fix evaluado_por FK to point at auth.users, not maestros
-- Date: 2026-08-14
-- Motivo (bug crítico encontrado en revisión adversarial):
--   evaluacion_indicador.evaluado_por se creó como
--   `UUID REFERENCES public.maestros(id)` (20260730000001), pero TODAS las
--   políticas RLS de esta tabla (20260730000001 y 20260811000001) comparan
--   `evaluado_por = auth.uid()` — es decir, el diseño real siempre asumió
--   que evaluado_por guarda el auth.uid() del maestro, NO maestros.id
--   (son dos UUIDs distintos: maestros.id es un PK propio, maestros.user_id
--   es el que coincide con auth.uid()).
--
--   Con la FK apuntando a maestros(id), cualquier INSERT/UPSERT que escriba
--   evaluado_por = auth.uid() (como hace todo el código nuevo del mapa de
--   rutas: saveIndicadorNota, updateRecoveryStatus) viola la FK, porque
--   auth.uid() casi nunca coincide con un maestros.id existente. El insert
--   falla siempre — ninguna calificación se puede guardar.
--
--   Fix: la FK debe apuntar a auth.users(id), que es lo que la columna
--   realmente contiene según el uso consistente en RLS.
-- ============================================================================

DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_schema = 'public'
    AND tc.table_name = 'evaluacion_indicador'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'evaluado_por'
  LIMIT 1;

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.evaluacion_indicador DROP CONSTRAINT %I', fk_name);
  END IF;
END $$;

ALTER TABLE public.evaluacion_indicador
  ADD CONSTRAINT evaluacion_indicador_evaluado_por_fkey
  FOREIGN KEY (evaluado_por) REFERENCES auth.users(id);
