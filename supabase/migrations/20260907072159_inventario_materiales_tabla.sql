CREATE TABLE IF NOT EXISTS public.inventario_materiales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item text NOT NULL,
  categoria text,
  familia_instrumento text,
  marca text,
  modelo text,
  cantidad numeric,
  unidad text NOT NULL DEFAULT 'unidad',
  descripcion text,
  ubicacion text,
  activo boolean NOT NULL DEFAULT true,
  fuente_importacion text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inventario_materiales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS materiales_authenticated_select ON public.inventario_materiales;
CREATE POLICY materiales_authenticated_select ON public.inventario_materiales FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS materiales_admin_insert ON public.inventario_materiales;
CREATE POLICY materiales_admin_insert ON public.inventario_materiales FOR INSERT TO authenticated WITH CHECK (es_admin());
DROP POLICY IF EXISTS materiales_admin_update ON public.inventario_materiales;
CREATE POLICY materiales_admin_update ON public.inventario_materiales FOR UPDATE TO authenticated USING (es_admin());
DROP POLICY IF EXISTS materiales_admin_delete ON public.inventario_materiales;
CREATE POLICY materiales_admin_delete ON public.inventario_materiales FOR DELETE TO authenticated USING (es_admin());

GRANT SELECT ON public.inventario_materiales TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.inventario_materiales TO authenticated;