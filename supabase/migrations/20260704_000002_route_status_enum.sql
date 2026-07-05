-- Slice 1 (cont.): autoría bidireccional en route_versions.
-- route_status real en prod es ('draft','published','archived') — ver
-- supabase/migrations/ruta-academica-tables.sql. Se agregan 'propuesta' y
-- 'devuelta' sin tocar los valores existentes (aditivo, no rompe consumidores).
--
-- IMPORTANT: ALTER TYPE ... ADD VALUE no puede ejecutarse dentro de un bloque
-- transaccional junto con su uso posterior. Cada ALTER TYPE va en su propio
-- statement/transacción implícita; por eso este archivo NO envuelve todo en
-- BEGIN/COMMIT explícito.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'route_status' AND e.enumlabel = 'propuesta'
  ) THEN
    ALTER TYPE route_status ADD VALUE 'propuesta';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'route_status' AND e.enumlabel = 'devuelta'
  ) THEN
    ALTER TYPE route_status ADD VALUE 'devuelta';
  END IF;
END $$;

-- Columnas de autoría en route_versions. Todas nullable/con default para no
-- romper filas existentes creadas por ACM (origen='acm').
ALTER TABLE public.route_versions
  ADD COLUMN IF NOT EXISTS origen text NOT NULL DEFAULT 'acm'
    CHECK (origen IN ('acm', 'maestro'));

ALTER TABLE public.route_versions
  ADD COLUMN IF NOT EXISTS propuesta_por uuid REFERENCES public.maestros(id);

ALTER TABLE public.route_versions
  ADD COLUMN IF NOT EXISTS clase_id uuid REFERENCES public.clases(id);

ALTER TABLE public.route_versions
  ADD COLUMN IF NOT EXISTS feedback text;

-- Constraint: propuestas de maestro deben traer autor y clase.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'route_versions_origen_maestro_check'
  ) THEN
    ALTER TABLE public.route_versions
      ADD CONSTRAINT route_versions_origen_maestro_check
      CHECK (
        origen <> 'maestro'
        OR (propuesta_por IS NOT NULL AND clase_id IS NOT NULL)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_route_versions_origen_clase_status
  ON public.route_versions(origen, clase_id, status);

-- RLS: el maestro puede INSERTAR su propuesta (origen='maestro', propia
-- clase), pero NO puede cambiar status (solo ACM publica/devuelve).
ALTER TABLE public.route_versions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'route_versions'
      AND policyname = 'maestro_insert_propuesta'
  ) THEN
    CREATE POLICY maestro_insert_propuesta
      ON public.route_versions
      FOR INSERT
      TO authenticated
      WITH CHECK (
        origen = 'maestro'
        AND status = 'propuesta'
        AND propuesta_por IN (
          SELECT id FROM public.maestros WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'route_versions'
      AND policyname = 'maestro_select_own_propuestas'
  ) THEN
    CREATE POLICY maestro_select_own_propuestas
      ON public.route_versions
      FOR SELECT
      TO authenticated
      USING (
        status = 'published'
        OR propuesta_por IN (
          SELECT id FROM public.maestros WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

COMMENT ON COLUMN public.route_versions.origen IS 'acm = creado por ACM (autoridad de publicación); maestro = propuesta pendiente de revisión.';
COMMENT ON COLUMN public.route_versions.propuesta_por IS 'FK a maestros: autor de la propuesta cuando origen=maestro.';
COMMENT ON COLUMN public.route_versions.clase_id IS 'Clase a la que se scoping la propuesta del maestro.';
COMMENT ON COLUMN public.route_versions.feedback IS 'Motivo de ACM al devolver una propuesta (status=devuelta).';
