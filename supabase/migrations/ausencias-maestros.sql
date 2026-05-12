-- Tabla para gestionar las ausencias de los maestros
-- Generado por Antigravity - Senior Architect
CREATE TABLE IF NOT EXISTS public.ausencias_maestros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maestro_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo_ausencia TEXT NOT NULL, 
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    motivo TEXT,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada', 'cancelada')),
    urgencia TEXT DEFAULT 'media' CHECK (urgencia IN ('baja', 'media', 'alta', 'critica')),
    notificar_director BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para optimizar consultas por maestro
CREATE INDEX IF NOT EXISTS idx_ausencias_maestro_id ON public.ausencias_maestros(maestro_id);

-- Habilitar RLS
ALTER TABLE public.ausencias_maestros ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Maestros pueden ver sus propias ausencias" 
ON public.ausencias_maestros FOR SELECT 
USING (auth.uid() = maestro_id);

CREATE POLICY "Maestros pueden crear sus propias solicitudes" 
ON public.ausencias_maestros FOR INSERT 
WITH CHECK (auth.uid() = maestro_id);

CREATE POLICY "Maestros pueden cancelar sus propias solicitudes" 
ON public.ausencias_maestros FOR UPDATE 
USING (auth.uid() = maestro_id);
