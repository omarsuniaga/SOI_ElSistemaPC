-- Add unique constraint to asistencias table for (clase_id, alumno_id, fecha)
-- This constraint allows UPSERT operations in registrarAsistenciaBulk()

ALTER TABLE public.asistencias
ADD CONSTRAINT uk_asistencias_clase_alumno_fecha
UNIQUE (clase_id, alumno_id, fecha);
