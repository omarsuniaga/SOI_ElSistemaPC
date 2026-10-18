-- ════════════════════════════════════════════════════════════════════════════
-- 20261018120000_documentos_publicos_qr.sql
--
-- Módulo "Documentos públicos y códigos QR": publicaciones con URL permanente,
-- versionado de archivos, auditoría y un bucket de Storage EXCLUSIVO.
-- Especificación: docs/specs/documentos-publicos-qr/ESPECIFICACION.md
-- Rollback      : supabase/rollback/20261018120000_documentos_publicos_qr.rollback.sql
-- Pruebas       : supabase/tests/documentos-qr/ (npm run test:db:documentos-qr)
--
-- R1 · ESCRITORES (viajan en esta misma migración + src/modules/documentos-publicos/api):
--   publicaciones_documentos            ← crear_/actualizar_/cambiar_estado_ publicacion_documento
--   publicaciones_documentos_versiones  ← registrar_version_documento / activar_version_documento
--   publicaciones_documentos_eventos    ← las mismas RPC (auditoría append-only)
--   Primera fila real: la produce un admin/superadmin al crear la primera publicación en el
--   panel "Documentos públicos" (ruta admin 'documentos-publicos'), tras desplegar el frontend.
-- R2 · El bucle se cierra: cada acción administrativa deja un evento; la lectura pública
--   queda sujeta a que la publicación esté 'publicado' (despublicar corta el acceso nuevo).
-- R5 · Trazabilidad: versiones guardan sha256, tamaño, autor y fecha; eventos guardan actor.
--
-- AUTORIZACIÓN: soi_security.has_role(ARRAY['admin','superadmin']) (existente en producción,
-- exige profiles.estado='activo' y activo IS TRUE). NO usa permisos_maestros ni es_admin()
-- (este último incluye 'inventarista'). NO depende de tiene_capacidad_academica ni de
-- es_admin_estricto: las ramas de seguridad paralelas no son prerrequisito.
--
-- ESCRITURA: solo mediante RPC SECURITY DEFINER. Los roles API no tienen INSERT/UPDATE/DELETE
-- sobre las tablas (mínimo privilegio, auditoría garantizada).
--
-- STORAGE: bucket 'soi-publico' PRIVADO + política de lectura para anon limitada a la
-- versión vigente de publicaciones en estado 'publicado'. (Un bucket public=true serviría
-- cualquier objeto por /object/public/ sin consultar RLS: no podría restringirse a lo publicado.)
-- NO toca los buckets documentos / signage / instrumentos-fotos ni sus políticas.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 0. Autorización (punto único de cambio) ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.puede_gestionar_documentos_publicos()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT soi_security.has_role(ARRAY['admin', 'superadmin']) $$;

REVOKE ALL ON FUNCTION public.puede_gestionar_documentos_publicos() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.puede_gestionar_documentos_publicos() TO authenticated, service_role;

-- ── 1. Tablas ───────────────────────────────────────────────────────────────
CREATE TABLE public.publicaciones_documentos (
  -- policy:exento-institucion_id razón: producción no tiene tabla instituciones ni ninguna columna institucion_id; SOI opera una sola organización por despliegue. Se añadirá cuando exista el modelo multi-institución (plan en docs/specs/documentos-publicos-qr/ESPECIFICACION.md §R3).
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(slug) BETWEEN 3 AND 60),
  titulo            text NOT NULL CHECK (char_length(btrim(titulo)) BETWEEN 3 AND 160),
  descripcion       text CHECK (descripcion IS NULL OR char_length(descripcion) <= 2000),
  fecha_documento   date NOT NULL DEFAULT current_date,
  categoria         text NOT NULL DEFAULT 'general' CHECK (categoria ~ '^[a-z0-9_]{2,40}$'),
  estado            text NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado', 'archivado')),
  version_actual_id uuid,
  published_at      timestamptz,
  archived_at       timestamptz,
  created_by        uuid NOT NULL REFERENCES auth.users(id),
  updated_by        uuid NOT NULL REFERENCES auth.users(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT publicado_requiere_version CHECK (estado <> 'publicado' OR version_actual_id IS NOT NULL)
);

CREATE TABLE public.publicaciones_documentos_versiones (
  -- policy:exento-institucion_id razón: tabla hija de publicaciones_documentos (hereda su alcance); ver exención de la tabla padre.
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publicacion_id   uuid NOT NULL REFERENCES public.publicaciones_documentos(id) ON DELETE RESTRICT,
  numero           integer NOT NULL CHECK (numero >= 1),
  storage_path     text NOT NULL UNIQUE,
  mime_type        text NOT NULL CHECK (mime_type IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')),
  extension        text NOT NULL CHECK (extension IN ('pdf', 'jpg', 'png', 'webp')),
  size_bytes       bigint NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 10485760),
  sha256           text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  nombre_original  text NOT NULL CHECK (char_length(nombre_original) BETWEEN 1 AND 255),
  motivo           text CHECK (motivo IS NULL OR char_length(motivo) <= 500),
  created_by       uuid NOT NULL REFERENCES auth.users(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (publicacion_id, numero)
);

ALTER TABLE public.publicaciones_documentos
  ADD CONSTRAINT publicaciones_documentos_version_actual_fk
  FOREIGN KEY (version_actual_id) REFERENCES public.publicaciones_documentos_versiones(id) ON DELETE RESTRICT;

CREATE TABLE public.publicaciones_documentos_eventos (
  -- policy:exento-institucion_id razón: bitácora hija de publicaciones_documentos (hereda su alcance); ver exención de la tabla padre.
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  publicacion_id uuid NOT NULL REFERENCES public.publicaciones_documentos(id) ON DELETE RESTRICT,
  accion         text NOT NULL CHECK (accion IN ('crear', 'actualizar', 'nueva_version', 'activar_version', 'publicar', 'despublicar', 'archivar', 'restaurar')),
  actor_id       uuid NOT NULL REFERENCES auth.users(id),
  detalle        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pub_doc_estado_fecha ON public.publicaciones_documentos (estado, fecha_documento DESC);
CREATE INDEX idx_pub_doc_ver_pub ON public.publicaciones_documentos_versiones (publicacion_id, numero DESC);
CREATE INDEX idx_pub_doc_ev_pub ON public.publicaciones_documentos_eventos (publicacion_id, created_at DESC);

-- Versiones y eventos son append-only también frente a service_role / dueño.
CREATE OR REPLACE FUNCTION public.publicaciones_documentos_inmutable()
RETURNS trigger LANGUAGE plpgsql SET search_path = ''
AS $$ BEGIN RAISE EXCEPTION 'publicaciones_documentos: % es append-only', TG_TABLE_NAME USING ERRCODE = '42501'; END $$;

CREATE TRIGGER trg_pub_doc_ver_inmutable BEFORE UPDATE OR DELETE ON public.publicaciones_documentos_versiones
  FOR EACH ROW EXECUTE FUNCTION public.publicaciones_documentos_inmutable();
CREATE TRIGGER trg_pub_doc_ev_inmutable BEFORE UPDATE OR DELETE ON public.publicaciones_documentos_eventos
  FOR EACH ROW EXECUTE FUNCTION public.publicaciones_documentos_inmutable();

-- ── 2. RLS y privilegios de tabla ───────────────────────────────────────────
ALTER TABLE public.publicaciones_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicaciones_documentos_versiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicaciones_documentos_eventos ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.publicaciones_documentos, public.publicaciones_documentos_versiones,
              public.publicaciones_documentos_eventos FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.publicaciones_documentos, public.publicaciones_documentos_versiones,
                public.publicaciones_documentos_eventos TO authenticated;
GRANT ALL ON public.publicaciones_documentos, public.publicaciones_documentos_versiones,
             public.publicaciones_documentos_eventos TO service_role;

CREATE POLICY pub_doc_admin_select ON public.publicaciones_documentos
  FOR SELECT TO authenticated USING (public.puede_gestionar_documentos_publicos());
CREATE POLICY pub_doc_ver_admin_select ON public.publicaciones_documentos_versiones
  FOR SELECT TO authenticated USING (public.puede_gestionar_documentos_publicos());
CREATE POLICY pub_doc_ev_admin_select ON public.publicaciones_documentos_eventos
  FOR SELECT TO authenticated USING (public.puede_gestionar_documentos_publicos());

-- ── 3. RPC administrativas (únicas vías de escritura) ───────────────────────
-- p_slug opcional: identificador legible y PERMANENTE (p. ej. 'concierto-navidad-2026'). Si se omite se
-- genera uno aleatorio de 10 caracteres. No puede cambiarse después (el QR impreso depende de él).
CREATE OR REPLACE FUNCTION public.crear_publicacion_documento(
  p_titulo text, p_descripcion text, p_fecha date, p_categoria text, p_slug text DEFAULT NULL)
RETURNS public.publicaciones_documentos
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_row public.publicaciones_documentos;
  v_slug text;
  v_try int := 0;
BEGIN
  IF NOT public.puede_gestionar_documentos_publicos() THEN
    RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
  END IF;
  IF nullif(btrim(coalesce(p_slug, '')), '') IS NOT NULL THEN
    v_slug := lower(btrim(p_slug));
    IF v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' OR char_length(v_slug) NOT BETWEEN 3 AND 60 THEN
      RAISE EXCEPTION 'Identificador inválido: use de 3 a 60 letras minúsculas, números y guiones' USING ERRCODE = '22023';
    END IF;
    IF EXISTS (SELECT 1 FROM public.publicaciones_documentos WHERE slug = v_slug) THEN
      RAISE EXCEPTION 'Ese identificador ya está en uso' USING ERRCODE = '23505';
    END IF;
  ELSE
    LOOP
      v_slug := substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.publicaciones_documentos WHERE slug = v_slug);
      v_try := v_try + 1;
      IF v_try > 10 THEN RAISE EXCEPTION 'No se pudo generar un identificador único'; END IF;
    END LOOP;
  END IF;
  INSERT INTO public.publicaciones_documentos
    (slug, titulo, descripcion, fecha_documento, categoria, created_by, updated_by)
  VALUES (v_slug, btrim(p_titulo), nullif(btrim(coalesce(p_descripcion, '')), ''),
          coalesce(p_fecha, current_date), coalesce(nullif(btrim(p_categoria), ''), 'general'),
          auth.uid(), auth.uid())
  RETURNING * INTO v_row;
  INSERT INTO public.publicaciones_documentos_eventos (publicacion_id, accion, actor_id, detalle)
  VALUES (v_row.id, 'crear', auth.uid(), jsonb_build_object('slug', v_row.slug, 'titulo', v_row.titulo));
  RETURN v_row;
END $$;

CREATE OR REPLACE FUNCTION public.actualizar_publicacion_documento(
  p_id uuid, p_titulo text, p_descripcion text, p_fecha date, p_categoria text)
RETURNS public.publicaciones_documentos
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_old public.publicaciones_documentos; v_row public.publicaciones_documentos;
BEGIN
  IF NOT public.puede_gestionar_documentos_publicos() THEN
    RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_old FROM public.publicaciones_documentos WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Publicación inexistente' USING ERRCODE = 'P0002'; END IF;
  UPDATE public.publicaciones_documentos SET
    titulo = btrim(p_titulo),
    descripcion = nullif(btrim(coalesce(p_descripcion, '')), ''),
    fecha_documento = coalesce(p_fecha, fecha_documento),
    categoria = coalesce(nullif(btrim(p_categoria), ''), categoria),
    updated_by = auth.uid(), updated_at = now()
  WHERE id = p_id RETURNING * INTO v_row;
  INSERT INTO public.publicaciones_documentos_eventos (publicacion_id, accion, actor_id, detalle)
  VALUES (p_id, 'actualizar', auth.uid(), jsonb_build_object(
    'antes', jsonb_build_object('titulo', v_old.titulo, 'descripcion', v_old.descripcion, 'fecha_documento', v_old.fecha_documento, 'categoria', v_old.categoria),
    'despues', jsonb_build_object('titulo', v_row.titulo, 'descripcion', v_row.descripcion, 'fecha_documento', v_row.fecha_documento, 'categoria', v_row.categoria)));
  RETURN v_row;
END $$;

-- Registra un archivo YA subido como nueva versión vigente (subida inicial o reemplazo).
-- La URL pública y el QR (slug) no cambian. Verifica contra storage.objects que el archivo
-- existe y que tamaño/MIME almacenados coinciden con lo declarado.
CREATE OR REPLACE FUNCTION public.registrar_version_documento(
  p_publicacion_id uuid, p_storage_path text, p_mime text, p_size bigint,
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
  IF NOT public.puede_gestionar_documentos_publicos() THEN
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
          p_nombre_original, nullif(btrim(coalesce(p_motivo, '')), ''), auth.uid())
  RETURNING * INTO v_ver;
  UPDATE public.publicaciones_documentos
     SET version_actual_id = v_ver.id, updated_by = auth.uid(), updated_at = now()
   WHERE id = p_publicacion_id;
  INSERT INTO public.publicaciones_documentos_eventos (publicacion_id, accion, actor_id, detalle)
  VALUES (p_publicacion_id, 'nueva_version', auth.uid(),
          jsonb_build_object('version', v_num, 'sha256', p_sha256, 'size_bytes', p_size, 'mime', p_mime, 'motivo', p_motivo));
  RETURN v_ver;
END $$;

CREATE OR REPLACE FUNCTION public.activar_version_documento(p_publicacion_id uuid, p_version_id uuid)
RETURNS public.publicaciones_documentos
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_pub public.publicaciones_documentos; v_ver public.publicaciones_documentos_versiones;
BEGIN
  IF NOT public.puede_gestionar_documentos_publicos() THEN
    RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_pub FROM public.publicaciones_documentos WHERE id = p_publicacion_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Publicación inexistente' USING ERRCODE = 'P0002'; END IF;
  IF v_pub.estado = 'archivado' THEN
    RAISE EXCEPTION 'Una publicación archivada no admite cambios de versión' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_ver FROM public.publicaciones_documentos_versiones
   WHERE id = p_version_id AND publicacion_id = p_publicacion_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'La versión no pertenece a la publicación' USING ERRCODE = 'P0002'; END IF;
  UPDATE public.publicaciones_documentos
     SET version_actual_id = p_version_id, updated_by = auth.uid(), updated_at = now()
   WHERE id = p_publicacion_id RETURNING * INTO v_pub;
  INSERT INTO public.publicaciones_documentos_eventos (publicacion_id, accion, actor_id, detalle)
  VALUES (p_publicacion_id, 'activar_version', auth.uid(), jsonb_build_object('version', v_ver.numero));
  RETURN v_pub;
END $$;

-- Transiciones: borrador→publicado (exige versión), publicado→borrador (despublicar),
-- borrador|publicado→archivado, archivado→borrador (restaurar). Nada más.
CREATE OR REPLACE FUNCTION public.cambiar_estado_publicacion_documento(p_id uuid, p_estado text)
RETURNS public.publicaciones_documentos
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_pub public.publicaciones_documentos; v_accion text;
BEGIN
  IF NOT public.puede_gestionar_documentos_publicos() THEN
    RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_pub FROM public.publicaciones_documentos WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Publicación inexistente' USING ERRCODE = 'P0002'; END IF;
  v_accion := CASE
    WHEN v_pub.estado = 'borrador'  AND p_estado = 'publicado' THEN 'publicar'
    WHEN v_pub.estado = 'publicado' AND p_estado = 'borrador'  THEN 'despublicar'
    WHEN v_pub.estado IN ('borrador', 'publicado') AND p_estado = 'archivado' THEN 'archivar'
    WHEN v_pub.estado = 'archivado' AND p_estado = 'borrador'  THEN 'restaurar'
    ELSE NULL END;
  IF v_accion IS NULL THEN
    RAISE EXCEPTION 'Transición no permitida: % → %', v_pub.estado, p_estado USING ERRCODE = '22023';
  END IF;
  IF p_estado = 'publicado' AND v_pub.version_actual_id IS NULL THEN
    RAISE EXCEPTION 'No se puede publicar sin un documento cargado' USING ERRCODE = '22023';
  END IF;
  UPDATE public.publicaciones_documentos SET
    estado = p_estado,
    published_at = CASE WHEN p_estado = 'publicado' THEN now() ELSE published_at END,
    archived_at = CASE WHEN p_estado = 'archivado' THEN now() WHEN p_estado = 'borrador' THEN NULL ELSE archived_at END,
    updated_by = auth.uid(), updated_at = now()
  WHERE id = p_id RETURNING * INTO v_pub;
  INSERT INTO public.publicaciones_documentos_eventos (publicacion_id, accion, actor_id, detalle)
  VALUES (p_id, v_accion, auth.uid(), jsonb_build_object('estado', p_estado));
  RETURN v_pub;
END $$;

-- ── 4. Lectura pública (única superficie para anon) ─────────────────────────
-- Devuelve solo publicaciones 'publicado' y su versión vigente. No expone created_by,
-- updated_by, sha256 ni datos de otras versiones.
CREATE OR REPLACE FUNCTION public.obtener_publicacion_publica(p_slug text)
RETURNS TABLE (slug text, titulo text, descripcion text, fecha_documento date, categoria text,
               published_at timestamptz, version_numero int, mime_type text, extension text,
               size_bytes bigint, storage_path text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT p.slug, p.titulo, p.descripcion, p.fecha_documento, p.categoria, p.published_at,
         v.numero, v.mime_type, v.extension, v.size_bytes, v.storage_path
    FROM public.publicaciones_documentos p
    JOIN public.publicaciones_documentos_versiones v ON v.id = p.version_actual_id
   WHERE p.slug = p_slug AND p.estado = 'publicado'
$$;

-- Biblioteca pública (/qr-code): SOLO publicaciones 'publicado' y su versión vigente. No devuelve la ruta
-- del objeto ni versiones anteriores, borradores o archivadas. Paginada y acotada (máx. 100 por llamada).
CREATE OR REPLACE FUNCTION public.listar_publicaciones_publicas(p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
RETURNS TABLE (slug text, titulo text, descripcion text, fecha_documento date, categoria text,
               published_at timestamptz, version_numero int, mime_type text, extension text, size_bytes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT p.slug, p.titulo, p.descripcion, p.fecha_documento, p.categoria, p.published_at,
         v.numero, v.mime_type, v.extension, v.size_bytes
    FROM public.publicaciones_documentos p
    JOIN public.publicaciones_documentos_versiones v ON v.id = p.version_actual_id
   WHERE p.estado = 'publicado'
   ORDER BY p.fecha_documento DESC, p.published_at DESC, p.slug
   LIMIT least(greatest(coalesce(p_limit, 50), 1), 100)
  OFFSET greatest(coalesce(p_offset, 0), 0)
$$;

-- Usada por la política de Storage: ¿este objeto es la versión vigente de algo publicado?
CREATE OR REPLACE FUNCTION public.storage_objeto_publicado(p_name text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.publicaciones_documentos p
      JOIN public.publicaciones_documentos_versiones v ON v.id = p.version_actual_id
     WHERE p.estado = 'publicado' AND v.storage_path = p_name)
$$;

REVOKE ALL ON FUNCTION
  public.crear_publicacion_documento(text, text, date, text, text),
  public.actualizar_publicacion_documento(uuid, text, text, date, text),
  public.registrar_version_documento(uuid, text, text, bigint, text, text, text),
  public.activar_version_documento(uuid, uuid),
  public.cambiar_estado_publicacion_documento(uuid, text),
  public.publicaciones_documentos_inmutable()
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION
  public.crear_publicacion_documento(text, text, date, text, text),
  public.actualizar_publicacion_documento(uuid, text, text, date, text),
  public.registrar_version_documento(uuid, text, text, bigint, text, text, text),
  public.activar_version_documento(uuid, uuid),
  public.cambiar_estado_publicacion_documento(uuid, text)
  TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.obtener_publicacion_publica(text), public.listar_publicaciones_publicas(integer, integer), public.storage_objeto_publicado(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.obtener_publicacion_publica(text), public.listar_publicaciones_publicas(integer, integer), public.storage_objeto_publicado(text)
  TO anon, authenticated, service_role;

-- ── 5. Bucket exclusivo y políticas de storage.objects ──────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('soi-publico', 'soi-publico', false, 10485760,
        ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = false, file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS docs_publicos_select_publicado ON storage.objects;
DROP POLICY IF EXISTS docs_publicos_select_admin     ON storage.objects;
DROP POLICY IF EXISTS docs_publicos_insert_admin     ON storage.objects;
DROP POLICY IF EXISTS docs_publicos_delete_huerfano  ON storage.objects;

-- Lectura de cualquiera (anon incluido): solo la versión vigente de lo publicado.
CREATE POLICY docs_publicos_select_publicado ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'soi-publico' AND public.storage_objeto_publicado(name));

-- Administración: ver cualquier objeto del bucket (borradores, versiones anteriores).
CREATE POLICY docs_publicos_select_admin ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'soi-publico' AND public.puede_gestionar_documentos_publicos());

-- Subida: solo administración, ruta <publicacion_id>/<uuid>.<ext> y publicación existente.
-- No hay política UPDATE (sin upsert/sobrescritura: cada versión es un objeto nuevo).
CREATE POLICY docs_publicos_insert_admin ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'soi-publico'
    AND public.puede_gestionar_documentos_publicos()
    AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|jpg|png|webp)$'
    AND EXISTS (SELECT 1 FROM public.publicaciones_documentos p
                 WHERE p.id::text = (storage.foldername(name))[1])
  );

-- Borrado: solo superadmin y solo objetos huérfanos (subidas fallidas sin versión registrada).
-- Las versiones registradas son historial y no se pueden borrar.
CREATE POLICY docs_publicos_delete_huerfano ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'soi-publico'
    AND soi_security.has_role(ARRAY['superadmin'])
    AND NOT EXISTS (SELECT 1 FROM public.publicaciones_documentos_versiones v WHERE v.storage_path = name)
  );

COMMIT;
