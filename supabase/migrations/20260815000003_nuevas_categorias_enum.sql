-- ============================================================
-- Migration: Nuevas categorías de evento en enum event_categoria
-- Timestamp: 20260815000003
-- Description:
--   Agrega 'audicion_trimestral' y 'ensayo_intensivo' al enum event_categoria.
--   DEBE ejecutarse en transacción separada antes de la migración 000004
--   (limitación de Postgres: ADD VALUE no puede usarse en el mismo bloque
--   de transacción que inserta filas con el nuevo valor).
-- ============================================================

ALTER TYPE event_categoria ADD VALUE IF NOT EXISTS 'audicion_trimestral';
ALTER TYPE event_categoria ADD VALUE IF NOT EXISTS 'ensayo_intensivo';
