-- 20260626_sp2_departamento_luteria.sql
-- SP-2: Luteria como departamento propio (distinto de Logistica/Inventario).
-- Migration aislada (ADD VALUE no transaccional con uso posterior).
ALTER TYPE public.soi_departamento ADD VALUE IF NOT EXISTS 'LUT';
