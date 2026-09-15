-- ============================================================================
-- 20260907030000_whatsapp_multidepto_queue.sql
-- SDD whatsapp-gateway-multidepto · F1 (fundación DB multi departamento)
--
-- Agrega `departamento` y `origen` a la cola de salida de WhatsApp. A partir de
-- acá cada fila queda atada a un departamento (ADM, FIN, ...) para que cada
-- instancia del gateway (una app Electron por departamento, con su propio
-- número) reclame únicamente sus mensajes.
--
-- Backfill: toda fila histórica -> 'ADM'. Hasta hoy el sistema operó con un
-- solo número institucional, que pasa a ser el de ADM (ver migración de config
-- 20260907031000).
--
-- Idempotente: ADD COLUMN IF NOT EXISTS + DROP/ADD CONSTRAINT + CREATE INDEX
-- IF NOT EXISTS. Reaplicarla no cambia nada.
-- ============================================================================

BEGIN;

-- 1. Columnas nullable primero, para poder backfillear sin romper filas vivas.
ALTER TABLE public.hermes_whatsapp_queue
  ADD COLUMN IF NOT EXISTS departamento text,
  ADD COLUMN IF NOT EXISTS origen text;

-- 2. Backfill de filas históricas.
UPDATE public.hermes_whatsapp_queue
  SET departamento = 'ADM'
  WHERE departamento IS NULL;

UPDATE public.hermes_whatsapp_queue
  SET origen = CASE
    WHEN campania_envio_id IS NOT NULL THEN 'campania'
    ELSE 'desconocido'
  END
  WHERE origen IS NULL;

-- 3. Defaults + NOT NULL.
--    `departamento` es obligatorio (toda fila pertenece a un depto).
--    `origen` default 'manual' (el productor lo setea explícito cuando encola).
ALTER TABLE public.hermes_whatsapp_queue
  ALTER COLUMN departamento SET DEFAULT 'ADM',
  ALTER COLUMN departamento SET NOT NULL,
  ALTER COLUMN origen SET DEFAULT 'manual',
  ALTER COLUMN origen SET NOT NULL;

-- 4. CHECKs de dominio.
ALTER TABLE public.hermes_whatsapp_queue
  DROP CONSTRAINT IF EXISTS hermes_whatsapp_queue_departamento_check;
ALTER TABLE public.hermes_whatsapp_queue
  ADD CONSTRAINT hermes_whatsapp_queue_departamento_check
  CHECK (departamento IN ('DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO', 'LUT'));

ALTER TABLE public.hermes_whatsapp_queue
  DROP CONSTRAINT IF EXISTS hermes_whatsapp_queue_origen_check;
ALTER TABLE public.hermes_whatsapp_queue
  ADD CONSTRAINT hermes_whatsapp_queue_origen_check
  CHECK (origen IN (
    'r6', 'r7', 'r8', 'campania', 'cobranza', 'manual', 'inbound_optout', 'test', 'desconocido'
  ));

-- 5. Reindexar: el claim y el dedup ahora arrancan por departamento.
--    Índice de claim: (departamento, created_at) WHERE estado='pendiente'.
DROP INDEX IF EXISTS public.idx_hermes_whatsapp_queue_claim;
CREATE INDEX IF NOT EXISTS idx_hermes_whatsapp_queue_claim
  ON public.hermes_whatsapp_queue (departamento, created_at)
  WHERE estado = 'pendiente';

--    Índice de dedup: (departamento, jid, procesado_at DESC) WHERE estado='enviado'.
--    El dedup "1 mensaje por número cada N horas" ahora es por par (jid, departamento):
--    un representante bloqueado por un aviso de ADM igual puede recibir un
--    recordatorio de pago de FIN.
DROP INDEX IF EXISTS public.idx_hermes_whatsapp_queue_jid_sent;
CREATE INDEX IF NOT EXISTS idx_hermes_whatsapp_queue_jid_depto_sent
  ON public.hermes_whatsapp_queue (departamento, jid, procesado_at DESC)
  WHERE estado = 'enviado';

COMMENT ON COLUMN public.hermes_whatsapp_queue.departamento IS
  'Departamento dueño del mensaje. Determina qué instancia del gateway (número + app Electron) lo despacha.';
COMMENT ON COLUMN public.hermes_whatsapp_queue.origen IS
  'Productor que encoló la fila: r6 | r7 | r8 (reglas Hermes) | campania | cobranza | manual | inbound_optout | test | desconocido (backfill de filas históricas).';

COMMIT;
