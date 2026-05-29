-- Migration: Create postulantes table (Google Form pre-registration data)
-- This table stores student pre-registration data synced from the public Google Sheet.
-- The sync is done server-side via Edge Function, never from the client.
-- RLS: only authenticated maestros can read; only service_role (Edge Function) can write.

CREATE TABLE IF NOT EXISTS public.postulantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Alumno
    nombre_completo      TEXT NOT NULL,
    fecha_nacimiento     DATE,
    telefono_alumno      TEXT,
    correo               TEXT,
    nacionalidad         TEXT,
    sector_calle_numero  TEXT,

    -- Madre
    madre_nombre         TEXT,
    madre_tlf_whatsapp   TEXT,

    -- Padre
    padre_nombre         TEXT,
    padre_tlf_whatsapp   TEXT,

    -- Representante legal
    representante_parentesco TEXT,

    -- Compromisos
    acepta_pago_600      BOOLEAN NOT NULL DEFAULT FALSE,
    autoriza_fotos_redes BOOLEAN NOT NULL DEFAULT FALSE,

    -- Additional screening fields from the form
    religion_limita         BOOLEAN NOT NULL DEFAULT FALSE,
    disponibilidad_tiempo   TEXT,
    tiene_transporte        BOOLEAN NOT NULL DEFAULT FALSE,
    representantes_apoyan   BOOLEAN NOT NULL DEFAULT FALSE,
    copia_cedula            BOOLEAN NOT NULL DEFAULT FALSE,

    -- Metadata
    sincronizado_en     TIMESTAMPTZ DEFAULT NOW(),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for the search use case (name + phone)
CREATE INDEX IF NOT EXISTS idx_postulantes_nombre_completo
    ON public.postulantes USING gin (nombre_completo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_postulantes_telefono_alumno
    ON public.postulantes (telefono_alumno);
CREATE INDEX IF NOT EXISTS idx_postulantes_madre_tlf
    ON public.postulantes (madre_tlf_whatsapp);
CREATE INDEX IF NOT EXISTS idx_postulantes_padre_tlf
    ON public.postulantes (padre_tlf_whatsapp);

-- Enable RLS
ALTER TABLE public.postulantes ENABLE ROW LEVEL SECURITY;

-- Maestros autenticados pueden LEER postulantes (para buscar al inscribir)
CREATE POLICY postulantes_select_authenticated ON public.postulantes
    FOR SELECT
    TO authenticated
    USING (true);

-- Solo el service_role (Edge Function) puede INSERT / UPDATE / DELETE
CREATE POLICY postulantes_insert_service_role ON public.postulantes
    FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY postulantes_update_service_role ON public.postulantes
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY postulantes_delete_service_role ON public.postulantes
    FOR DELETE
    TO service_role
    USING (true);
