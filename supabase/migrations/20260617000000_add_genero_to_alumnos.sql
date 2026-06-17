-- Migration: Add genero column to public.alumnos
-- Reason: To store student gender, which is used in the admin views and PDF generation.

ALTER TABLE public.alumnos
  ADD COLUMN IF NOT EXISTS genero TEXT CHECK (genero IS NULL OR genero IN ('M', 'F', 'O', 'N'));
