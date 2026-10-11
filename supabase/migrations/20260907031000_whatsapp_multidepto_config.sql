-- ============================================================================
-- 20260907031000_whatsapp_multidepto_config.sql
-- SDD whatsapp-gateway-multidepto · F1 (fundación DB multi departamento)
--
-- `hermes_whatsapp_config` pasa de "una sola fila activa" a "una fila activa por
-- departamento". Cada fila es el registro de una instancia del gateway: número,
-- caps anti-ban, warm-up y ventana horaria de trabajo del departamento.
--
-- Estado real en producción al momento de esta migración: 2 filas con
-- instance_name='soi-main' y activo=true. Una es data de demo sembrada por el
-- botón "Configuración Recomendada" del panel (numero_wid con formato de
-- teléfono legible, gateway_url de placeholder). La otra es la real, con el jid
-- institucional (`...@s.whatsapp.net`). El bloque de deduplicación de abajo se
-- queda con la real y desactiva la de demo.
--
-- Idempotente.
-- ============================================================================

BEGIN;

-- 1. Columnas nuevas.
ALTER TABLE public.hermes_whatsapp_config
  ADD COLUMN IF NOT EXISTS departamento text,
  ADD COLUMN IF NOT EXISTS ventana_inicio time NOT NULL DEFAULT '10:00',
  ADD COLUMN IF NOT EXISTS ventana_fin time NOT NULL DEFAULT '19:00',
  ADD COLUMN IF NOT EXISTS solo_dias_habiles boolean NOT NULL DEFAULT true;

-- 2. Colapsar TODAS las filas activas a una sola (la de ADM). El invariante es
--    "una config activa por departamento" (índice del paso 5), así que no
--    alcanza con deduplicar por instance_name: nos quedamos con UNA sola fila
--    activa en total, priorizando la que tenga un numero_wid con formato de jid
--    real (`...@s.whatsapp.net`) y el updated_at más reciente. El resto se
--    desactiva (no se borra, por si hay que auditar).
WITH ganadora AS (
  SELECT id
  FROM public.hermes_whatsapp_config
  WHERE activo = true
  ORDER BY (numero_wid LIKE '%@s.whatsapp.net') DESC NULLS LAST,
           updated_at DESC NULLS LAST,
           created_at DESC NULLS LAST
  LIMIT 1
)
UPDATE public.hermes_whatsapp_config c
  SET activo = false, updated_at = now()
  WHERE c.activo = true
    AND c.id <> (SELECT id FROM ganadora);

-- 3. La fila activa que sobrevive pasa a ser la de ADM. Si NO había ninguna
--    fila activa, se crea una para ADM (sin número: se vincula por QR después).
UPDATE public.hermes_whatsapp_config
  SET departamento = 'ADM',
      instance_name = 'adm-gateway',
      updated_at = now()
  WHERE activo = true AND departamento IS NULL;

INSERT INTO public.hermes_whatsapp_config
  (gateway_url, instance_name, departamento, activo, numero_nombre, consentimiento_registrado)
SELECT 'baileys-local', 'adm-gateway', 'ADM', true,
       'El Sistema Punta Cana (Administración)', false
WHERE NOT EXISTS (SELECT 1 FROM public.hermes_whatsapp_config WHERE activo = true);

DO $$
DECLARE v_activas int;
BEGIN
  SELECT count(*) INTO v_activas FROM public.hermes_whatsapp_config WHERE activo = true;
  IF v_activas <> 1 THEN
    RAISE EXCEPTION 'whatsapp config multidepto: se esperaba 1 fila activa tras el colapso, hay %', v_activas;
  END IF;
END $$;

-- Reasignar la telemetría histórica a la nueva instancia (si no, los dashboards
-- muestran un hueco hasta el primer heartbeat nuevo). instance_name es UNIQUE:
-- solo renombramos si no existe ya una fila 'adm-gateway'.
UPDATE public.hermes_gateway_health
  SET instance_name = 'adm-gateway'
  WHERE instance_name = 'soi-main'
    AND NOT EXISTS (SELECT 1 FROM public.hermes_gateway_health WHERE instance_name = 'adm-gateway');

-- 4. Filas inactivas históricas: también ADM (el índice único parcial solo mira
--    activo=true, así que no molestan).
UPDATE public.hermes_whatsapp_config
  SET departamento = 'ADM'
  WHERE departamento IS NULL;

ALTER TABLE public.hermes_whatsapp_config
  ALTER COLUMN departamento SET NOT NULL;

ALTER TABLE public.hermes_whatsapp_config
  DROP CONSTRAINT IF EXISTS hermes_whatsapp_config_departamento_check;
ALTER TABLE public.hermes_whatsapp_config
  ADD CONSTRAINT hermes_whatsapp_config_departamento_check
  CHECK (departamento IN ('DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO', 'LUT'));

-- 5. Una sola config activa por departamento.
--    (ADD CONSTRAINT UNIQUE ... WHERE no existe en Postgres -> índice parcial.)
CREATE UNIQUE INDEX IF NOT EXISTS uq_wa_config_depto_activa
  ON public.hermes_whatsapp_config (departamento)
  WHERE activo;

-- 6. FIN nace inactivo y sin número. El equipo de Finanzas lo activa cuando
--    vincula su WhatsApp dedicado (fase F9). numero_wid es UNIQUE pero nullable
--    (múltiples NULL no colisionan en Postgres).
INSERT INTO public.hermes_whatsapp_config
  (gateway_url, instance_name, departamento, activo, numero_nombre, consentimiento_registrado)
SELECT 'baileys-local', 'fin-gateway', 'FIN', false,
       'El Sistema Punta Cana (Finanzas)', false
WHERE NOT EXISTS (
  SELECT 1 FROM public.hermes_whatsapp_config WHERE departamento = 'FIN'
);

COMMENT ON COLUMN public.hermes_whatsapp_config.departamento IS
  'Departamento dueño de esta instancia del gateway. Único por (departamento) entre las filas activas.';
COMMENT ON COLUMN public.hermes_whatsapp_config.ventana_inicio IS
  'Hora local (America/Santo_Domingo) desde la que este departamento puede despachar. Default 10:00.';
COMMENT ON COLUMN public.hermes_whatsapp_config.ventana_fin IS
  'Hora local (America/Santo_Domingo) hasta la que este departamento puede despachar. Default 19:00.';
COMMENT ON COLUMN public.hermes_whatsapp_config.solo_dias_habiles IS
  'Si true, no se despacha sábados ni domingos. Default true.';

COMMIT;
