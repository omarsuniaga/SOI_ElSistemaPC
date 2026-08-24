-- Reconciled replacement for the unregistered legacy 010_node_resources_schema.sql.
-- Dependencies nodes and profiles were verified in the linked database on 2026-08-19.

CREATE TABLE IF NOT EXISTS public.node_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id uuid NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN ('video', 'pdf', 'exercise_text', 'link')),
  title text NOT NULL,
  url text,
  content text,
  order_index integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.node_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read for authenticated users" ON public.node_resources;
CREATE POLICY "Public read for authenticated users"
  ON public.node_resources FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Full access for admins" ON public.node_resources;
CREATE POLICY "Full access for admins"
  ON public.node_resources FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.rol = 'admin'
  ));

CREATE INDEX IF NOT EXISTS idx_node_resources_node_id ON public.node_resources(node_id);
CREATE INDEX IF NOT EXISTS idx_node_resources_type ON public.node_resources(resource_type);
