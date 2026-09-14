CREATE TABLE IF NOT EXISTS public.montaje_pasajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  montaje_id uuid NOT NULL REFERENCES public.montajes(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  descripcion text,
  dificultad text,
  focus_tags text[] NOT NULL DEFAULT '{}',
  alcance jsonb NOT NULL DEFAULT '{}'::jsonb,
  creado_por uuid REFERENCES public.maestros(id) ON DELETE SET NULL,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.montaje_pasaje_compases (
  pasaje_id uuid NOT NULL REFERENCES public.montaje_pasajes(id) ON DELETE CASCADE,
  montaje_compas_id uuid NOT NULL REFERENCES public.montaje_compases(id) ON DELETE CASCADE,
  PRIMARY KEY (pasaje_id, montaje_compas_id)
);

CREATE TABLE IF NOT EXISTS public.montaje_grupos_compases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  montaje_id uuid NOT NULL REFERENCES public.montajes(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  created_by uuid REFERENCES public.maestros(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.montaje_grupo_compases (
  grupo_id uuid NOT NULL REFERENCES public.montaje_grupos_compases(id) ON DELETE CASCADE,
  montaje_compas_id uuid NOT NULL REFERENCES public.montaje_compases(id) ON DELETE CASCADE,
  PRIMARY KEY (grupo_id, montaje_compas_id)
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['montaje_pasajes','montaje_pasaje_compases','montaje_grupos_compases','montaje_grupo_compases'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY repertoire_passages_acm ON public.%I FOR ALL TO authenticated USING (get_user_department() = ''ACM'' OR get_user_role() = ANY (ARRAY[''admin'',''superadmin'',''direccion'',''coordinacion_academica''])) WITH CHECK (get_user_department() = ''ACM'' OR get_user_role() = ANY (ARRAY[''admin'',''superadmin'',''direccion'',''coordinacion_academica'']))', t);
  END LOOP;
END $$;

COMMENT ON TABLE public.montaje_pasajes IS 'Pasajes pedagógicos creados por docentes; separados de las marcas de ensayo de la partitura.';
COMMENT ON TABLE public.montaje_grupos_compases IS 'Agrupaciones de compases vinculados, siempre reversibles y no equivalentes a una marca de ensayo.';
