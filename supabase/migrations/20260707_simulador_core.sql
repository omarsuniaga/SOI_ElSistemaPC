-- ============================================================
-- Migration: Portal Simulador - Fundaciones backend (Slice 1)
-- Timestamp: 20260707_simulador_core
-- Project: sistema-academico-pwa
-- Description: Tablas sandbox `sim_*` que reproducen el patrón Hermes
--   (calendario_institucional -> tareas_institucionales) de forma AISLADA,
--   sin tocar ninguna tabla de producción. Incluye RLS, seeds de un año
--   escolar simulado y datos ficticios de simulación (postulantes, alumnos,
--   maestros, representantes con estado de pago moroso/solvente).
-- Date: 2026-07-07
-- Design ref: sdd/portal-simulador/design (obs #2723)
-- Spec ref: sdd/portal-simulador/spec (obs #2722)
-- ============================================================

-- ------------------------------------------------------------
-- 0. Reutilización de enums existentes (definidos en 20260622_hermes_core.sql)
--    event_categoria: 'concierto','ensayo','reunion','patrocinio','pago','corte',
--                      'inscripcion','auditoria','otro'
--    soi_departamento: 'DIR','ACM','ADM','FIN','LOG','COM','TECNICO'
--    No se crean enums nuevos aquí: sim_calendario y sim_tareas reutilizan los
--    mismos tipos que sus tablas espejo de producción, tal como especifica el
--    diseño ("reutiliza enums event_categoria/soi_departamento existentes").
-- ------------------------------------------------------------

-- Enums propios del simulador (no existen en producción)
DO $$ BEGIN
  CREATE TYPE sim_canal AS ENUM ('whatsapp', 'email');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sim_outbox_estado AS ENUM ('pendiente', 'enviado', 'fallido');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sim_run_estado AS ENUM ('creado', 'corriendo', 'pausado', 'finalizado', 'error');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 1. sim_runs — una corrida de simulación
--    velocidad = segundos reales por día simulado (default 10; ver Open
--    Question del design, resuelta aquí a favor de la opción recomendada:
--    "segundos reales por día simulado", más intuitiva para el panel).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sim_runs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre           text NOT NULL DEFAULT 'Simulación sin nombre',
  estado           sim_run_estado NOT NULL DEFAULT 'creado',
  velocidad        integer NOT NULL DEFAULT 10 CHECK (velocidad > 0), -- segundos reales por día simulado
  fecha_inicio_virtual timestamptz NOT NULL,
  fecha_fin_virtual     timestamptz,
  fecha_actual_virtual  timestamptz,
  creado_por       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata         jsonb DEFAULT '{}',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

COMMENT ON COLUMN public.sim_runs.velocidad IS 'Segundos reales que dura 1 día simulado en el reloj virtual del frontend.';

-- ------------------------------------------------------------
-- 2. sim_calendario — espejo de calendario_institucional + run_id
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sim_calendario (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id         uuid NOT NULL REFERENCES public.sim_runs(id) ON DELETE CASCADE,
  titulo         text NOT NULL,
  descripcion    text,
  categoria      event_categoria NOT NULL DEFAULT 'otro',
  fecha_inicio   timestamptz NOT NULL, -- fecha/hora simulada del evento
  fecha_fin      timestamptz NOT NULL,
  ubicacion      text,
  departamento_responsable soi_departamento NOT NULL DEFAULT 'DIR',
  metadata       jsonb DEFAULT '{}',
  estado         text NOT NULL DEFAULT 'programado' CHECK (estado IN ('programado', 'en_curso', 'completado', 'cancelado')),
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sim_calendario_run_fecha ON public.sim_calendario (run_id, fecha_inicio);

COMMENT ON TABLE public.sim_calendario IS 'Espejo aislado de calendario_institucional para el sandbox del simulador. Nunca se referencia desde triggers de producción.';

-- ------------------------------------------------------------
-- 3. sim_tareas — espejo de tareas_institucionales + run_id
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sim_tareas (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id         uuid NOT NULL REFERENCES public.sim_runs(id) ON DELETE CASCADE,
  event_id       uuid REFERENCES public.sim_calendario(id) ON DELETE CASCADE,
  titulo         text NOT NULL,
  descripcion    text,
  departamento   soi_departamento NOT NULL DEFAULT 'DIR',
  asignado_a     text,
  estado         tarea_institucional_estado NOT NULL DEFAULT 'pendiente',
  prioridad      tarea_institucional_prioridad NOT NULL DEFAULT 'media',
  fecha_vencimiento date,
  checklist      jsonb DEFAULT '[]',
  feedback       text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sim_tareas_run ON public.sim_tareas (run_id);

COMMENT ON TABLE public.sim_tareas IS 'Espejo aislado de tareas_institucionales para el sandbox del simulador.';

-- ------------------------------------------------------------
-- 4. sim_log — auditoría de cada acción de agente durante la simulación
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sim_log (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id         uuid NOT NULL REFERENCES public.sim_runs(id) ON DELETE CASCADE,
  fecha_simulada timestamptz NOT NULL,
  departamento   soi_departamento NOT NULL,
  agente         text NOT NULL, -- nombre/código del contrato AGT-* usado (o 'fallback_generico')
  accion         text NOT NULL, -- ej: 'tarea_creada', 'mensaje_encolado', 'error_parseo_llm'
  evento_id      uuid REFERENCES public.sim_calendario(id) ON DELETE SET NULL,
  payload        jsonb DEFAULT '{}',
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sim_log_run_created ON public.sim_log (run_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sim_log_run_fecha_simulada ON public.sim_log (run_id, fecha_simulada, id);

COMMENT ON TABLE public.sim_log IS 'Auditoría append-only de cada acción de agente. Base para la animación en tiempo real vía Supabase Realtime (ver RLS: SELECT abierto a authenticated).';
COMMENT ON INDEX public.idx_sim_log_run_fecha_simulada IS 'Soporta el requisito de orden determinista para eventos concurrentes: run_id + fecha_simulada + id (spec: simulador-motor / Procesamiento concurrente determinista).';

-- ------------------------------------------------------------
-- 5. sim_outbox — mensajes salientes simulados, SIEMPRE redirigidos a whitelist
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sim_outbox (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id                 uuid NOT NULL REFERENCES public.sim_runs(id) ON DELETE CASCADE,
  canal                  sim_canal NOT NULL,
  destinatario_original   text NOT NULL, -- lo que el LLM/agente generó (puede ser cualquier cosa)
  destinatario_redirigido text NOT NULL, -- SIEMPRE = whitelist de sim_config, nunca el original
  asunto                 text,
  mensaje                text NOT NULL,
  estado                 sim_outbox_estado NOT NULL DEFAULT 'pendiente',
  error_msg              text,
  created_at             timestamptz DEFAULT now(),
  procesado_at           timestamptz
);

CREATE INDEX IF NOT EXISTS idx_sim_outbox_run ON public.sim_outbox (run_id);

COMMENT ON COLUMN public.sim_outbox.destinatario_original IS 'Destinatario que el LLM/agente decidió (texto libre, NUNCA usado para el envío real).';
COMMENT ON COLUMN public.sim_outbox.destinatario_redirigido IS 'Destinatario real de envío. SIEMPRE igual a la whitelist de sim_config, forzado server-side (edge function), independientemente de lo que decida el LLM. Ver spec: simulador-salida-segura.';

-- ------------------------------------------------------------
-- 6. sim_config — singleton de configuración (whitelist de envío seguro)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sim_config (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canal          sim_canal NOT NULL UNIQUE,
  destino        text NOT NULL,
  proveedor_llm  text NOT NULL DEFAULT 'groq' CHECK (proveedor_llm IN ('groq', 'openrouter')),
  activo         boolean DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

COMMENT ON TABLE public.sim_config IS 'Whitelist server-side inviolable de destinos de envío (spec: simulador-salida-segura / Whitelist server-side inviolable). Un registro por canal.';

-- ------------------------------------------------------------
-- 7. Row Level Security
--    Convención vigente del proyecto (ver 20260626_sp1_rls_hermes_authenticated_only.sql):
--    NO se usa 'allow_all_*' abierto a anon; RLS es authenticated-only y anon
--    queda denegado por REVOKE. Excepción explícita: sim_log permite SELECT a
--    authenticated para que Supabase Realtime funcione en el frontend (riesgo
--    señalado en tasks — se resuelve aquí permitiendo solo lectura, nunca
--    escritura, a clientes autenticados; la escritura de sim_log queda
--    reservada al service_role de la edge function).
-- ------------------------------------------------------------
ALTER TABLE public.sim_runs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_calendario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_tareas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_log       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_outbox    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_config    ENABLE ROW LEVEL SECURITY;

-- sim_runs: los usuarios autenticados administran sus corridas (panel de control)
DROP POLICY IF EXISTS sim_runs_auth_all ON public.sim_runs;
CREATE POLICY sim_runs_auth_all ON public.sim_runs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
REVOKE ALL ON public.sim_runs FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sim_runs TO authenticated;

-- sim_calendario: lectura/escritura por authenticated (panel de control crea el
-- calendario simulado; la edge function usa service_role y bypassa RLS)
DROP POLICY IF EXISTS sim_calendario_auth_all ON public.sim_calendario;
CREATE POLICY sim_calendario_auth_all ON public.sim_calendario
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
REVOKE ALL ON public.sim_calendario FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sim_calendario TO authenticated;

-- sim_tareas: solo lectura para authenticated (se generan desde la edge
-- function con service_role); admin puede además escribir manualmente si
-- necesita ajustar el sandbox
DROP POLICY IF EXISTS sim_tareas_auth_read ON public.sim_tareas;
CREATE POLICY sim_tareas_auth_read ON public.sim_tareas
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS sim_tareas_admin_write ON public.sim_tareas;
CREATE POLICY sim_tareas_admin_write ON public.sim_tareas
  FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
REVOKE ALL ON public.sim_tareas FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sim_tareas TO authenticated;

-- sim_log: SELECT abierto a authenticated (requisito de Realtime en el
-- frontend); INSERT/UPDATE/DELETE reservados a admin o service_role (la
-- edge function usa service_role y bypassa RLS de todas formas)
DROP POLICY IF EXISTS sim_log_auth_read ON public.sim_log;
CREATE POLICY sim_log_auth_read ON public.sim_log
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS sim_log_admin_write ON public.sim_log;
CREATE POLICY sim_log_admin_write ON public.sim_log
  FOR INSERT TO authenticated WITH CHECK (es_admin());
REVOKE ALL ON public.sim_log FROM anon;
GRANT SELECT, INSERT ON public.sim_log TO authenticated;

-- sim_outbox: solo lectura para authenticated (panel de control muestra el
-- log de envíos); escritura reservada a admin/service_role
DROP POLICY IF EXISTS sim_outbox_auth_read ON public.sim_outbox;
CREATE POLICY sim_outbox_auth_read ON public.sim_outbox
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS sim_outbox_admin_write ON public.sim_outbox;
CREATE POLICY sim_outbox_admin_write ON public.sim_outbox
  FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
REVOKE ALL ON public.sim_outbox FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sim_outbox TO authenticated;

-- sim_config: lectura para authenticated (el frontend puede mostrar la
-- whitelist activa en el panel), escritura solo admin
DROP POLICY IF EXISTS sim_config_auth_read ON public.sim_config;
CREATE POLICY sim_config_auth_read ON public.sim_config
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS sim_config_admin_write ON public.sim_config;
CREATE POLICY sim_config_admin_write ON public.sim_config
  FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
REVOKE ALL ON public.sim_config FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sim_config TO authenticated;

-- ------------------------------------------------------------
-- 8. updated_at triggers (reutiliza función genérica si existe; si no, la crea)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_sim_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sim_runs_updated_at ON public.sim_runs;
CREATE TRIGGER trg_sim_runs_updated_at
  BEFORE UPDATE ON public.sim_runs
  FOR EACH ROW EXECUTE FUNCTION public.fn_sim_set_updated_at();

DROP TRIGGER IF EXISTS trg_sim_calendario_updated_at ON public.sim_calendario;
CREATE TRIGGER trg_sim_calendario_updated_at
  BEFORE UPDATE ON public.sim_calendario
  FOR EACH ROW EXECUTE FUNCTION public.fn_sim_set_updated_at();

DROP TRIGGER IF EXISTS trg_sim_tareas_updated_at ON public.sim_tareas;
CREATE TRIGGER trg_sim_tareas_updated_at
  BEFORE UPDATE ON public.sim_tareas
  FOR EACH ROW EXECUTE FUNCTION public.fn_sim_set_updated_at();

DROP TRIGGER IF EXISTS trg_sim_outbox_updated_at ON public.sim_outbox;
CREATE TRIGGER trg_sim_outbox_updated_at
  BEFORE UPDATE ON public.sim_outbox
  FOR EACH ROW EXECUTE FUNCTION public.fn_sim_set_updated_at();

DROP TRIGGER IF EXISTS trg_sim_config_updated_at ON public.sim_config;
CREATE TRIGGER trg_sim_config_updated_at
  BEFORE UPDATE ON public.sim_config
  FOR EACH ROW EXECUTE FUNCTION public.fn_sim_set_updated_at();

-- ------------------------------------------------------------
-- 9. Seed: sim_config — whitelist fija de destino seguro (una fila por canal)
-- ------------------------------------------------------------
INSERT INTO public.sim_config (canal, destino, proveedor_llm)
VALUES
  ('whatsapp', '+18097176627', 'groq'),
  ('email', 'osuniagarivera@gmail.com', 'groq')
ON CONFLICT (canal) DO UPDATE
SET destino = EXCLUDED.destino,
    proveedor_llm = EXCLUDED.proveedor_llm,
    updated_at = now();

-- ------------------------------------------------------------
-- 10. Seed: sim_runs — una corrida base de demostración ("Año Escolar Demo")
--     fecha_inicio_virtual = 15 de enero del año escolar simulado.
-- ------------------------------------------------------------
INSERT INTO public.sim_runs (id, nombre, estado, velocidad, fecha_inicio_virtual, fecha_fin_virtual, fecha_actual_virtual, metadata)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Año Escolar Demo',
  'creado',
  10,
  '2026-01-15T08:00:00-04:00',
  '2026-12-15T18:00:00-04:00',
  '2026-01-15T08:00:00-04:00',
  '{"seed": true, "descripcion": "Corrida de demostración del año escolar completo con eventos institucionales típicos."}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 11. Seed: sim_calendario — calendario de un año escolar de simulación
--     Cubre: inscripciones (2 semanas de enero), reinscripciones, reuniones
--     mensuales de equipo, nómina mensual, cobranza mensual, conciertos
--     trimestrales, audiciones y cierre de ciclo.
--     run_id fijo = '00000000-0000-0000-0000-000000000001' (seed de demo).
-- ------------------------------------------------------------
DO $$
DECLARE
  v_run_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Solo sembrar si el calendario de esta corrida aún está vacío (idempotencia)
  IF NOT EXISTS (SELECT 1 FROM public.sim_calendario WHERE run_id = v_run_id) THEN

    -- Inscripciones: 2 semanas de enero
    INSERT INTO public.sim_calendario (run_id, titulo, descripcion, categoria, fecha_inicio, fecha_fin, departamento_responsable)
    VALUES
      (v_run_id, 'Apertura de Inscripciones - Año Escolar', 'Periodo de inscripción de nuevos postulantes.', 'inscripcion', '2026-01-15T08:00:00-04:00', '2026-01-29T17:00:00-04:00', 'ADM'),
      (v_run_id, 'Cierre de Inscripciones', 'Cierre del periodo de inscripción y consolidación de postulantes.', 'inscripcion', '2026-01-29T17:00:00-04:00', '2026-01-29T18:00:00-04:00', 'ADM');

    -- Reinscripciones (alumnos activos)
    INSERT INTO public.sim_calendario (run_id, titulo, descripcion, categoria, fecha_inicio, fecha_fin, departamento_responsable)
    VALUES
      (v_run_id, 'Periodo de Reinscripción', 'Reinscripción de alumnos activos para el nuevo año.', 'inscripcion', '2026-02-01T08:00:00-04:00', '2026-02-15T17:00:00-04:00', 'ADM');

    -- Reuniones mensuales de equipo (una por mes, feb-nov)
    INSERT INTO public.sim_calendario (run_id, titulo, descripcion, categoria, fecha_inicio, fecha_fin, departamento_responsable)
    SELECT
      v_run_id,
      'Reunión Mensual de Equipo - ' || to_char(d, 'TMMonth YYYY'),
      'Reunión de coordinación mensual entre departamentos.',
      'reunion',
      d + interval '9 hour',
      d + interval '11 hour',
      'DIR'
    FROM generate_series('2026-02-05'::date, '2026-11-05'::date, interval '1 month') AS d;

    -- Nómina mensual (todos los meses)
    INSERT INTO public.sim_calendario (run_id, titulo, descripcion, categoria, fecha_inicio, fecha_fin, departamento_responsable)
    SELECT
      v_run_id,
      'Procesamiento de Nómina - ' || to_char(d, 'TMMonth YYYY'),
      'Cálculo y pago de nómina de maestros y personal administrativo.',
      'pago',
      d + interval '8 hour',
      d + interval '12 hour',
      'FIN'
    FROM generate_series('2026-01-30'::date, '2026-11-30'::date, interval '1 month') AS d;

    -- Cobranza mensual (corte de mora, todos los meses)
    INSERT INTO public.sim_calendario (run_id, titulo, descripcion, categoria, fecha_inicio, fecha_fin, departamento_responsable)
    SELECT
      v_run_id,
      'Corte de Cobranza Mensual - ' || to_char(d, 'TMMonth YYYY'),
      'Conciliación de pagos de mensualidad y notificación a representantes en mora.',
      'corte',
      d + interval '8 hour',
      d + interval '10 hour',
      'FIN'
    FROM generate_series('2026-02-01'::date, '2026-11-01'::date, interval '1 month') AS d;

    -- Conciertos trimestrales
    INSERT INTO public.sim_calendario (run_id, titulo, descripcion, categoria, fecha_inicio, fecha_fin, departamento_responsable)
    VALUES
      (v_run_id, 'Concierto de Primer Trimestre', 'Presentación pública de fin de trimestre.', 'concierto', '2026-04-10T18:00:00-04:00', '2026-04-10T20:00:00-04:00', 'ACM'),
      (v_run_id, 'Concierto de Segundo Trimestre', 'Presentación pública de fin de trimestre.', 'concierto', '2026-07-10T18:00:00-04:00', '2026-07-10T20:00:00-04:00', 'ACM'),
      (v_run_id, 'Concierto de Cierre de Año', 'Concierto de gala de cierre de ciclo escolar.', 'concierto', '2026-11-20T18:00:00-04:00', '2026-11-20T21:00:00-04:00', 'ACM');

    -- Audiciones (una concurrente con reunión de equipo para probar el
    -- procesamiento de eventos concurrentes del spec)
    INSERT INTO public.sim_calendario (run_id, titulo, descripcion, categoria, fecha_inicio, fecha_fin, departamento_responsable)
    VALUES
      (v_run_id, 'Audiciones de Ingreso - Orquesta Juvenil', 'Audiciones para selección de nuevos integrantes de la orquesta.', 'auditoria', '2026-03-05T09:00:00-04:00', '2026-03-05T11:00:00-04:00', 'ACM');

    -- Cierre de ciclo
    INSERT INTO public.sim_calendario (run_id, titulo, descripcion, categoria, fecha_inicio, fecha_fin, departamento_responsable)
    VALUES
      (v_run_id, 'Cierre de Ciclo Escolar', 'Cierre administrativo y académico del año escolar simulado.', 'otro', '2026-12-10T08:00:00-04:00', '2026-12-15T18:00:00-04:00', 'DIR');

  END IF;
END $$;

-- ------------------------------------------------------------
-- 12. Seed: datos ficticios de simulación (postulantes, alumnos activos,
--     maestros, representantes con estado de pago moroso/solvente).
--     Se almacenan en una tabla dedicada `sim_actores` (en vez de jsonb
--     suelto) para permitir consultas estructuradas desde la edge function
--     (ej. filtrar representantes morosos para el escenario de cobranza del
--     spec: simulador-agentes-departamentales). Datos 100% FICTICIOS, sin
--     relación con producción.
-- ------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE sim_actor_tipo AS ENUM ('postulante', 'alumno', 'maestro', 'representante');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sim_estado_pago AS ENUM ('solvente', 'moroso', 'no_aplica');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.sim_actores (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id         uuid NOT NULL REFERENCES public.sim_runs(id) ON DELETE CASCADE,
  tipo           sim_actor_tipo NOT NULL,
  nombre_ficticio text NOT NULL,
  instrumento    text,
  estado_pago    sim_estado_pago NOT NULL DEFAULT 'no_aplica',
  metadata       jsonb DEFAULT '{}',
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sim_actores_run_tipo ON public.sim_actores (run_id, tipo);

COMMENT ON TABLE public.sim_actores IS 'Datos 100% FICTICIOS para el sandbox del simulador (postulantes, alumnos, maestros, representantes). Nunca referencia entidades reales de producción.';

ALTER TABLE public.sim_actores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sim_actores_auth_read ON public.sim_actores;
CREATE POLICY sim_actores_auth_read ON public.sim_actores
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS sim_actores_admin_write ON public.sim_actores;
CREATE POLICY sim_actores_admin_write ON public.sim_actores
  FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
REVOKE ALL ON public.sim_actores FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sim_actores TO authenticated;

DO $$
DECLARE
  v_run_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.sim_actores WHERE run_id = v_run_id) THEN

    -- Postulantes ficticios
    INSERT INTO public.sim_actores (run_id, tipo, nombre_ficticio, instrumento, estado_pago, metadata)
    VALUES
      (v_run_id, 'postulante', 'Postulante Ficticio Uno', 'violín', 'no_aplica', '{"edad": 9}'::jsonb),
      (v_run_id, 'postulante', 'Postulante Ficticio Dos', 'chelo', 'no_aplica', '{"edad": 11}'::jsonb),
      (v_run_id, 'postulante', 'Postulante Ficticio Tres', 'flauta', 'no_aplica', '{"edad": 8}'::jsonb);

    -- Alumnos activos ficticios
    INSERT INTO public.sim_actores (run_id, tipo, nombre_ficticio, instrumento, estado_pago, metadata)
    VALUES
      (v_run_id, 'alumno', 'Alumno Ficticio Uno', 'violín', 'no_aplica', '{"nivel": 3}'::jsonb),
      (v_run_id, 'alumno', 'Alumno Ficticio Dos', 'viola', 'no_aplica', '{"nivel": 5}'::jsonb),
      (v_run_id, 'alumno', 'Alumno Ficticio Tres', 'contrabajo', 'no_aplica', '{"nivel": 2}'::jsonb);

    -- Maestros ficticios
    INSERT INTO public.sim_actores (run_id, tipo, nombre_ficticio, instrumento, estado_pago, metadata)
    VALUES
      (v_run_id, 'maestro', 'Maestro Ficticio Uno', 'violín', 'no_aplica', '{"especialidad": "cuerdas"}'::jsonb),
      (v_run_id, 'maestro', 'Maestro Ficticio Dos', 'percusión', 'no_aplica', '{"especialidad": "percusión"}'::jsonb);

    -- Representantes ficticios: AL MENOS uno moroso y uno solvente
    -- (requisito del spec: simulador-agentes-departamentales / Exclusión de
    -- morosos al día en cobranza — Scenario "Representante solvente").
    INSERT INTO public.sim_actores (run_id, tipo, nombre_ficticio, instrumento, estado_pago, metadata)
    VALUES
      (v_run_id, 'representante', 'Representante Ficticio Moroso', NULL, 'moroso', '{"dias_mora": 45, "alumno_asociado": "Alumno Ficticio Uno"}'::jsonb),
      (v_run_id, 'representante', 'Representante Ficticio Solvente', NULL, 'solvente', '{"dias_mora": 0, "alumno_asociado": "Alumno Ficticio Dos"}'::jsonb);

  END IF;
END $$;
