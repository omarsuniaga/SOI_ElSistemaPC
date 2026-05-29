-- Migration: Add wizard enrollment fields to public.alumnos
-- PR 1 of 3 — wizard-inscripcion-alumnos
-- All new columns are nullable or have defaults so existing rows remain valid.

ALTER TABLE public.alumnos

  -- Step 1: Datos Personales (extras)
  ADD COLUMN IF NOT EXISTS sabe_leer               BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sabe_escribir           BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS nacionalidad            TEXT,
  ADD COLUMN IF NOT EXISTS tiene_pasaporte         BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS como_se_entero          TEXT,
  ADD COLUMN IF NOT EXISTS ubicacion_maps_url      TEXT,

  -- Step 2: Perfil Musical
  ADD COLUMN IF NOT EXISTS tiene_conocimientos_musicales BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS instrumento_previo            TEXT,
  ADD COLUMN IF NOT EXISTS nivel_lectura_musical         TEXT
      CHECK (nivel_lectura_musical IS NULL OR nivel_lectura_musical IN ('basico', 'intermedio', 'avanzado')),
  ADD COLUMN IF NOT EXISTS interes_musical               TEXT
      CHECK (interes_musical IS NULL OR interes_musical IN ('cantar', 'instrumento', 'ambas')),
  ADD COLUMN IF NOT EXISTS instrumento_interes           TEXT,
  ADD COLUMN IF NOT EXISTS iniciacion_musical_requerida  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS fecha_ingreso_iniciacion      DATE,
  ADD COLUMN IF NOT EXISTS fecha_elegible_audicion       DATE,
  ADD COLUMN IF NOT EXISTS fecha_fin_iniciacion          DATE,

  -- Step 3: Salud y Conducta
  ADD COLUMN IF NOT EXISTS tiene_alergias                        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS alergias_descripcion                  TEXT,
  ADD COLUMN IF NOT EXISTS tiene_condicion_transmisible          BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS condicion_transmisible_descripcion    TEXT,
  ADD COLUMN IF NOT EXISTS tiene_alergia_medicamento             BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS alergia_medicamento_descripcion       TEXT,
  ADD COLUMN IF NOT EXISTS impedimento_social                    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS problemas_conducta                    TEXT NOT NULL DEFAULT 'no'
      CHECK (problemas_conducta IN ('no', 'pocas_veces', 'si', 'violento')),

  -- Step 4: Datos Escolares
  ADD COLUMN IF NOT EXISTS centro_estudios   TEXT,
  ADD COLUMN IF NOT EXISTS grado_nivel       TEXT,
  ADD COLUMN IF NOT EXISTS padres_en_vida    TEXT
      CHECK (padres_en_vida IS NULL OR padres_en_vida IN ('ambos', 'solo_madre', 'solo_padre', 'ninguno')),

  -- Step 5: Representante y Compromisos
  ADD COLUMN IF NOT EXISTS representante_parentesco     TEXT,
  ADD COLUMN IF NOT EXISTS representante_cedula         TEXT,
  ADD COLUMN IF NOT EXISTS acepta_beca_4500             BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS fecha_aceptacion_beca        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS acepta_pago_600              BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS fecha_aceptacion_pago        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fecha_aceptacion_compromisos TIMESTAMPTZ;

-- Index for filtering students currently in the iniciacion period
CREATE INDEX IF NOT EXISTS idx_alumnos_iniciacion_requerida
  ON public.alumnos (iniciacion_musical_requerida)
  WHERE iniciacion_musical_requerida = TRUE;
