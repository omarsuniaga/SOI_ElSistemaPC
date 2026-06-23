-- ============================================================
-- Migration: Plataforma Caja Fundación (caja-fundacion)
-- Timestamp: 20260622_caja_fundacion
-- Project: sistema-academico-pwa
-- SDD Change: caja-fundacion
-- PRs: PR 1 of 5 — DB Foundation
-- Tasks: T-1-01 through T-1-17
-- Date: 2026-06-22
-- Idempotent: Yes (IF NOT EXISTS / CREATE OR REPLACE everywhere)
-- ============================================================

-- ============================================================
-- Section 1: ENUM Types (T-1-01)
-- ============================================================

DO $$ BEGIN
  CREATE TYPE cuota_estado AS ENUM (
    'pendiente', 'pagada', 'vencida', 'en_mora', 'exonerada', 'becada', 'pre_pagada'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE metodo_pago AS ENUM (
    'efectivo', 'transferencia', 'pago_movil', 'tarjeta', 'mixto', 'tercero', 'link_externo'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE wallet_tipo AS ENUM ('credito', 'debito');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE wallet_origen AS ENUM (
    'pago', 'patrocinio', 'beca', 'accesorio', 'ajuste'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE wallet_modo AS ENUM (
    'solo_accesorios', 'solo_cuotas', 'mixto'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE exoneracion_tipo AS ENUM ('total', 'parcial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE asignacion_estado AS ENUM (
    'pendiente', 'aprobado', 'rechazado', 'cobrado'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notif_tipo AS ENUM (
    'mora_recordatorio', 'mora_compromiso', 'mora_escalada',
    'accesorio_asignado', 'accesorio_aprobacion',
    'stock_bajo', 'comodato_riesgo', 'campana_pago',
    'mensaje_interno', 'tarea_asignada', 'minuta_nueva'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notif_canal AS ENUM ('whatsapp', 'portal', 'ambos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notif_prioridad AS ENUM ('baja', 'media', 'alta', 'critica');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notif_estado_wa AS ENUM (
    'pendiente', 'enviada', 'leida', 'respondida', 'fallida', 'no_aplica'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notif_estado_portal AS ENUM ('no_leida', 'leida', 'archivada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tarea_tipo AS ENUM (
    'seguimiento_pago', 'revision_instrumento',
    'reposicion_stock', 'recordatorio_compromiso', 'otro'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tarea_estado AS ENUM (
    'pendiente', 'en_progreso', 'completada', 'cancelada', 'vencida'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tarea_prioridad AS ENUM ('baja', 'media', 'alta', 'critica');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE patrocinante_tipo AS ENUM ('persona', 'empresa');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE patrocinio_cubre AS ENUM ('cuotas', 'wallet', 'accesorios', 'todo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE mensaje_tipo AS ENUM (
    'general', 'urgente', 'consulta', 'aprobacion_requerida'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE minuta_visibilidad AS ENUM ('cajero', 'admin', 'todos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- Section 2: Core Billing Tables (T-1-02)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.familias (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_familia  text NOT NULL,
  fecha_ingreso   date NOT NULL DEFAULT CURRENT_DATE,
  activa          boolean NOT NULL DEFAULT true,
  datos_extra     jsonb DEFAULT '{}',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_familias_activa ON public.familias (activa);

CREATE TABLE IF NOT EXISTS public.representantes (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id                uuid NOT NULL REFERENCES public.familias(id) ON DELETE RESTRICT,
  user_id                   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  nombre                    text NOT NULL,
  cedula                    text,
  telefono_whatsapp         text,
  email                     text,
  relacion                  text,
  es_pagador                boolean DEFAULT true,
  autoriza_accesorios_hasta decimal(10,2) DEFAULT 0,
  alumno_id                 uuid REFERENCES public.alumnos(id) ON DELETE SET NULL,
  activo                    boolean NOT NULL DEFAULT true,
  created_at                timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_representantes_familia ON public.representantes (familia_id);
CREATE INDEX IF NOT EXISTS idx_representantes_user    ON public.representantes (user_id);

CREATE TABLE IF NOT EXISTS public.cuotas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id        uuid NOT NULL REFERENCES public.familias(id) ON DELETE RESTRICT,
  alumno_id         uuid REFERENCES public.alumnos(id) ON DELETE RESTRICT,
  concepto          text NOT NULL,
  monto_base        decimal(10,2) NOT NULL,
  monto_final       decimal(10,2) NOT NULL,
  descuento         decimal(10,2) DEFAULT 0,
  fecha_generacion  date NOT NULL,
  fecha_vencimiento date NOT NULL,
  estado            cuota_estado NOT NULL DEFAULT 'pendiente',
  ciclo_mes         int NOT NULL CHECK (ciclo_mes BETWEEN 1 AND 12),
  ciclo_anio        int NOT NULL,
  metadatos         jsonb DEFAULT '{}',
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  UNIQUE (familia_id, alumno_id, ciclo_anio, ciclo_mes, concepto)
);

CREATE INDEX IF NOT EXISTS idx_cuotas_familia_ciclo
  ON public.cuotas (familia_id, ciclo_anio, ciclo_mes);
CREATE INDEX IF NOT EXISTS idx_cuotas_estado
  ON public.cuotas (estado);
CREATE INDEX IF NOT EXISTS idx_cuotas_vencimiento
  ON public.cuotas (fecha_vencimiento)
  WHERE estado IN ('pendiente', 'vencida', 'en_mora');

CREATE TABLE IF NOT EXISTS public.pagos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id  uuid NOT NULL REFERENCES public.familias(id) ON DELETE RESTRICT,
  cuota_ids   uuid[] NOT NULL DEFAULT '{}',
  monto       decimal(10,2) NOT NULL CHECK (monto > 0),
  metodo_pago metodo_pago NOT NULL,
  referencia  text,
  cajero_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notas       text,
  recibo_url  text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pagos_cuota_ids
  ON public.pagos USING GIN (cuota_ids);
CREATE INDEX IF NOT EXISTS idx_pagos_familia
  ON public.pagos (familia_id);
CREATE INDEX IF NOT EXISTS idx_pagos_cajero_fecha
  ON public.pagos (cajero_id, created_at);

-- ============================================================
-- Section 3: Financial Support Tables (T-1-03)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.wallet_movimientos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id       uuid NOT NULL REFERENCES public.familias(id) ON DELETE RESTRICT,
  tipo             wallet_tipo NOT NULL,
  monto            decimal(10,2) NOT NULL CHECK (monto > 0),
  origen           wallet_origen NOT NULL,
  referencia_id    uuid,
  descripcion      text,
  saldo_resultante decimal(10,2) NOT NULL,
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_familia_created
  ON public.wallet_movimientos (familia_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.wallet_config (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id          uuid NOT NULL UNIQUE REFERENCES public.familias(id) ON DELETE RESTRICT,
  modo                wallet_modo NOT NULL DEFAULT 'mixto',
  saldo_minimo_alerta decimal(10,2) DEFAULT 0,
  activo              boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.exoneraciones (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cuota_id      uuid NOT NULL REFERENCES public.cuotas(id) ON DELETE RESTRICT,
  familia_id    uuid NOT NULL REFERENCES public.familias(id) ON DELETE RESTRICT,
  tipo          exoneracion_tipo NOT NULL,
  porcentaje    decimal(5,2) NOT NULL CHECK (porcentaje > 0 AND porcentaje <= 100),
  motivo        text NOT NULL,
  aprobado_por  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  documento_url text,
  fecha_inicio  date NOT NULL,
  fecha_fin     date,
  activa        boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.becas (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id                 uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE RESTRICT,
  familia_id                uuid NOT NULL REFERENCES public.familias(id) ON DELETE RESTRICT,
  porcentaje                decimal(5,2) NOT NULL CHECK (porcentaje > 0 AND porcentaje <= 100),
  motivo                    text NOT NULL,
  aprobado_por              uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  activa                    boolean DEFAULT true,
  fecha_inicio              date NOT NULL,
  fecha_fin                 date,
  indicador_progreso_minimo text,
  created_at                timestamptz DEFAULT now()
);

-- ============================================================
-- Section 4: Accessory Tables (T-1-04)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.accesorios (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          text NOT NULL,
  categoria       text NOT NULL,
  descripcion     text,
  stock_actual    int NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
  stock_minimo    int NOT NULL DEFAULT 0,
  precio_unitario decimal(10,2) NOT NULL,
  activo          boolean DEFAULT true,
  links_externos  jsonb DEFAULT '[]',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accesorios_stock
  ON public.accesorios (stock_actual, stock_minimo)
  WHERE activo = true;

CREATE TABLE IF NOT EXISTS public.accesorio_asignaciones (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accesorio_id         uuid NOT NULL REFERENCES public.accesorios(id) ON DELETE RESTRICT,
  alumno_id            uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE RESTRICT,
  familia_id           uuid NOT NULL REFERENCES public.familias(id) ON DELETE RESTRICT,
  cantidad             int NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  precio_unitario      decimal(10,2) NOT NULL,
  monto_total          decimal(10,2) NOT NULL,
  estado               asignacion_estado NOT NULL DEFAULT 'pendiente',
  aprobacion_requerida boolean DEFAULT false,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.autorizaciones_accesorio (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id           uuid NOT NULL REFERENCES public.familias(id) ON DELETE RESTRICT,
  representante_id     uuid NOT NULL REFERENCES public.representantes(id) ON DELETE RESTRICT,
  monto_maximo         decimal(10,2) NOT NULL DEFAULT 0,
  categorias_incluidas text[] DEFAULT '{}',
  activa               boolean DEFAULT true,
  fecha_firma          timestamptz DEFAULT now()
);

-- ============================================================
-- Section 5: Score and Commitment Tables (T-1-05)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.compromisos_pago (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id             uuid NOT NULL REFERENCES public.familias(id) ON DELETE RESTRICT,
  representante_id       uuid NOT NULL REFERENCES public.representantes(id) ON DELETE RESTRICT,
  monto_comprometido     decimal(10,2) NOT NULL,
  fecha_comprometida     date NOT NULL,
  cumplido               boolean DEFAULT false,
  fecha_cumplimiento     date,
  origen_notificacion_id uuid,
  created_at             timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.score_compromiso (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  representante_id        uuid NOT NULL REFERENCES public.representantes(id) ON DELETE RESTRICT,
  familia_id              uuid NOT NULL REFERENCES public.familias(id) ON DELETE RESTRICT,
  score                   decimal(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
  nivel                   char(1) NOT NULL CHECK (nivel IN ('A', 'B', 'C', 'D', 'E')),
  puntualidad_pct         decimal(5,2),
  consistencia_meses      int,
  voluntad_pago_pct       decimal(5,2),
  comportamiento_mora_pct decimal(5,2),
  generosidad_pct         decimal(5,2),
  calculado_en            timestamptz DEFAULT now(),
  ciclo_mes               int NOT NULL,
  ciclo_anio              int NOT NULL,
  UNIQUE (representante_id, ciclo_mes, ciclo_anio)
);

CREATE INDEX IF NOT EXISTS idx_score_representante_ciclo
  ON public.score_compromiso (representante_id, ciclo_anio DESC, ciclo_mes DESC);

-- ============================================================
-- Section 6: Alumno-to-Familia Migration (T-1-06, Decision D1)
-- ============================================================

-- Step 6a: Add familia_id to alumnos (nullable first for safe backfill)
ALTER TABLE public.alumnos
  ADD COLUMN IF NOT EXISTS familia_id uuid REFERENCES public.familias(id) ON DELETE RESTRICT;

-- Step 6b: Auto-assign — create one familia per alumno that has none (idempotent)
DO $$
DECLARE
  rec            RECORD;
  new_familia_id uuid;
BEGIN
  FOR rec IN
    SELECT id, nombre_completo, fecha_ingreso, created_at
    FROM public.alumnos
    WHERE familia_id IS NULL
  LOOP
    INSERT INTO public.familias (nombre_familia, fecha_ingreso)
    VALUES (
      COALESCE(rec.nombre_completo, 'Familia sin nombre') || ' (familia)',
      COALESCE(rec.fecha_ingreso, rec.created_at::date, CURRENT_DATE)
    )
    RETURNING id INTO new_familia_id;

    UPDATE public.alumnos
    SET familia_id = new_familia_id
    WHERE id = rec.id;
  END LOOP;
END $$;

-- Step 6c: Apply NOT NULL — only if column is still nullable (idempotent guard)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'alumnos'
      AND column_name  = 'familia_id'
      AND is_nullable  = 'YES'
  ) THEN
    ALTER TABLE public.alumnos ALTER COLUMN familia_id SET NOT NULL;
  END IF;
END $$;

-- ============================================================
-- Section 6b: Sponsorship Tables (T-1-06 continued)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.patrocinantes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text NOT NULL,
  tipo       patrocinante_tipo NOT NULL DEFAULT 'persona',
  contacto   text,
  email      text,
  telefono   text,
  activo     boolean DEFAULT true,
  notas      text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patrocinios (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patrocinante_id uuid NOT NULL REFERENCES public.patrocinantes(id) ON DELETE RESTRICT,
  alumno_id       uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE RESTRICT,
  familia_id      uuid NOT NULL REFERENCES public.familias(id) ON DELETE RESTRICT,
  cubre           patrocinio_cubre NOT NULL DEFAULT 'todo',
  monto_mensual   decimal(10,2),
  activo          boolean DEFAULT true,
  fecha_inicio    date NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin       date,
  created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- Section 7: Notification Table (T-1-07)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notificaciones_caja (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id       uuid REFERENCES public.familias(id) ON DELETE RESTRICT,
  representante_id uuid REFERENCES public.representantes(id) ON DELETE SET NULL,
  alumno_id        uuid REFERENCES public.alumnos(id) ON DELETE SET NULL,
  tipo             notif_tipo NOT NULL,
  canal            notif_canal NOT NULL DEFAULT 'ambos',
  prioridad        notif_prioridad NOT NULL DEFAULT 'media',
  titulo           text NOT NULL,
  cuerpo           text NOT NULL,
  datos_extra      jsonb DEFAULT '{}',
  estado_whatsapp  notif_estado_wa NOT NULL DEFAULT 'pendiente',
  estado_portal    notif_estado_portal NOT NULL DEFAULT 'no_leida',
  respuesta_padre  text,
  fecha_respuesta  timestamptz,
  fecha_programada timestamptz,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- HERMES polling index: pending WA messages
CREATE INDEX IF NOT EXISTS idx_notif_hermes
  ON public.notificaciones_caja (estado_whatsapp, created_at)
  WHERE canal IN ('whatsapp', 'ambos') AND estado_whatsapp = 'pendiente';

-- Family notification timeline
CREATE INDEX IF NOT EXISTS idx_notif_familia
  ON public.notificaciones_caja (familia_id, created_at DESC);

-- Portal unread badge
CREATE INDEX IF NOT EXISTS idx_notif_portal_unreads
  ON public.notificaciones_caja (estado_portal)
  WHERE estado_portal = 'no_leida';

-- ============================================================
-- Section 8: Operational Tables (T-1-08)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tareas_caja (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo             text NOT NULL,
  descripcion        text,
  tipo               tarea_tipo NOT NULL DEFAULT 'otro',
  asignado_a         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  familia_id         uuid REFERENCES public.familias(id) ON DELETE SET NULL,
  alumno_id          uuid REFERENCES public.alumnos(id) ON DELETE SET NULL,
  referencia_id      uuid,
  estado             tarea_estado NOT NULL DEFAULT 'pendiente',
  prioridad          tarea_prioridad NOT NULL DEFAULT 'media',
  fecha_vencimiento  date,
  recurrente         boolean DEFAULT false,
  patron_recurrencia jsonb,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.minutas (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo                text NOT NULL,
  fecha_reunion         date NOT NULL,
  participantes         jsonb NOT NULL DEFAULT '[]',
  puntos_tratados       jsonb NOT NULL DEFAULT '[]',
  acuerdos              jsonb NOT NULL DEFAULT '[]',
  responsables          jsonb DEFAULT '[]',
  fecha_proxima_reunion date,
  visibilidad           minuta_visibilidad NOT NULL DEFAULT 'todos',
  creado_por            uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  archivo_adjunto_url   text,
  created_at            timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hilos_mensajes (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo                     text NOT NULL,
  tema                       text,
  departamentos_involucrados text[] DEFAULT '{}',
  creado_por                 uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resuelto                   boolean DEFAULT false,
  created_at                 timestamptz DEFAULT now(),
  updated_at                 timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mensajes_internos (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hilo_id              uuid NOT NULL REFERENCES public.hilos_mensajes(id) ON DELETE RESTRICT,
  autor_id             uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rol_autor            text NOT NULL,
  contenido            text NOT NULL,
  tipo                 mensaje_tipo NOT NULL DEFAULT 'general',
  departamento_destino text[] DEFAULT '{}',
  leido_por            jsonb DEFAULT '{}',
  resuelto             boolean DEFAULT false,
  created_at           timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mensajes_hilo
  ON public.mensajes_internos (hilo_id, created_at);
CREATE INDEX IF NOT EXISTS idx_mensajes_departamento
  ON public.mensajes_internos USING GIN (departamento_destino);

-- ============================================================
-- Section 9: Campaign and Push Tables (T-1-09)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.campanas_pago (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text NOT NULL,
  descripcion text,
  incentivo   text,
  fecha_inicio date NOT NULL,
  fecha_fin    date NOT NULL,
  creado_por  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  activa      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.campana_participaciones (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campana_id       uuid NOT NULL REFERENCES public.campanas_pago(id) ON DELETE RESTRICT,
  familia_id       uuid NOT NULL REFERENCES public.familias(id) ON DELETE RESTRICT,
  aceptada         boolean DEFAULT false,
  fecha_aceptacion timestamptz,
  monto_recuperado decimal(10,2) DEFAULT 0,
  UNIQUE (campana_id, familia_id)
);

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   text NOT NULL,
  p256dh     text NOT NULL,
  auth       text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (profile_id, endpoint)
);

-- ============================================================
-- Section 10: Views (T-1-10)
-- ============================================================

-- vw_estado_familiar: family financial status summary
CREATE OR REPLACE VIEW public.vw_estado_familiar AS
SELECT
  f.id,
  f.nombre_familia,
  f.activa,
  r.id            AS rep_id,
  r.nombre        AS rep_nombre,
  r.telefono_whatsapp,
  r.es_pagador,
  sc.score,
  sc.nivel,
  COUNT(c.id) FILTER (WHERE c.estado IN ('pendiente', 'vencida', 'en_mora'))     AS cuotas_pendientes,
  SUM(c.monto_final) FILTER (WHERE c.estado IN ('pendiente', 'vencida', 'en_mora')) AS saldo_pendiente,
  wm.saldo_resultante AS saldo_wallet
FROM public.familias f
LEFT JOIN public.representantes r
  ON r.familia_id = f.id AND r.es_pagador = true
LEFT JOIN LATERAL (
  SELECT score, nivel
  FROM public.score_compromiso sc2
  WHERE sc2.representante_id = r.id
  ORDER BY sc2.ciclo_anio DESC, sc2.ciclo_mes DESC
  LIMIT 1
) sc ON true
LEFT JOIN public.cuotas c ON c.familia_id = f.id
LEFT JOIN LATERAL (
  SELECT saldo_resultante
  FROM public.wallet_movimientos wm2
  WHERE wm2.familia_id = f.id
  ORDER BY wm2.created_at DESC
  LIMIT 1
) wm ON true
GROUP BY
  f.id, f.nombre_familia, f.activa,
  r.id, r.nombre, r.telefono_whatsapp, r.es_pagador,
  sc.score, sc.nivel,
  wm.saldo_resultante;

-- vw_mora_activa: all overdue cuotas with dias_mora + contact info
CREATE OR REPLACE VIEW public.vw_mora_activa AS
SELECT
  c.id              AS cuota_id,
  c.familia_id,
  c.alumno_id,
  c.concepto,
  c.monto_final,
  c.fecha_vencimiento,
  c.estado,
  (CURRENT_DATE - c.fecha_vencimiento)::int AS dias_mora,
  f.nombre_familia,
  r.nombre           AS rep_nombre,
  r.telefono_whatsapp,
  r.email            AS rep_email,
  sc.nivel           AS score_nivel
FROM public.cuotas c
JOIN public.familias f ON f.id = c.familia_id
LEFT JOIN public.representantes r
  ON r.familia_id = c.familia_id AND r.es_pagador = true
LEFT JOIN LATERAL (
  SELECT nivel
  FROM public.score_compromiso sc2
  WHERE sc2.representante_id = r.id
  ORDER BY sc2.ciclo_anio DESC, sc2.ciclo_mes DESC
  LIMIT 1
) sc ON true
WHERE c.estado IN ('vencida', 'en_mora');

-- vw_score_representantes: latest score snapshot per representante (DISTINCT ON)
CREATE OR REPLACE VIEW public.vw_score_representantes AS
SELECT DISTINCT ON (sc.representante_id)
  sc.representante_id,
  sc.familia_id,
  sc.score,
  sc.nivel,
  sc.puntualidad_pct,
  sc.consistencia_meses,
  sc.voluntad_pago_pct,
  sc.comportamiento_mora_pct,
  sc.generosidad_pct,
  sc.calculado_en,
  sc.ciclo_mes,
  sc.ciclo_anio,
  r.nombre        AS rep_nombre,
  f.nombre_familia
FROM public.score_compromiso sc
JOIN public.representantes r ON r.id = sc.representante_id
JOIN public.familias f       ON f.id = sc.familia_id
ORDER BY sc.representante_id, sc.ciclo_anio DESC, sc.ciclo_mes DESC;

-- vw_comodatos_en_riesgo: D/E score families (stub; extend when inventario module is ready)
CREATE OR REPLACE VIEW public.vw_comodatos_en_riesgo AS
SELECT
  vsr.representante_id,
  vsr.familia_id,
  vsr.rep_nombre,
  vsr.nombre_familia,
  vsr.score,
  vsr.nivel
FROM public.vw_score_representantes vsr
WHERE vsr.nivel IN ('D', 'E');
-- Note: Join to comodatos_activos/inventario_activos when inventario module is complete.

-- vw_stock_bajo: accessories at or below minimum stock
CREATE OR REPLACE VIEW public.vw_stock_bajo AS
SELECT
  id,
  nombre,
  categoria,
  descripcion,
  stock_actual,
  stock_minimo,
  (stock_minimo - stock_actual) AS unidades_faltantes,
  precio_unitario,
  links_externos
FROM public.accesorios
WHERE stock_actual <= stock_minimo AND activo = true;

-- vw_ingresos_diarios: today's income grouped by payment method
CREATE OR REPLACE VIEW public.vw_ingresos_diarios AS
SELECT
  p.metodo_pago,
  COUNT(p.id)   AS cantidad_pagos,
  SUM(p.monto)  AS total_monto,
  MIN(p.created_at) AS primer_pago,
  MAX(p.created_at) AS ultimo_pago
FROM public.pagos p
WHERE p.created_at::date = CURRENT_DATE
GROUP BY p.metodo_pago;

-- vw_prediccion_abandono: composite abandonment risk per active alumno
-- Stub: asistencia_rate and progreso_rate default to 0.5 until maestros module integration
CREATE OR REPLACE VIEW public.vw_prediccion_abandono AS
SELECT
  a.id               AS alumno_id,
  a.nombre_completo,
  a.familia_id,
  f.nombre_familia,
  COALESCE(vsr.score, 50)  AS score_financiero,
  COALESCE(vsr.nivel, 'C') AS nivel_financiero,
  0.5::decimal(5,2)        AS asistencia_rate,
  0.5::decimal(5,2)        AS progreso_rate,
  ROUND(
    CAST(
      ((100 - COALESCE(vsr.score, 50)) * 0.4)
      + ((1 - 0.5) * 100 * 0.3)
      + ((1 - 0.5) * 100 * 0.3)
    AS numeric), 2
  )::decimal(5,2)          AS riesgo_abandono
FROM public.alumnos a
JOIN public.familias f ON f.id = a.familia_id
LEFT JOIN public.vw_score_representantes vsr ON vsr.familia_id = a.familia_id
WHERE a.activo = true;

-- ============================================================
-- Section 11a: fn_generar_ciclo_cuotas (T-1-11)
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_generar_ciclo_cuotas(
  p_mes  int,
  p_anio int
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_count       int := 0;
  v_familia     RECORD;
  v_alumno      RECORD;
  v_vencimiento date;
BEGIN
  IF p_mes < 1 OR p_mes > 12 THEN
    RAISE EXCEPTION 'p_mes must be between 1 and 12, got %', p_mes;
  END IF;

  v_vencimiento := make_date(p_anio, p_mes, 5);

  FOR v_familia IN
    SELECT id FROM public.familias WHERE activa = true
  LOOP
    FOR v_alumno IN
      SELECT id FROM public.alumnos
      WHERE familia_id = v_familia.id AND activo = true
    LOOP
      INSERT INTO public.cuotas (
        familia_id, alumno_id, concepto,
        monto_base, monto_final,
        fecha_generacion, fecha_vencimiento,
        ciclo_mes, ciclo_anio, estado
      )
      VALUES (
        v_familia.id, v_alumno.id, 'mensualidad',
        0, 0,
        CURRENT_DATE, v_vencimiento,
        p_mes, p_anio, 'pendiente'
      )
      ON CONFLICT (familia_id, alumno_id, ciclo_anio, ciclo_mes, concepto)
      DO NOTHING;

      IF FOUND THEN
        v_count := v_count + 1;
      END IF;
    END LOOP;
  END LOOP;

  RETURN v_count;
END;
$func$;

-- ============================================================
-- Section 11b: fn_aplicar_becas_ciclo (T-1-11)
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_aplicar_becas_ciclo(
  p_mes  int,
  p_anio int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_beca RECORD;
BEGIN
  FOR v_beca IN
    SELECT b.alumno_id, b.familia_id, b.porcentaje
    FROM public.becas b
    WHERE b.activa = true
      AND (b.fecha_fin IS NULL OR b.fecha_fin >= make_date(p_anio, p_mes, 1))
      AND b.fecha_inicio <= (make_date(p_anio, p_mes, 1) + INTERVAL '1 month - 1 day')::date
  LOOP
    UPDATE public.cuotas
    SET
      estado     = 'becada',
      monto_final = ROUND(monto_base * (1 - v_beca.porcentaje / 100.0), 2),
      updated_at  = now()
    WHERE alumno_id  = v_beca.alumno_id
      AND ciclo_mes  = p_mes
      AND ciclo_anio = p_anio
      AND estado     = 'pendiente';
  END LOOP;
END;
$func$;

-- ============================================================
-- Section 11c: fn_calcular_score_representante (T-1-12)
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_calcular_score_representante(
  p_representante_id uuid,
  p_mes              int,
  p_anio             int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_familia_id            uuid;
  v_puntualidad           decimal(5,2) := 35;
  v_consistencia          decimal(5,2) := 20;
  v_voluntad_pago         decimal(5,2) := 20;
  v_comportamiento_mora   decimal(5,2) := 15;
  v_generosidad           decimal(5,2) := 0;
  v_score                 decimal(5,2);
  v_nivel                 char(1);
  v_total_cuotas_pagadas  int;
  v_pagos_a_tiempo        int;
  v_compromisos_total     int;
  v_compromisos_cumplidos int;
  v_mora_episodes         int;
  v_pagos_adelantados     int;
  v_meses_consecutivos    int;
  v_ciclo_hace_12         date;
BEGIN
  SELECT familia_id INTO v_familia_id
  FROM public.representantes
  WHERE id = p_representante_id;

  IF v_familia_id IS NULL THEN
    RAISE EXCEPTION 'Representante % not found or has no familia', p_representante_id;
  END IF;

  v_ciclo_hace_12 := make_date(p_anio, p_mes, 1) - INTERVAL '12 months';

  -- Dimension 1: Puntualidad (35 points max)
  SELECT COUNT(*) INTO v_total_cuotas_pagadas
  FROM public.cuotas
  WHERE familia_id     = v_familia_id
    AND estado         = 'pagada'
    AND fecha_generacion >= v_ciclo_hace_12;

  IF v_total_cuotas_pagadas > 0 THEN
    SELECT COUNT(*) INTO v_pagos_a_tiempo
    FROM public.cuotas
    WHERE familia_id       = v_familia_id
      AND estado           = 'pagada'
      AND fecha_generacion >= v_ciclo_hace_12
      AND updated_at::date <= fecha_vencimiento;

    v_puntualidad := ROUND(
      CAST(v_pagos_a_tiempo AS decimal) / v_total_cuotas_pagadas * 35, 2
    );
  END IF;

  -- Dimension 2: Consistencia (20 points max)
  SELECT COUNT(DISTINCT (ciclo_anio * 100 + ciclo_mes)) INTO v_meses_consecutivos
  FROM public.cuotas
  WHERE familia_id       = v_familia_id
    AND estado           NOT IN ('en_mora')
    AND fecha_generacion >= v_ciclo_hace_12;

  v_consistencia := LEAST(20, ROUND(CAST(v_meses_consecutivos AS decimal) / 12 * 20, 2));

  -- Dimension 3: Voluntad de pago (20 points max) — Decision D3: default 20 when no compromisos
  SELECT COUNT(*) INTO v_compromisos_total
  FROM public.compromisos_pago
  WHERE representante_id = p_representante_id
    AND created_at       >= v_ciclo_hace_12;

  IF v_compromisos_total > 0 THEN
    SELECT COUNT(*) INTO v_compromisos_cumplidos
    FROM public.compromisos_pago
    WHERE representante_id = p_representante_id
      AND cumplido         = true
      AND created_at       >= v_ciclo_hace_12;

    v_voluntad_pago := ROUND(
      CAST(v_compromisos_cumplidos AS decimal) / v_compromisos_total * 20, 2
    );
  END IF;

  -- Dimension 4: Comportamiento en mora (15 points max)
  SELECT COUNT(*) INTO v_mora_episodes
  FROM public.cuotas
  WHERE familia_id       = v_familia_id
    AND estado           = 'en_mora'
    AND fecha_generacion >= v_ciclo_hace_12;

  v_comportamiento_mora := GREATEST(0, CAST(15 - (v_mora_episodes * 3) AS decimal(5,2)));

  -- Dimension 5: Generosidad (10 points max)
  SELECT COUNT(*) INTO v_pagos_adelantados
  FROM public.pagos
  WHERE familia_id   = v_familia_id
    AND created_at   >= v_ciclo_hace_12;

  v_generosidad := LEAST(10, CAST(v_pagos_adelantados AS decimal) * 1);

  -- Composite score
  v_score := LEAST(100, v_puntualidad + v_consistencia + v_voluntad_pago + v_comportamiento_mora + v_generosidad);

  v_nivel := CASE
    WHEN v_score >= 85 THEN 'A'
    WHEN v_score >= 70 THEN 'B'
    WHEN v_score >= 50 THEN 'C'
    WHEN v_score >= 30 THEN 'D'
    ELSE 'E'
  END;

  -- Insert snapshot (ON CONFLICT DO NOTHING makes it idempotent per cycle)
  INSERT INTO public.score_compromiso (
    representante_id, familia_id, score, nivel,
    puntualidad_pct, consistencia_meses, voluntad_pago_pct,
    comportamiento_mora_pct, generosidad_pct,
    calculado_en, ciclo_mes, ciclo_anio
  )
  VALUES (
    p_representante_id, v_familia_id, v_score, v_nivel,
    v_puntualidad, v_meses_consecutivos, v_voluntad_pago,
    v_comportamiento_mora, v_generosidad,
    now(), p_mes, p_anio
  )
  ON CONFLICT DO NOTHING;
END;
$func$;

-- ============================================================
-- Section 11d: fn_verificar_stock_minimo trigger function (T-1-13)
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_verificar_stock_minimo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  IF NEW.stock_actual <= NEW.stock_minimo AND OLD.stock_actual > OLD.stock_minimo THEN
    INSERT INTO public.notificaciones_caja (
      tipo, canal, prioridad, titulo, cuerpo, datos_extra
    )
    VALUES (
      'stock_bajo',
      'portal',
      'alta',
      'Stock bajo: ' || NEW.nombre,
      'El accesorio "' || NEW.nombre || '" ha bajado a ' || NEW.stock_actual::text ||
        ' unidades (mínimo: ' || NEW.stock_minimo::text || ').',
      row_to_json(NEW)::jsonb
    );
  END IF;
  RETURN NEW;
END;
$func$;

-- ============================================================
-- Section 11e: fn_escalar_mora (T-1-14)
-- Decision D4: No pg_cron. Schedule via Edge Function.
-- ============================================================

-- Schedule via Edge Function: supabase/functions/escalacion-mora/
CREATE OR REPLACE FUNCTION public.fn_escalar_mora()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_cuota        RECORD;
  v_dias_mora    int;
  v_notif_exists boolean;
BEGIN
  FOR v_cuota IN
    SELECT c.id, c.familia_id, c.alumno_id,
           c.fecha_vencimiento, c.estado,
           c.concepto, c.monto_final
    FROM public.cuotas c
    WHERE c.estado IN ('vencida', 'en_mora')
      AND c.fecha_vencimiento < CURRENT_DATE
  LOOP
    v_dias_mora := (CURRENT_DATE - v_cuota.fecha_vencimiento)::int;

    -- Day 7: mora_recordatorio + escalate vencida → en_mora
    IF v_dias_mora >= 7 THEN
      SELECT EXISTS (
        SELECT 1 FROM public.notificaciones_caja
        WHERE familia_id              = v_cuota.familia_id
          AND tipo                    = 'mora_recordatorio'
          AND datos_extra->>'cuota_id' = v_cuota.id::text
      ) INTO v_notif_exists;

      IF NOT v_notif_exists THEN
        INSERT INTO public.notificaciones_caja (
          familia_id, alumno_id, tipo, canal, prioridad, titulo, cuerpo, datos_extra
        ) VALUES (
          v_cuota.familia_id, v_cuota.alumno_id,
          'mora_recordatorio', 'ambos', 'media',
          'Recordatorio de pago pendiente',
          'Tiene una cuota de ' || v_cuota.concepto || ' vencida hace ' ||
            v_dias_mora || ' días.',
          jsonb_build_object('cuota_id', v_cuota.id, 'dias_mora', v_dias_mora)
        );

        IF v_cuota.estado = 'vencida' THEN
          UPDATE public.cuotas
          SET estado = 'en_mora', updated_at = now()
          WHERE id = v_cuota.id;
        END IF;
      END IF;
    END IF;

    -- Day 15: mora_compromiso
    IF v_dias_mora >= 15 THEN
      SELECT EXISTS (
        SELECT 1 FROM public.notificaciones_caja
        WHERE familia_id               = v_cuota.familia_id
          AND tipo                     = 'mora_compromiso'
          AND datos_extra->>'cuota_id' = v_cuota.id::text
      ) INTO v_notif_exists;

      IF NOT v_notif_exists THEN
        INSERT INTO public.notificaciones_caja (
          familia_id, alumno_id, tipo, canal, prioridad, titulo, cuerpo, datos_extra
        ) VALUES (
          v_cuota.familia_id, v_cuota.alumno_id,
          'mora_compromiso', 'ambos', 'alta',
          'Solicitud de compromiso de pago',
          'Han pasado ' || v_dias_mora || ' días de su cuota vencida (' ||
            v_cuota.concepto || '). Por favor establezca una fecha comprometida.',
          jsonb_build_object('cuota_id', v_cuota.id, 'dias_mora', v_dias_mora)
        );
      END IF;
    END IF;

    -- Day 30: mora_escalada first
    IF v_dias_mora >= 30 THEN
      SELECT EXISTS (
        SELECT 1 FROM public.notificaciones_caja
        WHERE familia_id               = v_cuota.familia_id
          AND tipo                     = 'mora_escalada'
          AND datos_extra->>'cuota_id' = v_cuota.id::text
          AND datos_extra->>'escalacion_dia' = '30'
      ) INTO v_notif_exists;

      IF NOT v_notif_exists THEN
        INSERT INTO public.notificaciones_caja (
          familia_id, alumno_id, tipo, canal, prioridad, titulo, cuerpo, datos_extra
        ) VALUES (
          v_cuota.familia_id, v_cuota.alumno_id,
          'mora_escalada', 'ambos', 'alta',
          'Mora escalada — 30 días',
          'Su cuota de ' || v_cuota.concepto ||
            ' lleva 30 días sin pagar. Se notificó a administración.',
          jsonb_build_object('cuota_id', v_cuota.id, 'dias_mora', v_dias_mora, 'escalacion_dia', 30)
        );
      END IF;
    END IF;

    -- Day 45: mora_escalada, portal only, critica
    IF v_dias_mora >= 45 THEN
      SELECT EXISTS (
        SELECT 1 FROM public.notificaciones_caja
        WHERE familia_id               = v_cuota.familia_id
          AND tipo                     = 'mora_escalada'
          AND datos_extra->>'cuota_id' = v_cuota.id::text
          AND datos_extra->>'escalacion_dia' = '45'
      ) INTO v_notif_exists;

      IF NOT v_notif_exists THEN
        INSERT INTO public.notificaciones_caja (
          familia_id, alumno_id, tipo, canal, prioridad, titulo, cuerpo, datos_extra
        ) VALUES (
          v_cuota.familia_id, v_cuota.alumno_id,
          'mora_escalada', 'portal', 'critica',
          'Mora crítica — 45 días',
          'Alerta crítica: ' || v_dias_mora ||
            ' días de mora en cuota ' || v_cuota.concepto || '. Atención inmediata requerida.',
          jsonb_build_object('cuota_id', v_cuota.id, 'dias_mora', v_dias_mora, 'escalacion_dia', 45)
        );
      END IF;
    END IF;

    -- Day 60: mora_escalada + create tarea revision_instrumento
    IF v_dias_mora >= 60 THEN
      SELECT EXISTS (
        SELECT 1 FROM public.notificaciones_caja
        WHERE familia_id               = v_cuota.familia_id
          AND tipo                     = 'mora_escalada'
          AND datos_extra->>'cuota_id' = v_cuota.id::text
          AND datos_extra->>'escalacion_dia' = '60'
      ) INTO v_notif_exists;

      IF NOT v_notif_exists THEN
        INSERT INTO public.notificaciones_caja (
          familia_id, alumno_id, tipo, canal, prioridad, titulo, cuerpo, datos_extra
        ) VALUES (
          v_cuota.familia_id, v_cuota.alumno_id,
          'mora_escalada', 'ambos', 'critica',
          'Mora crítica — 60 días — Revisión de instrumento',
          'La cuota ' || v_cuota.concepto ||
            ' lleva 60 días impaga. Tarea de revisión de instrumento generada.',
          jsonb_build_object('cuota_id', v_cuota.id, 'dias_mora', v_dias_mora, 'escalacion_dia', 60)
        );

        INSERT INTO public.tareas_caja (
          titulo, tipo, familia_id, alumno_id, referencia_id,
          estado, prioridad, descripcion
        ) VALUES (
          'Revisión de instrumento — mora 60 días',
          'revision_instrumento',
          v_cuota.familia_id, v_cuota.alumno_id, v_cuota.id,
          'pendiente', 'critica',
          'Cuota ' || v_cuota.concepto || ' lleva ' || v_dias_mora ||
            ' días impaga. Evaluar retención de instrumento en comodato.'
        );
      END IF;
    END IF;
  END LOOP;
END;
$func$;

-- ============================================================
-- Section 11f: fn_hermes_update_notif SECURITY DEFINER (D2 resolution)
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_hermes_update_notif(
  p_id        uuid,
  p_estado_wa text,
  p_respuesta text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  IF p_estado_wa NOT IN ('enviada', 'leida', 'respondida', 'fallida') THEN
    RAISE EXCEPTION 'Invalid estado_wa: %. Must be one of: enviada, leida, respondida, fallida',
      p_estado_wa;
  END IF;

  UPDATE public.notificaciones_caja
  SET
    estado_whatsapp = p_estado_wa::notif_estado_wa,
    respuesta_padre = CASE WHEN p_respuesta IS NOT NULL THEN p_respuesta ELSE respuesta_padre END,
    fecha_respuesta = CASE WHEN p_respuesta IS NOT NULL THEN now() ELSE fecha_respuesta END,
    updated_at      = now()
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Notification % not found', p_id;
  END IF;
END;
$func$;

-- HERMES authenticated user may call this function only
GRANT EXECUTE ON FUNCTION public.fn_hermes_update_notif(uuid, text, text) TO authenticated;

-- ============================================================
-- Section 12: Alumnos Extension Columns (T-1-16)
-- ============================================================

ALTER TABLE public.alumnos
  ADD COLUMN IF NOT EXISTS mora_flag           boolean NOT NULL DEFAULT false;
ALTER TABLE public.alumnos
  ADD COLUMN IF NOT EXISTS bloqueo_certificado boolean NOT NULL DEFAULT false;
ALTER TABLE public.alumnos
  ADD COLUMN IF NOT EXISTS bloqueo_evento      boolean NOT NULL DEFAULT false;
ALTER TABLE public.alumnos
  ADD COLUMN IF NOT EXISTS abandono_score      decimal(5,2);

COMMENT ON COLUMN public.alumnos.mora_flag
  IS 'true when mora > 60 days. Read by maestros portal to block certificates/events.';
COMMENT ON COLUMN public.alumnos.bloqueo_certificado
  IS 'Blocks certificate generation (mora-triggered).';
COMMENT ON COLUMN public.alumnos.bloqueo_evento
  IS 'Blocks event participation (mora-triggered).';
COMMENT ON COLUMN public.alumnos.abandono_score
  IS 'Composite abandonment risk 0-100 from vw_prediccion_abandono. Updated by admin schedule.';

-- ============================================================
-- Section 13: RLS Helper Functions (T-1-15)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb->>'user_role',
    'representante'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_familia_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT familia_id
  FROM public.representantes
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- ============================================================
-- Section 13b: Enable RLS on all new tables (T-1-15)
-- ============================================================

ALTER TABLE public.familias                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.representantes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuotas                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_movimientos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_config            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exoneraciones            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.becas                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accesorios               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accesorio_asignaciones   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autorizaciones_accesorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compromisos_pago         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_compromiso         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrocinantes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrocinios              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones_caja      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas_caja              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minutas                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hilos_mensajes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes_internos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanas_pago            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campana_participaciones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Section 13c: RLS Policies per role (T-1-15)
-- ============================================================

-- ---- familias ----
DROP POLICY IF EXISTS familias_select_cajero_admin    ON public.familias;
DROP POLICY IF EXISTS familias_select_representante   ON public.familias;
DROP POLICY IF EXISTS familias_all_admin              ON public.familias;

CREATE POLICY familias_select_cajero_admin ON public.familias
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY familias_select_representante ON public.familias
  FOR SELECT USING (
    get_user_role() = 'representante' AND id = get_user_familia_id()
  );

CREATE POLICY familias_all_admin ON public.familias
  FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- representantes ----
DROP POLICY IF EXISTS representantes_select_cajero_admin ON public.representantes;
DROP POLICY IF EXISTS representantes_select_representante ON public.representantes;
DROP POLICY IF EXISTS representantes_all_admin ON public.representantes;

CREATE POLICY representantes_select_cajero_admin ON public.representantes
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY representantes_select_representante ON public.representantes
  FOR SELECT USING (
    get_user_role() = 'representante' AND familia_id = get_user_familia_id()
  );

CREATE POLICY representantes_all_admin ON public.representantes
  FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- cuotas ----
DROP POLICY IF EXISTS cuotas_select_cajero_admin   ON public.cuotas;
DROP POLICY IF EXISTS cuotas_select_representante  ON public.cuotas;
DROP POLICY IF EXISTS cuotas_insert_cajero_admin   ON public.cuotas;
DROP POLICY IF EXISTS cuotas_update_admin          ON public.cuotas;

CREATE POLICY cuotas_select_cajero_admin ON public.cuotas
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY cuotas_select_representante ON public.cuotas
  FOR SELECT USING (
    get_user_role() = 'representante' AND familia_id = get_user_familia_id()
  );

CREATE POLICY cuotas_insert_cajero_admin ON public.cuotas
  FOR INSERT WITH CHECK (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY cuotas_update_admin ON public.cuotas
  FOR UPDATE
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- pagos ----
DROP POLICY IF EXISTS pagos_select_cajero_admin   ON public.pagos;
DROP POLICY IF EXISTS pagos_select_representante  ON public.pagos;
DROP POLICY IF EXISTS pagos_insert_cajero_admin   ON public.pagos;
DROP POLICY IF EXISTS pagos_update_admin          ON public.pagos;

CREATE POLICY pagos_select_cajero_admin ON public.pagos
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY pagos_select_representante ON public.pagos
  FOR SELECT USING (
    get_user_role() = 'representante' AND familia_id = get_user_familia_id()
  );

CREATE POLICY pagos_insert_cajero_admin ON public.pagos
  FOR INSERT WITH CHECK (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY pagos_update_admin ON public.pagos
  FOR UPDATE
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- wallet_movimientos ----
DROP POLICY IF EXISTS wallet_mov_select_cajero_admin  ON public.wallet_movimientos;
DROP POLICY IF EXISTS wallet_mov_select_representante ON public.wallet_movimientos;

CREATE POLICY wallet_mov_select_cajero_admin ON public.wallet_movimientos
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY wallet_mov_select_representante ON public.wallet_movimientos
  FOR SELECT USING (
    get_user_role() = 'representante' AND familia_id = get_user_familia_id()
  );

-- ---- wallet_config ----
DROP POLICY IF EXISTS wallet_config_all_cajero_admin ON public.wallet_config;
CREATE POLICY wallet_config_all_cajero_admin ON public.wallet_config
  FOR ALL
  USING (get_user_role() IN ('cajero', 'admin'))
  WITH CHECK (get_user_role() IN ('cajero', 'admin'));

-- ---- exoneraciones ----
DROP POLICY IF EXISTS exoneraciones_select_cajero_admin ON public.exoneraciones;
DROP POLICY IF EXISTS exoneraciones_all_admin           ON public.exoneraciones;

CREATE POLICY exoneraciones_select_cajero_admin ON public.exoneraciones
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY exoneraciones_all_admin ON public.exoneraciones
  FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- becas ----
DROP POLICY IF EXISTS becas_select_cajero_admin ON public.becas;
DROP POLICY IF EXISTS becas_all_admin           ON public.becas;

CREATE POLICY becas_select_cajero_admin ON public.becas
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY becas_all_admin ON public.becas
  FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- accesorios ----
DROP POLICY IF EXISTS accesorios_select_cajero_admin    ON public.accesorios;
DROP POLICY IF EXISTS accesorios_update_cajero_admin    ON public.accesorios;
DROP POLICY IF EXISTS accesorios_insert_delete_admin    ON public.accesorios;

CREATE POLICY accesorios_select_cajero_admin ON public.accesorios
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY accesorios_update_cajero_admin ON public.accesorios
  FOR UPDATE
  USING (get_user_role() IN ('cajero', 'admin'))
  WITH CHECK (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY accesorios_insert_delete_admin ON public.accesorios
  FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- accesorio_asignaciones ----
DROP POLICY IF EXISTS aa_select_cajero_admin ON public.accesorio_asignaciones;
DROP POLICY IF EXISTS aa_insert_cajero_admin ON public.accesorio_asignaciones;
DROP POLICY IF EXISTS aa_all_admin           ON public.accesorio_asignaciones;

CREATE POLICY aa_select_cajero_admin ON public.accesorio_asignaciones
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY aa_insert_cajero_admin ON public.accesorio_asignaciones
  FOR INSERT WITH CHECK (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY aa_all_admin ON public.accesorio_asignaciones
  FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- autorizaciones_accesorio ----
DROP POLICY IF EXISTS autorizaciones_select_cajero ON public.autorizaciones_accesorio;
DROP POLICY IF EXISTS autorizaciones_all_admin     ON public.autorizaciones_accesorio;

CREATE POLICY autorizaciones_select_cajero ON public.autorizaciones_accesorio
  FOR SELECT USING (get_user_role() = 'cajero');

CREATE POLICY autorizaciones_all_admin ON public.autorizaciones_accesorio
  FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- compromisos_pago ----
DROP POLICY IF EXISTS compromisos_select_cajero_admin ON public.compromisos_pago;
DROP POLICY IF EXISTS compromisos_all_admin           ON public.compromisos_pago;

CREATE POLICY compromisos_select_cajero_admin ON public.compromisos_pago
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY compromisos_all_admin ON public.compromisos_pago
  FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- score_compromiso: admin only — NEVER exposed to representante ----
DROP POLICY IF EXISTS score_select_admin_only ON public.score_compromiso;
CREATE POLICY score_select_admin_only ON public.score_compromiso
  FOR SELECT USING (get_user_role() = 'admin');

-- ---- patrocinantes ----
DROP POLICY IF EXISTS patrocinantes_select_cajero_admin ON public.patrocinantes;
DROP POLICY IF EXISTS patrocinantes_all_admin           ON public.patrocinantes;

CREATE POLICY patrocinantes_select_cajero_admin ON public.patrocinantes
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY patrocinantes_all_admin ON public.patrocinantes
  FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- patrocinios ----
DROP POLICY IF EXISTS patrocinios_select_cajero_admin ON public.patrocinios;
DROP POLICY IF EXISTS patrocinios_all_admin           ON public.patrocinios;

CREATE POLICY patrocinios_select_cajero_admin ON public.patrocinios
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY patrocinios_all_admin ON public.patrocinios
  FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- notificaciones_caja ----
DROP POLICY IF EXISTS notif_select_cajero_admin   ON public.notificaciones_caja;
DROP POLICY IF EXISTS notif_select_representante  ON public.notificaciones_caja;
DROP POLICY IF EXISTS notif_insert_cajero_admin   ON public.notificaciones_caja;
DROP POLICY IF EXISTS notif_update_cajero         ON public.notificaciones_caja;
DROP POLICY IF EXISTS notif_all_admin             ON public.notificaciones_caja;

CREATE POLICY notif_select_cajero_admin ON public.notificaciones_caja
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY notif_select_representante ON public.notificaciones_caja
  FOR SELECT USING (
    get_user_role() = 'representante' AND familia_id = get_user_familia_id()
  );

CREATE POLICY notif_insert_cajero_admin ON public.notificaciones_caja
  FOR INSERT WITH CHECK (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY notif_update_cajero ON public.notificaciones_caja
  FOR UPDATE
  USING (get_user_role() = 'cajero')
  WITH CHECK (get_user_role() = 'cajero');

CREATE POLICY notif_all_admin ON public.notificaciones_caja
  FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- tareas_caja ----
DROP POLICY IF EXISTS tareas_select_own_cajero   ON public.tareas_caja;
DROP POLICY IF EXISTS tareas_insert_cajero_admin ON public.tareas_caja;
DROP POLICY IF EXISTS tareas_update_own_cajero   ON public.tareas_caja;
DROP POLICY IF EXISTS tareas_all_admin           ON public.tareas_caja;

CREATE POLICY tareas_select_own_cajero ON public.tareas_caja
  FOR SELECT USING (
    get_user_role() = 'cajero' AND asignado_a = auth.uid()
  );

CREATE POLICY tareas_insert_cajero_admin ON public.tareas_caja
  FOR INSERT WITH CHECK (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY tareas_update_own_cajero ON public.tareas_caja
  FOR UPDATE
  USING (get_user_role() = 'cajero' AND asignado_a = auth.uid())
  WITH CHECK (get_user_role() = 'cajero' AND asignado_a = auth.uid());

CREATE POLICY tareas_all_admin ON public.tareas_caja
  FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- minutas ----
DROP POLICY IF EXISTS minutas_select_cajero       ON public.minutas;
DROP POLICY IF EXISTS minutas_select_admin        ON public.minutas;
DROP POLICY IF EXISTS minutas_insert_cajero_admin ON public.minutas;
DROP POLICY IF EXISTS minutas_update_admin        ON public.minutas;

CREATE POLICY minutas_select_cajero ON public.minutas
  FOR SELECT USING (
    get_user_role() = 'cajero' AND visibilidad IN ('cajero', 'todos')
  );

CREATE POLICY minutas_select_admin ON public.minutas
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY minutas_insert_cajero_admin ON public.minutas
  FOR INSERT WITH CHECK (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY minutas_update_admin ON public.minutas
  FOR UPDATE
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- hilos_mensajes ----
DROP POLICY IF EXISTS hilos_select_cajero_admin ON public.hilos_mensajes;
DROP POLICY IF EXISTS hilos_insert_cajero_admin ON public.hilos_mensajes;
DROP POLICY IF EXISTS hilos_all_admin           ON public.hilos_mensajes;

CREATE POLICY hilos_select_cajero_admin ON public.hilos_mensajes
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY hilos_insert_cajero_admin ON public.hilos_mensajes
  FOR INSERT WITH CHECK (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY hilos_all_admin ON public.hilos_mensajes
  FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- mensajes_internos ----
DROP POLICY IF EXISTS mensajes_select_cajero_admin ON public.mensajes_internos;
DROP POLICY IF EXISTS mensajes_insert_cajero_admin ON public.mensajes_internos;

CREATE POLICY mensajes_select_cajero_admin ON public.mensajes_internos
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY mensajes_insert_cajero_admin ON public.mensajes_internos
  FOR INSERT WITH CHECK (get_user_role() IN ('cajero', 'admin'));

-- ---- campanas_pago ----
DROP POLICY IF EXISTS campanas_select_activa_cajero ON public.campanas_pago;
DROP POLICY IF EXISTS campanas_all_admin            ON public.campanas_pago;

CREATE POLICY campanas_select_activa_cajero ON public.campanas_pago
  FOR SELECT USING (get_user_role() = 'cajero' AND activa = true);

CREATE POLICY campanas_all_admin ON public.campanas_pago
  FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- campana_participaciones ----
DROP POLICY IF EXISTS campana_part_select_cajero_admin ON public.campana_participaciones;
DROP POLICY IF EXISTS campana_part_insert_cajero_admin ON public.campana_participaciones;
DROP POLICY IF EXISTS campana_part_all_admin           ON public.campana_participaciones;

CREATE POLICY campana_part_select_cajero_admin ON public.campana_participaciones
  FOR SELECT USING (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY campana_part_insert_cajero_admin ON public.campana_participaciones
  FOR INSERT WITH CHECK (get_user_role() IN ('cajero', 'admin'));

CREATE POLICY campana_part_all_admin ON public.campana_participaciones
  FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ---- push_subscriptions: users own their subscriptions ----
DROP POLICY IF EXISTS push_own_user ON public.push_subscriptions;
CREATE POLICY push_own_user ON public.push_subscriptions
  FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- ============================================================
-- Section 14: Triggers (T-1-13)
-- ============================================================

DROP TRIGGER IF EXISTS trg_verificar_stock_minimo ON public.accesorios;
CREATE TRIGGER trg_verificar_stock_minimo
  AFTER UPDATE OF stock_actual ON public.accesorios
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_verificar_stock_minimo();

-- ============================================================
-- Section 15: Rollback Block (T-1-17)
-- ============================================================

-- ROLLBACK ORDER (reverse FK dependency order):
--
-- DROP TRIGGER IF EXISTS trg_verificar_stock_minimo ON public.accesorios;
--
-- DROP TABLE IF EXISTS
--   public.push_subscriptions,
--   public.campana_participaciones,
--   public.campanas_pago,
--   public.mensajes_internos,
--   public.hilos_mensajes,
--   public.minutas,
--   public.tareas_caja,
--   public.notificaciones_caja,
--   public.patrocinios,
--   public.patrocinantes,
--   public.score_compromiso,
--   public.compromisos_pago,
--   public.autorizaciones_accesorio,
--   public.accesorio_asignaciones,
--   public.accesorios,
--   public.becas,
--   public.exoneraciones,
--   public.wallet_config,
--   public.wallet_movimientos,
--   public.pagos,
--   public.cuotas,
--   public.representantes,
--   public.familias
-- CASCADE;
--
-- ALTER TABLE public.alumnos
--   DROP COLUMN IF EXISTS familia_id,
--   DROP COLUMN IF EXISTS mora_flag,
--   DROP COLUMN IF EXISTS bloqueo_certificado,
--   DROP COLUMN IF EXISTS bloqueo_evento,
--   DROP COLUMN IF EXISTS abandono_score;
--
-- DROP FUNCTION IF EXISTS
--   public.fn_generar_ciclo_cuotas(int, int),
--   public.fn_aplicar_becas_ciclo(int, int),
--   public.fn_calcular_score_representante(uuid, int, int),
--   public.fn_verificar_stock_minimo(),
--   public.fn_escalar_mora(),
--   public.fn_hermes_update_notif(uuid, text, text),
--   public.get_user_role(),
--   public.get_user_familia_id()
-- CASCADE;
--
-- DROP TYPE IF EXISTS
--   cuota_estado, metodo_pago, wallet_tipo, wallet_origen, wallet_modo,
--   exoneracion_tipo, asignacion_estado,
--   notif_tipo, notif_canal, notif_prioridad, notif_estado_wa, notif_estado_portal,
--   tarea_tipo, tarea_estado, tarea_prioridad,
--   patrocinante_tipo, patrocinio_cubre,
--   mensaje_tipo, minuta_visibilidad
-- CASCADE;
