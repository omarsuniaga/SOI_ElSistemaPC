-- curriculos: one per instrumento + nivel
CREATE TABLE IF NOT EXISTS curriculos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instrumento text NOT NULL,
  nivel       text NOT NULL,
  descripcion text,
  activo      boolean DEFAULT true,
  created_by  uuid REFERENCES maestros(id),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (instrumento, nivel)
);

-- pillars inside a curriculum
CREATE TABLE IF NOT EXISTS curriculo_pilares (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculo_id uuid REFERENCES curriculos(id) ON DELETE CASCADE,
  nombre       text NOT NULL,
  orden        int  NOT NULL DEFAULT 0
);

-- objectives inside a pillar
CREATE TABLE IF NOT EXISTS curriculo_objetivos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pilar_id    uuid REFERENCES curriculo_pilares(id) ON DELETE CASCADE,
  descripcion text NOT NULL,
  orden       int  NOT NULL DEFAULT 0
);

-- per-student, per-objective coverage log
CREATE TABLE IF NOT EXISTS cobertura_alumno_objetivo (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id   uuid REFERENCES alumnos(id) ON DELETE CASCADE,
  objetivo_id uuid REFERENCES curriculo_objetivos(id) ON DELETE CASCADE,
  plan_id     uuid REFERENCES planificaciones(id) ON DELETE SET NULL,
  maestro_id  uuid REFERENCES maestros(id),
  fecha       date NOT NULL DEFAULT CURRENT_DATE,
  confirmado  boolean DEFAULT false,
  nivel       text DEFAULT 'en_proceso',
  created_at  timestamptz DEFAULT now(),
  UNIQUE (alumno_id, objetivo_id)
);

-- RLS
ALTER TABLE curriculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculo_pilares ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculo_objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobertura_alumno_objetivo ENABLE ROW LEVEL SECURITY;

-- curriculos: everyone reads, only admin writes
CREATE POLICY curriculos_select ON curriculos FOR SELECT TO authenticated USING (true);
CREATE POLICY curriculos_insert ON curriculos FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY curriculos_update ON curriculos FOR UPDATE TO authenticated USING (es_admin());
CREATE POLICY curriculos_delete ON curriculos FOR DELETE TO authenticated USING (es_admin());

-- pilares: inherit same
CREATE POLICY pilares_select ON curriculo_pilares FOR SELECT TO authenticated USING (true);
CREATE POLICY pilares_insert ON curriculo_pilares FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY pilares_update ON curriculo_pilares FOR UPDATE TO authenticated USING (es_admin());
CREATE POLICY pilares_delete ON curriculo_pilares FOR DELETE TO authenticated USING (es_admin());

-- objetivos: inherit same
CREATE POLICY objetivos_select ON curriculo_objetivos FOR SELECT TO authenticated USING (true);
CREATE POLICY objetivos_insert ON curriculo_objetivos FOR INSERT TO authenticated WITH CHECK (es_admin());
CREATE POLICY objetivos_update ON curriculo_objetivos FOR UPDATE TO authenticated USING (es_admin());
CREATE POLICY objetivos_delete ON curriculo_objetivos FOR DELETE TO authenticated USING (es_admin());

-- cobertura: maestro owns their rows; admin can read all
CREATE POLICY cobertura_select_maestro ON cobertura_alumno_objetivo FOR SELECT TO authenticated
  USING (maestro_id = maestro_actual() OR es_admin());
CREATE POLICY cobertura_insert ON cobertura_alumno_objetivo FOR INSERT TO authenticated
  WITH CHECK (maestro_id = maestro_actual());
CREATE POLICY cobertura_update ON cobertura_alumno_objetivo FOR UPDATE TO authenticated
  USING (maestro_id = maestro_actual());
