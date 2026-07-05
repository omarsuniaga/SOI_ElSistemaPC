-- Slice 1: Objetivos como tier explícito entre nodes e indicators.
-- Enfoque conservador: aditivo y compatible con la lectura legacy.

CREATE TABLE IF NOT EXISTS public.objetivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id uuid NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  descripcion text,
  order_index integer NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT objetivos_node_order_unique UNIQUE (node_id, order_index)
);

ALTER TABLE public.objetivos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'objetivos'
      AND policyname = 'teacher_read_objetivos'
  ) THEN
    CREATE POLICY teacher_read_objetivos
      ON public.objetivos
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_objetivos_node_order
  ON public.objetivos(node_id, order_index);

ALTER TABLE public.indicators
  ADD COLUMN IF NOT EXISTS objetivo_id uuid REFERENCES public.objetivos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_indicators_objetivo_id
  ON public.indicators(objetivo_id);

-- Backfill aditivo: si nodes.objective existe y hay texto, crear un objetivo por nodo.
DO $$
DECLARE
  r record;
  v_objetivo_id uuid;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'nodes'
      AND column_name = 'objective'
  ) THEN
    FOR r IN
      SELECT id AS node_id, objective
      FROM public.nodes
      WHERE objective IS NOT NULL
        AND btrim(objective) <> ''
    LOOP
      INSERT INTO public.objetivos (node_id, nombre, descripcion, order_index)
      VALUES (r.node_id, left(btrim(r.objective), 180), r.objective, 0)
      ON CONFLICT (node_id, order_index) DO UPDATE
      SET nombre = EXCLUDED.nombre,
          descripcion = EXCLUDED.descripcion,
          updated_at = now()
      RETURNING id INTO v_objetivo_id;

      UPDATE public.indicators
      SET objetivo_id = v_objetivo_id
      WHERE node_id = r.node_id
        AND objetivo_id IS NULL;
    END LOOP;
  END IF;
END $$;

COMMENT ON TABLE public.objetivos IS 'Objetivos explícitos entre temas (nodes) e indicadores.';
COMMENT ON COLUMN public.indicators.objetivo_id IS 'FK explícita al objetivo al que pertenece el indicador.';

