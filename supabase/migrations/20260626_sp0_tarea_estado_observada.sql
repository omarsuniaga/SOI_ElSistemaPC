-- 20260626_sp0_tarea_estado_observada.sql
-- SP-0: nuevo estado 'observada' en el ciclo de vida de la tarea.
-- Migration AISLADA: ALTER TYPE ADD VALUE no puede usarse en la misma transaccion
-- donde se referencia el nuevo valor (p.ej. fn_observar_tarea).
ALTER TYPE public.tarea_institucional_estado ADD VALUE IF NOT EXISTS 'observada';
