-- Verificación rápida del feature maestro-credentials
-- Ejecutar en Supabase SQL Editor por bloques.

-- 1) Confirmar que existe la tabla de vault.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'maestro_access_credentials';

-- 2) Confirmar columnas principales.
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'maestro_access_credentials'
order by ordinal_position;

-- 3) Revisar filas existentes.
select maestro_id, password_version, last_generated_at, last_revealed_at, created_at, updated_at
from public.maestro_access_credentials
order by updated_at desc
limit 20;
