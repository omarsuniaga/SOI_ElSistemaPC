-- ════════════════════════════════════════════════════════════════════════════
-- staged/20261018130000_documentos_publicos_verificacion_servidor.sql   (ETAPA 2 — NO ESTA EN supabase/migrations A PROPOSITO)
-- Se mueve a supabase/migrations solo cuando la Edge Function esté desplegada.
--
-- Cierra la brecha "la firma del archivo solo se valida en el cliente":
-- el registro de una versión pasa a hacerse únicamente desde la Edge Function
-- `registrar-version-documento`, que descarga el objeto con service_role, comprueba su firma
-- (magic bytes), calcula el SHA-256 real y solo entonces llama a la RPC verificada.
--
-- PRERREQUISITOS (en este orden):
--   1. 20261018120000_documentos_publicos_qr.sql aplicada.
--   2. Edge Function `registrar-version-documento` DESPLEGADA y probada
--      (supabase/functions/registrar-version-documento).
--   3. Frontend con VITE_DOCS_SERVER_VERIFY=true desplegado.
-- Si se aplica antes del paso 2/3, el panel no podrá registrar versiones (la RPC directa queda
-- revocada para `authenticated`); la reversión es inmediata con el rollback.
--
-- Efecto: un administrador que llame a la API directamente ya no puede registrar (y por tanto
-- publicar) un objeto cuyo contenido no sea PDF/JPG/PNG/WebP real. Un objeto subido y nunca
-- registrado jamás es legible por el público (la política exige versión vigente publicada).
--
-- R1: el escritor de las filas sigue siendo el mismo flujo (panel → Edge Function → RPC).
-- Rollback: supabase/rollback/20261018130000_documentos_publicos_verificacion_servidor.rollback.sql
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- Núcleo: misma lógica que registrar_version_documento, con el actor explícito (service_role no
-- tiene auth.uid()). El actor debe ser admin/superadmin ACTIVO según profiles.
CREATE OR REPLACE FUNCTION public._registrar_version_documento_core(
  p_actor uuid, p_publicacion_id uuid, p_storage_path text, p_mime text, p_size bigint,
  p_sha256 text, p_nombre_original text, p_motivo text)
RETURNS public.publicaciones_documentos_versiones
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_pub public.publicaciones_documentos;
  v_obj record;
  v_ext text;
  v_num int;
  v_ver public.publicaciones_documentos_versiones;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.profiles p
     WHERE p.id = p_actor AND p.estado = 'activo' AND p.activo IS TRUE AND p.rol IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_pub FROM public.publicaciones_documentos WHERE id = p_publicacion_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Publicación inexistente' USING ERRCODE = 'P0002'; END IF;
  IF v_pub.estado = 'archivado' THEN
    RAISE EXCEPTION 'Una publicación archivada no admite nuevas versiones; restáurela primero' USING ERRCODE = '22023';
  END IF;
  IF p_storage_path !~ ('^' || p_publicacion_id::text || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|jpg|png|webp)$') THEN
    RAISE EXCEPTION 'Ruta de archivo inválida' USING ERRCODE = '22023';
  END IF;
  v_ext := substring(p_storage_path from '\.([a-z]+)$');
  IF (v_ext, p_mime) NOT IN (('pdf','application/pdf'), ('jpg','image/jpeg'), ('png','image/png'), ('webp','image/webp')) THEN
    RAISE EXCEPTION 'Extensión y tipo MIME no coinciden' USING ERRCODE = '22023';
  END IF;
  SELECT o.name, o.metadata INTO v_obj FROM storage.objects o
   WHERE o.bucket_id = 'soi-publico' AND o.name = p_storage_path;
  IF NOT FOUND THEN RAISE EXCEPTION 'El archivo no existe en el almacenamiento' USING ERRCODE = 'P0002'; END IF;
  IF coalesce((v_obj.metadata ->> 'size')::bigint, -1) <> p_size
     OR coalesce(v_obj.metadata ->> 'mimetype', '') <> p_mime THEN
    RAISE EXCEPTION 'El tamaño o tipo declarado no coincide con el archivo almacenado' USING ERRCODE = '22023';
  END IF;
  SELECT coalesce(max(numero), 0) + 1 INTO v_num
    FROM public.publicaciones_documentos_versiones WHERE publicacion_id = p_publicacion_id;
  INSERT INTO public.publicaciones_documentos_versiones
    (publicacion_id, numero, storage_path, mime_type, extension, size_bytes, sha256, nombre_original, motivo, created_by)
  VALUES (p_publicacion_id, v_num, p_storage_path, p_mime, v_ext, p_size, p_sha256,
          p_nombre_original, nullif(btrim(coalesce(p_motivo, '')), ''), p_actor)
  RETURNING * INTO v_ver;
  UPDATE public.publicaciones_documentos
     SET version_actual_id = v_ver.id, updated_by = p_actor, updated_at = now()
   WHERE id = p_publicacion_id;
  INSERT INTO public.publicaciones_documentos_eventos (publicacion_id, accion, actor_id, detalle)
  VALUES (p_publicacion_id, 'nueva_version', p_actor,
          jsonb_build_object('version', v_num, 'sha256', p_sha256, 'size_bytes', p_size, 'mime', p_mime, 'motivo', p_motivo, 'verificada_en_servidor', true));
  RETURN v_ver;
END $$;

-- Entrada para la Edge Function (única que puede llamarla): solo service_role.
CREATE OR REPLACE FUNCTION public.registrar_version_documento_verificada(
  p_actor uuid, p_publicacion_id uuid, p_storage_path text, p_mime text, p_size bigint,
  p_sha256 text, p_nombre_original text, p_motivo text)
RETURNS public.publicaciones_documentos_versiones
LANGUAGE sql SECURITY DEFINER SET search_path = ''
AS $$ SELECT * FROM public._registrar_version_documento_core(p_actor, p_publicacion_id, p_storage_path, p_mime, p_size, p_sha256, p_nombre_original, p_motivo) $$;

REVOKE ALL ON FUNCTION public._registrar_version_documento_core(uuid, uuid, text, text, bigint, text, text, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.registrar_version_documento_verificada(uuid, uuid, text, text, bigint, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_version_documento_verificada(uuid, uuid, text, text, bigint, text, text, text) TO service_role;

-- La RPC directa (declaración del cliente) deja de estar disponible para los usuarios.
REVOKE EXECUTE ON FUNCTION public.registrar_version_documento(uuid, text, text, bigint, text, text, text) FROM authenticated;

COMMIT;
