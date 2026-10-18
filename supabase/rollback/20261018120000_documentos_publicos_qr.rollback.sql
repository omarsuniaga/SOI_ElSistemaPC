-- Rollback de 20261018120000_documentos_publicos_qr.sql
-- DESTRUCTIVO: elimina publicaciones, versiones y bitácora. Las URLs públicas y los QR
-- impresos dejarán de funcionar. Exportar antes si hay datos que conservar.
-- Los archivos del bucket 'soi-publico' NO se borran aquí (hay que vaciarlo por la API de
-- Storage; Supabase prohíbe borrar objetos por SQL). El bucket solo se elimina si está vacío.
-- No toca ningún otro bucket ni política.
BEGIN;

DROP POLICY IF EXISTS docs_publicos_select_publicado ON storage.objects;
DROP POLICY IF EXISTS docs_publicos_select_admin     ON storage.objects;
DROP POLICY IF EXISTS docs_publicos_insert_admin     ON storage.objects;
DROP POLICY IF EXISTS docs_publicos_delete_huerfano  ON storage.objects;

DROP FUNCTION IF EXISTS public.obtener_publicacion_publica(text);
DROP FUNCTION IF EXISTS public.listar_publicaciones_publicas(integer, integer);
DROP FUNCTION IF EXISTS public.storage_objeto_publicado(text);
DROP FUNCTION IF EXISTS public.cambiar_estado_publicacion_documento(uuid, text);
DROP FUNCTION IF EXISTS public.activar_version_documento(uuid, uuid);
DROP FUNCTION IF EXISTS public.registrar_version_documento(uuid, text, text, bigint, text, text, text);
DROP FUNCTION IF EXISTS public.actualizar_publicacion_documento(uuid, text, text, date, text);
DROP FUNCTION IF EXISTS public.crear_publicacion_documento(text, text, date, text, text);

DROP TABLE IF EXISTS public.publicaciones_documentos_eventos;
ALTER TABLE IF EXISTS public.publicaciones_documentos DROP CONSTRAINT IF EXISTS publicaciones_documentos_version_actual_fk;
DROP TABLE IF EXISTS public.publicaciones_documentos_versiones;
DROP TABLE IF EXISTS public.publicaciones_documentos;

DROP FUNCTION IF EXISTS public.publicaciones_documentos_inmutable();
DROP FUNCTION IF EXISTS public.puede_gestionar_documentos_publicos();

DELETE FROM storage.buckets
 WHERE id = 'soi-publico'
   AND NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'soi-publico');

COMMIT;
