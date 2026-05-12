-- Migration: 20260512_create_justificaciones_table.sql
-- Tabla para almacenar justificaciones de ausencias de alumnos

CREATE TABLE IF NOT EXISTS public.justificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id UUID REFERENCES public.sesiones_clase(id) ON DELETE CASCADE,
  alumno_id UUID NOT NULL,
  clase_id UUID NOT NULL,
  fecha DATE NOT NULL,
  motivo TEXT NOT NULL,
  evidencia_url TEXT,
  evidencia_base64 TEXT,
  creado_por UUID REFERENCES public.maestros(id),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  revisado_por UUID REFERENCES public.maestros(id),
  fecha_revision TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (sesion_id, alumno_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_justificaciones_sesion ON public.justificaciones(sesion_id);
CREATE INDEX IF NOT EXISTS idx_justificaciones_alumno ON public.justificaciones(alumno_id);
CREATE INDEX IF NOT EXISTS idx_justificaciones_clase ON public.justificaciones(clase_id);
CREATE INDEX IF NOT EXISTS idx_justificaciones_fecha ON public.justificaciones(fecha);

-- RLS
ALTER TABLE public.justificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas para maestros: solo pueden ver/editar sus propias justificaciones
CREATE POLICY teacher_manage_justificaciones ON public.justificaciones
FOR ALL TO authenticated
USING (
  creado_por IN (
    SELECT id FROM public.maestros WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  creado_por IN (
    SELECT id FROM public.maestros WHERE user_id = auth.uid()
  )
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_justificaciones_updated_at ON public.justificaciones;
CREATE TRIGGER trigger_justificaciones_updated_at
  BEFORE UPDATE ON public.justificaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentarios
COMMENT ON TABLE public.justificaciones IS 'Registro de justificaciones de inasistencias de alumnos';
COMMENT ON COLUMN public.justificaciones.motivo IS 'Texto explicando el motivo de la ausencia';
COMMENT ON COLUMN public.justificaciones.evidencia_url IS 'URL de archivo de evidencia (futuro, para storage)';
COMMENT ON COLUMN public.justificaciones.evidencia_base64 IS 'Imagen en base64 como evidencia opcional';
COMMENT ON COLUMN public.justificaciones.estado IS 'Estado de la justificación: pendiente/aprobado/rechazado';