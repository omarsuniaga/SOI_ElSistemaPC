-- ============================================================
-- Migration: Enum event_categoria — agregar 'aniversario'
-- Timestamp: 20260814235959 (justo antes de 20260815000000)
-- Description:
--   Agrega el valor 'aniversario' al enum event_categoria en una migración
--   independiente. Postgres exige que ALTER TYPE ... ADD VALUE se ejecute
--   en una transacción SEPARADA del INSERT que consume el nuevo valor,
--   o de lo contrario falla con:
--     ERROR: unsafe use of new value "aniversario" of enum type event_categoria
--
--   El resto del protocolo (INSERT en hermes_protocolos + triggers) vive en
--   la migración inmediatamente posterior 20260815000000_aniversario_protocol.sql.
-- ============================================================

ALTER TYPE event_categoria ADD VALUE IF NOT EXISTS 'aniversario';
