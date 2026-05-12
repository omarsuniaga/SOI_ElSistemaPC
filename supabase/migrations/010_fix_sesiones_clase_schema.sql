-- ============================================================
-- MIGRACIÓN 010: Agregar 'registrada' al CHECK constraint de sesiones_clase.estado
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- ============================================================
-- 
-- CONTEXTO: El portal maestros usa estado='registrada' cuando el maestro
-- finaliza la asistencia, pero el CHECK constraint original no lo incluye.
-- Esto causa un error silencioso al intentar marcar la sesión como registrada.

-- 1. Eliminar el constraint CHECK viejo de 'estado'
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT con.conname INTO constraint_name
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'sesiones_clase'
      AND nsp.nspname = 'public'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%estado%';

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.sesiones_clase DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE '✅ Constraint "%" eliminado', constraint_name;
    ELSE
        RAISE NOTICE '⏭️ No se encontró CHECK constraint en estado';
    END IF;
END $$;

-- 2. Crear nuevo constraint con 'registrada' incluido
ALTER TABLE public.sesiones_clase 
ADD CONSTRAINT sesiones_clase_estado_check 
CHECK (estado = ANY (ARRAY[
    'programada'::text, 
    'abierta'::text, 
    'asistencia_registrada'::text, 
    'progreso_registrado'::text, 
    'cerrada'::text, 
    'pendiente'::text, 
    'atrasada'::text, 
    'cancelada'::text,
    'registrada'::text
]));

-- 3. Verificar
SELECT '✅ CHECK constraint actualizado — "registrada" ahora es válido' as status;
