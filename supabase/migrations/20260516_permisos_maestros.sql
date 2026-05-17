-- ============================================================================
-- Migration: permisos_maestros
-- Descripción: Tabla de permisos para maestros (registrar alumnos, inscribir clases)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.permisos_maestros (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  maestro_id uuid UNIQUE NOT NULL REFERENCES public.maestros(id) ON DELETE CASCADE,
  puede_registrar_alumnos boolean DEFAULT false,
  puede_inscribir_clases boolean DEFAULT false,
  concedido_por uuid REFERENCES public.maestros(id),
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

-- Trigger para actualizar actualizado_en automáticamente
CREATE OR REPLACE FUNCTION public.actualizar_timestamp_permisos()
RETURNS trigger AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_actualizado_en_permisos
  BEFORE UPDATE ON public.permisos_maestros
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_timestamp_permisos();

-- Índice para búsqueda por maestro
CREATE INDEX IF NOT EXISTS idx_permisos_maestros_maestro_id ON public.permisos_maestros(maestro_id);

-- Políticas de seguridad RLS
ALTER TABLE public.permisos_maestros ENABLE ROW LEVEL SECURITY;

-- Solo administradores pueden insertar/actualizar permisos
CREATE POLICY "Solo admin puede insertar permisos"
  ON public.permisos_maestros
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.maestros
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Solo admin puede actualizar permisos"
  ON public.permisos_maestros
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.maestros
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Todos pueden leer permisos"
  ON public.permisos_maestros
  FOR SELECT
  TO authenticated
  USING (true);
