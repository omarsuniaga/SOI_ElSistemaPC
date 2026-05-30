-- Create rutas_contenido table
CREATE TABLE rutas_contenido (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrumento       TEXT NOT NULL,
  nivel             TEXT NOT NULL,
  nombre            TEXT NOT NULL,
  tipo              TEXT NOT NULL CHECK (tipo IN ('soi-estandar', 'maestro-variante')),
  estado            TEXT NOT NULL CHECK (estado IN ('activa', 'pendiente', 'aprobada', 'rechazada')),
  descripcion       TEXT,
  ruta_base_id      UUID REFERENCES rutas_contenido(id) ON DELETE SET NULL,
  duracion_semanas  INT NOT NULL DEFAULT 40,
  creada_por        UUID REFERENCES maestros(id) ON DELETE SET NULL,
  aprobada_por      UUID REFERENCES maestros(id) ON DELETE SET NULL,
  fecha_aprobacion  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (instrumento, nivel, nombre),
  CHECK (tipo = 'soi-estandar' OR ruta_base_id IS NOT NULL)
);

CREATE TABLE ruta_contenido_objetivos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruta_id           UUID NOT NULL REFERENCES rutas_contenido(id) ON DELETE CASCADE,
  objetivo_id       UUID REFERENCES curriculo_objetivos(id) ON DELETE SET NULL,
  descripcion       TEXT NOT NULL,
  semana_inicio     INT NOT NULL CHECK (semana_inicio > 0),
  semana_fin        INT NOT NULL CHECK (semana_fin >= semana_inicio),
  orden             INT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (ruta_id, orden),
  UNIQUE (ruta_id, objetivo_id)
);

-- Add ruta_id to clases
ALTER TABLE clases ADD COLUMN ruta_id UUID REFERENCES rutas_contenido(id) ON DELETE SET NULL;
CREATE INDEX idx_clases_ruta_id ON clases(ruta_id);

-- Add index for common queries
CREATE INDEX idx_rutas_contenido_instrumento_nivel_estado ON rutas_contenido(instrumento, nivel, estado);
