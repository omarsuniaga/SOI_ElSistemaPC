-- Migración 010: Esquema para Recursos de Nodos

CREATE TABLE IF NOT EXISTS public.node_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'pdf', 'exercise_text', 'link')),
    title TEXT NOT NULL,
    url TEXT,
    content TEXT, -- Para 'exercise_text' (Markdown)
    order_index INT NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.node_resources ENABLE ROW LEVEL SECURITY;

-- Lectura para todos los autenticados (profesores y alumnos necesitan ver los recursos)
CREATE POLICY "Public read for authenticated users" ON public.node_resources
    FOR SELECT TO authenticated USING (true);

-- Gestión total para administradores
CREATE POLICY "Full access for admins" ON public.node_resources
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.rol = 'admin'
        )
    );

-- Índices
CREATE INDEX IF NOT EXISTS idx_node_resources_node_id ON public.node_resources(node_id);
CREATE INDEX IF NOT EXISTS idx_node_resources_type ON public.node_resources(resource_type);
