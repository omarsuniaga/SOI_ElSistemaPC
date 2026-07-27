-- Make familia_id nullable in alumnos table.
-- Column was added with NOT NULL but crearAlumno never received it,
-- causing null constraint violations on student creation.
ALTER TABLE public.alumnos ALTER COLUMN familia_id DROP NOT NULL;
