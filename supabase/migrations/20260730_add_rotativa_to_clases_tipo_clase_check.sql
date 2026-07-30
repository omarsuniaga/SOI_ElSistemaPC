-- Migration: Add 'rotativa' to clases_tipo_clase_check constraint
ALTER TABLE clases DROP CONSTRAINT IF EXISTS clases_tipo_clase_check;

ALTER TABLE clases ADD CONSTRAINT clases_tipo_clase_check 
  CHECK (tipo_clase = ANY (ARRAY[
    'individual'::text, 
    'grupal'::text, 
    'rotativa'::text, 
    'seccional'::text, 
    'orquesta'::text, 
    'coro'::text, 
    'teoria'::text, 
    'preparatoria'::text, 
    'otro'::text
  ]));
