-- ====================================================================
-- MIGRACIÓN SUPABASE: 20260714203000_acm_rubrica_evaluacion.sql
-- TABLA: audiciones
-- PROPÓSITO: Registro estructurado de audiciones de nivel y diagnóstico (ACM-RUB-001)
-- ====================================================================

-- 1. Crear tipos ENUM si no existen (Supabase / Postgres)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resultado_audicion') THEN
        CREATE TYPE resultado_audicion AS ENUM ('PROMOVIDO', 'PERMANECE', 'NO_PROMOVIDO');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nivel_estudiante') THEN
        CREATE TYPE nivel_estudiante AS ENUM ('Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5');
    END IF;
END$$;

-- 2. Crear tabla principal
CREATE TABLE IF NOT EXISTS public.audiciones (
    id_auditoria      SERIAL PRIMARY KEY,
    fecha_auditoria   DATE NOT NULL DEFAULT CURRENT_DATE,
    alumno_id         UUID REFERENCES public.alumnos(id) ON DELETE SET NULL,
    nombre_alumno     VARCHAR(100) NOT NULL,
    instrumento       VARCHAR(50) NOT NULL,
    evaluador         VARCHAR(100) DEFAULT 'Omar Suniaga',
    
    -- Calificaciones cuantitativas (escala 1 a 5)
    calif_postura     INT NOT NULL CHECK (calif_postura BETWEEN 1 AND 5),
    nota_postura      TEXT,
    
    calif_afinacion   INT NOT NULL CHECK (calif_afinacion BETWEEN 1 AND 5),
    nota_afinacion    TEXT,
    
    calif_ritmo       INT NOT NULL CHECK (calif_ritmo BETWEEN 1 AND 5),
    nota_ritmo        TEXT,
    
    calif_musicalidad INT NOT NULL CHECK (calif_musicalidad BETWEEN 1 AND 5),
    nota_musicalidad  TEXT,
    
    -- Cálculo automático (promedio ponderado)
    -- Fórmula: (postura * 0.3) + (afinacion * 0.3) + (ritmo * 0.2) + (musicalidad * 0.2)
    promedio_ponderado NUMERIC(3, 2) GENERATED ALWAYS AS (
        (calif_postura * 0.30) + (calif_afinacion * 0.30) + (calif_ritmo * 0.20) + (calif_musicalidad * 0.20)
    ) STORED,
    
    -- Dictamen final
    resultado         resultado_audicion NOT NULL,
    nivel_asignado    nivel_estudiante,
    profesor_asignado VARCHAR(100),
    proxima_auditoria DATE,
    
    -- Validación y control de auditoría (Gate 9)
    validado_por_omar BOOLEAN DEFAULT FALSE,
    fecha_validacion  TIMESTAMP WITH TIME ZONE,
    
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_audiciones_alumno ON public.audiciones(alumno_id);
CREATE INDEX IF NOT EXISTS idx_audiciones_fecha ON public.audiciones(fecha_auditoria);
CREATE INDEX IF NOT EXISTS idx_audiciones_resultado ON public.audiciones(resultado);

-- 4. Habilitar RLS (Row Level Security) para seguridad de datos
ALTER TABLE public.audiciones ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de acceso (Políticas de seguridad)
CREATE POLICY "Permitir lectura para usuarios autenticados" 
    ON public.audiciones FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Permitir escritura solo a jurado y administradores" 
    ON public.audiciones FOR INSERT 
    TO authenticated 
    WITH CHECK (
        auth.role() = 'service_role'
        OR (auth.jwt() ->> 'role') IN ('jurado', 'admin')
        -- Fallback para tokens de prueba
        OR (auth.jwt() ->> 'email') = 'jurado1@test.com'
    );

-- 6. Trigger y Comentarios
COMMENT ON TABLE public.audiciones IS 'Registro centralizado de evaluaciones de audiciones de nivel y diagnóstico según el canon ACM-RUB-001 V8.';
