-- ══════════════════════════════════════════════════════════════════
-- Etapa 5 — Seguimiento Institucional
-- ══════════════════════════════════════════════════════════════════

-- 1. seguimiento_reglas
CREATE TABLE IF NOT EXISTS public.seguimiento_reglas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  tipo        TEXT NOT NULL,
  descripcion TEXT,
  config      JSONB NOT NULL DEFAULT '{}',
  activo      BOOLEAN DEFAULT true,
  prioridad   INTEGER DEFAULT 1,
  created_by  UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. student_cases
CREATE TABLE IF NOT EXISTS public.student_cases (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id            UUID REFERENCES public.alumnos(id) ON DELETE SET NULL,
  alumno_nombre        TEXT,
  tipo                 TEXT NOT NULL,
  titulo               TEXT NOT NULL,
  descripcion          TEXT,
  nivel_riesgo         TEXT NOT NULL DEFAULT 'bajo'
                       CHECK (nivel_riesgo IN ('bajo','medio','alto','critico')),
  estado               TEXT NOT NULL DEFAULT 'abierto'
                       CHECK (estado IN ('abierto','en_seguimiento','resuelto','escalado','archivado')),
  origen               TEXT NOT NULL DEFAULT 'manual'
                       CHECK (origen IN ('automatico','manual','observacion_maestro','asistencia','justificacion','admin')),
  responsable_id       UUID,
  fecha_apertura       DATE DEFAULT CURRENT_DATE,
  fecha_cierre         DATE,
  resumen_actual       TEXT,
  proxima_accion       TEXT,
  proxima_accion_fecha DATE,
  ultimo_contacto_en   TIMESTAMPTZ,
  created_by           UUID,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 3. student_case_alerts
CREATE TABLE IF NOT EXISTS public.student_case_alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id    UUID REFERENCES public.alumnos(id) ON DELETE SET NULL,
  alumno_nombre TEXT,
  case_id      UUID REFERENCES public.student_cases(id) ON DELETE SET NULL,
  tipo         TEXT NOT NULL,
  nivel_riesgo TEXT NOT NULL
               CHECK (nivel_riesgo IN ('bajo','medio','alto','critico')),
  titulo       TEXT NOT NULL,
  descripcion  TEXT,
  evidencia    JSONB DEFAULT '{}',
  estado       TEXT NOT NULL DEFAULT 'pendiente'
               CHECK (estado IN ('pendiente','revisada','convertida_en_caso','descartada','archivada')),
  detectada_en TIMESTAMPTZ DEFAULT NOW(),
  revisada_por UUID,
  revisada_en  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. student_case_events
CREATE TABLE IF NOT EXISTS public.student_case_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     UUID NOT NULL REFERENCES public.student_cases(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL,
  titulo      TEXT NOT NULL,
  descripcion TEXT,
  metadata    JSONB DEFAULT '{}',
  actor_id    UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. student_case_actions
CREATE TABLE IF NOT EXISTS public.student_case_actions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id              UUID NOT NULL REFERENCES public.student_cases(id) ON DELETE CASCADE,
  alumno_id            UUID REFERENCES public.alumnos(id) ON DELETE SET NULL,
  tipo                 TEXT NOT NULL,
  titulo               TEXT NOT NULL,
  descripcion          TEXT,
  resultado            TEXT,
  fecha_accion         TIMESTAMPTZ DEFAULT NOW(),
  proxima_accion       TEXT,
  proxima_accion_fecha DATE,
  documento_id         UUID,
  registrado_por       UUID,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RLS
ALTER TABLE public.seguimiento_reglas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_cases         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_case_alerts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_case_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_case_actions  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_seguimiento_reglas_all"   ON public.seguimiento_reglas   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "rls_student_cases_all"        ON public.student_cases        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "rls_student_case_alerts_all"  ON public.student_case_alerts  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "rls_student_case_events_all"  ON public.student_case_events  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "rls_student_case_actions_all" ON public.student_case_actions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Default rules
INSERT INTO public.seguimiento_reglas (nombre, tipo, descripcion, config, activo, prioridad)
SELECT * FROM (VALUES
  ('Asistencia irregular mensual', 'asistencia_irregular',
   'Detecta alumnos con ausencias injustificadas dentro del mes.',
   '{"periodo":"mensual","leve":2,"medio":3,"alto":4,"critico":5,"contar_justificadas":false}'::jsonb,
   true, 1),
  ('Tardanzas recurrentes', 'tardanzas_recurrentes',
   'Detecta alumnos con múltiples tardanzas dentro del mes.',
   '{"periodo":"mensual","leve":3,"medio":5,"alto":7,"critico":10}'::jsonb,
   true, 2),
  ('Observaciones marcadas para seguimiento', 'observacion_requiere_seguimiento',
   'Detecta observaciones de maestros que requieren seguimiento institucional.',
   '{"prioridades":["alta","urgente"],"solo_pendientes":true}'::jsonb,
   true, 3),
  ('Justificaciones pendientes de revisión', 'justificaciones_pendientes',
   'Detecta justificaciones sin revisar o acumuladas.',
   '{"max_pendientes":2,"nivel":"medio"}'::jsonb,
   true, 4)
) AS t(nombre, tipo, descripcion, config, activo, prioridad)
WHERE NOT EXISTS (SELECT 1 FROM public.seguimiento_reglas WHERE tipo = t.tipo);

-- 8. Extra document templates for risk→template mapping
INSERT INTO public.document_templates (nombre, tipo, descripcion, contenido, variables, estado)
SELECT * FROM (VALUES
  ('Carta Institucional',
   'carta_institucional',
   'Comunicación formal institucional para casos de seguimiento',
   E'Punta Cana, {fecha_actual}\n\nEstimado/a {nombre_representante}:\n\nDesde {nombre_institucion} nos dirigimos a usted en calidad de representante del/la alumno/a {nombre_alumno}, con motivo de un seguimiento institucional iniciado por nuestro equipo de coordinación pedagógica.\n\n{motivo_permiso}\n\nLe solicitamos respetuosamente comunicarse con nuestra coordinación para dialogar sobre la situación y acordar los próximos pasos.\n\nAtentamente,\n\n{responsable_institucional}\n{nombre_institucion}',
   ARRAY['{fecha_actual}','{nombre_representante}','{nombre_institucion}','{nombre_alumno}','{motivo_permiso}','{responsable_institucional}'],
   'activa'),
  ('Solicitud de Reunión con Representante',
   'solicitud_reunion_representante',
   'Convocatoria formal a reunión con coordinación',
   E'Punta Cana, {fecha_actual}\n\nEstimado/a {nombre_representante}:\n\n{nombre_institucion} le solicita formalmente una reunión con la coordinación pedagógica para tratar asuntos relacionados con el/la alumno/a {nombre_alumno}.\n\nMotivo: {motivo_permiso}\n\nPor favor, comuníquese con nosotros para acordar fecha y hora a la brevedad posible.\n\nAtentamente,\n\n{responsable_institucional}\n{nombre_institucion}',
   ARRAY['{fecha_actual}','{nombre_representante}','{nombre_institucion}','{nombre_alumno}','{motivo_permiso}','{responsable_institucional}'],
   'activa'),
  ('Llamado Formal de Directiva',
   'llamado_formal_directiva',
   'Notificación formal de la directiva para casos críticos',
   E'Punta Cana, {fecha_actual}\n\nEstimado/a {nombre_representante}:\n\nPor decisión de la directiva de {nombre_institucion}, se le notifica formalmente que el caso del/la alumno/a {nombre_alumno} requiere su atención inmediata.\n\n{motivo_permiso}\n\nSe le convoca a presentarse en nuestras instalaciones a la mayor brevedad para tratar este asunto.\n\nAtentamente,\n\n{responsable_institucional}\nDirectiva — {nombre_institucion}',
   ARRAY['{fecha_actual}','{nombre_representante}','{nombre_institucion}','{nombre_alumno}','{motivo_permiso}','{responsable_institucional}'],
   'activa'),
  ('Solicitud de Devolución de Instrumento',
   'solicitud_devolucion_instrumento',
   'Solicitud formal de devolución de instrumento institucional',
   E'Punta Cana, {fecha_actual}\n\nEstimado/a {nombre_representante}:\n\n{nombre_institucion} le notifica formalmente la solicitud de devolución del instrumento institucional asignado al/la alumno/a {nombre_alumno}.\n\nMotivo: {motivo_permiso}\n\nPor favor, acudir a nuestras instalaciones con el instrumento en un plazo máximo de 7 días hábiles a partir de la fecha de esta comunicación.\n\nAtentamente,\n\n{responsable_institucional}\n{nombre_institucion}',
   ARRAY['{fecha_actual}','{nombre_representante}','{nombre_institucion}','{nombre_alumno}','{motivo_permiso}','{responsable_institucional}'],
   'activa'),
  ('Acta de Compromiso',
   'acta_compromiso',
   'Acta firmada de compromiso entre institución y representante',
   E'Punta Cana, {fecha_actual}\n\nACTA DE COMPROMISO\n\nEn el día de la fecha, comparecen ante {nombre_institucion}:\n\nEl/la representante: {nombre_representante}\nCédula: {cedula_representante}\nEn representación del/la alumno/a: {nombre_alumno}\n\nEn presencia de: {responsable_institucional}\n\nMOTIVO: {motivo_permiso}\n\nCOMPROMISOS ASUMIDOS:\n\n{observaciones_actividad}\n\nAmbas partes manifiestan su compromiso de cumplir lo aquí acordado en beneficio del/la alumno/a.\n\nFirma del representante: ___________________________\n\nFirma institucional: ___________________________\n\nFecha: {fecha_actual}',
   ARRAY['{fecha_actual}','{nombre_institucion}','{nombre_representante}','{cedula_representante}','{nombre_alumno}','{responsable_institucional}','{motivo_permiso}','{observaciones_actividad}'],
   'activa')
) AS t(nombre, tipo, descripcion, contenido, variables, estado)
WHERE NOT EXISTS (SELECT 1 FROM public.document_templates WHERE tipo = t.tipo);
