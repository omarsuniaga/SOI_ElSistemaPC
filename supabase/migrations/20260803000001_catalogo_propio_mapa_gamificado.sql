-- ============================================================================
-- MAPA GAMIFICADO — Catálogo institucional propio (reemplaza routes/levels/nodes)
-- Fecha: 2026-08-03
--
-- Contexto: el catálogo global anterior (routes -> route_versions -> blocks ->
-- levels -> nodes -> objetivos -> indicators) es infraestructura compartida
-- por 50+ archivos de otros módulos (academic-routes, academic-admin,
-- planning, comunicaciones/boletines, bitacora, portal-maestros/*) y
-- clases.route_version_id es FK directa desde la tabla core `clases`. NO se
-- toca ni se borra esa estructura — se decidió construir un catálogo nuevo,
-- simple y propio del mapa gamificado, sin esas capas intermedias.
--
-- Jerarquía nueva (3 niveles, según diseño del coordinador académico):
--   catalogo_niveles (por instrumento)
--     -> catalogo_objetivos_generales (N por nivel)
--       -> catalogo_objetivos_especificos (N por objetivo general = "indicadores")
--
-- El trigger trg_validar_nivel_asignado_a_clase (migración 20260731000007)
-- exigía una fila activa en acm_active_routes — tabla con 0 filas en
-- producción, así que bloqueaba el 100% de los inserts en
-- clase_mapa_objetivos para cualquier maestro. Se elimina: el nuevo catálogo
-- no usa ese modelo de "asignación de nivel vía matriz ACM", el maestro elige
-- directamente un nivel del catálogo cuyo instrumento coincide con su clase.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLAS DEL CATÁLOGO
-- ----------------------------------------------------------------------------

CREATE TABLE public.catalogo_niveles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       text NOT NULL,
  instrumento  text NOT NULL,
  orden        integer NOT NULL,
  activo       boolean NOT NULL DEFAULT true,
  created_by   uuid REFERENCES public.maestros(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (instrumento, orden)
);

CREATE TABLE public.catalogo_objetivos_generales (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nivel_id     uuid NOT NULL REFERENCES public.catalogo_niveles(id) ON DELETE CASCADE,
  nombre       text NOT NULL,
  descripcion  text,
  orden        integer NOT NULL,
  activo       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (nivel_id, orden)
);

CREATE TABLE public.catalogo_objetivos_especificos (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objetivo_general_id   uuid NOT NULL REFERENCES public.catalogo_objetivos_generales(id) ON DELETE CASCADE,
  nombre                text NOT NULL,
  orden                 integer NOT NULL,
  activo                boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (objetivo_general_id, orden)
);

CREATE INDEX idx_catn_instrumento ON public.catalogo_niveles(instrumento);
CREATE INDEX idx_catog_nivel ON public.catalogo_objetivos_generales(nivel_id);
CREATE INDEX idx_catoe_objetivo_general ON public.catalogo_objetivos_especificos(objetivo_general_id);

CREATE OR REPLACE FUNCTION public.update_catalogo_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_catn_updated_at BEFORE UPDATE ON public.catalogo_niveles
  FOR EACH ROW EXECUTE FUNCTION public.update_catalogo_timestamp();
CREATE TRIGGER trg_catog_updated_at BEFORE UPDATE ON public.catalogo_objetivos_generales
  FOR EACH ROW EXECUTE FUNCTION public.update_catalogo_timestamp();
CREATE TRIGGER trg_catoe_updated_at BEFORE UPDATE ON public.catalogo_objetivos_especificos
  FOR EACH ROW EXECUTE FUNCTION public.update_catalogo_timestamp();

-- ----------------------------------------------------------------------------
-- 2. RLS — lectura para cualquier autenticado, escritura solo admin/ACM
-- ----------------------------------------------------------------------------

ALTER TABLE public.catalogo_niveles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogo_objetivos_generales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogo_objetivos_especificos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalogo_niveles_read" ON public.catalogo_niveles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "catalogo_niveles_admin" ON public.catalogo_niveles
  FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());

CREATE POLICY "catalogo_objetivos_generales_read" ON public.catalogo_objetivos_generales
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "catalogo_objetivos_generales_admin" ON public.catalogo_objetivos_generales
  FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());

CREATE POLICY "catalogo_objetivos_especificos_read" ON public.catalogo_objetivos_especificos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "catalogo_objetivos_especificos_admin" ON public.catalogo_objetivos_especificos
  FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());

-- ----------------------------------------------------------------------------
-- 3. Eliminar el gate roto (acm_active_routes, siempre vacío) que bloqueaba
--    el 100% de los inserts en clase_mapa_objetivos.
-- ----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_validar_nivel_asignado_a_clase ON public.clase_mapa_objetivos;
DROP FUNCTION IF EXISTS public.fn_validar_nivel_asignado_a_clase();

-- ----------------------------------------------------------------------------
-- 4. Repuntear clase_mapa_objetivos / clase_mapa_indicadores al catálogo
--    nuevo. Ambas tablas están vacías en producción (0 filas) — no hay datos
--    que migrar, solo cambiar el destino de los FK.
-- ----------------------------------------------------------------------------

ALTER TABLE public.clase_mapa_objetivos
  DROP CONSTRAINT clase_mapa_objetivos_level_id_fkey,
  DROP CONSTRAINT clase_mapa_objetivos_origen_node_id_fkey,
  DROP CONSTRAINT clase_mapa_objetivos_origen_objetivo_id_fkey;

ALTER TABLE public.clase_mapa_objetivos
  ADD CONSTRAINT clase_mapa_objetivos_level_id_fkey
    FOREIGN KEY (level_id) REFERENCES public.catalogo_niveles(id) ON DELETE RESTRICT,
  ADD CONSTRAINT clase_mapa_objetivos_origen_objetivo_id_fkey
    FOREIGN KEY (origen_objetivo_id) REFERENCES public.catalogo_objetivos_generales(id) ON DELETE SET NULL;
-- origen_node_id queda como uuid libre (sin FK): el concepto de "node" no
-- existe en el catálogo nuevo de 3 niveles.

ALTER TABLE public.clase_mapa_indicadores
  DROP CONSTRAINT clase_mapa_indicadores_origen_indicator_id_fkey;

ALTER TABLE public.clase_mapa_indicadores
  ADD CONSTRAINT clase_mapa_indicadores_origen_indicator_id_fkey
    FOREIGN KEY (origen_indicator_id) REFERENCES public.catalogo_objetivos_especificos(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.clase_mapa_objetivos.level_id IS
  'FK a catalogo_niveles (catálogo propio) — ya NO a la tabla levels del árbol curricular viejo.';
COMMENT ON COLUMN public.clase_mapa_objetivos.origen_objetivo_id IS
  'FK a catalogo_objetivos_generales — de qué objetivo general del catálogo se clonó (NULL = autoría 100% del maestro).';
COMMENT ON COLUMN public.clase_mapa_indicadores.origen_indicator_id IS
  'FK a catalogo_objetivos_especificos — de qué indicador del catálogo se clonó (NULL = autoría 100% del maestro).';

-- ----------------------------------------------------------------------------
-- 5. fn_datos_jerarquicos_de_objetivo() usaba levels.level_number para
--    materializar el id_jerarquico ('nivel.objetivo.indicador') — ahora usa
--    catalogo_niveles.orden, mismo rol semántico (posición del nivel).
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fn_datos_jerarquicos_de_objetivo(p_objetivo_id uuid)
RETURNS TABLE(clase_id uuid, level_number integer, orden_objetivo integer)
LANGUAGE sql STABLE AS $$
  SELECT cmo.clase_id, cn.orden, cmo.orden_objetivo
  FROM public.clase_mapa_objetivos cmo
  JOIN public.catalogo_niveles cn ON cn.id = cmo.level_id
  WHERE cmo.id = p_objetivo_id;
$$;

-- ----------------------------------------------------------------------------
-- 6. RPC: clonar_catalogo_a_clase — copia objetivos generales + indicadores
--    de un nivel del catálogo nuevo hacia las tablas class-owned. Reemplaza a
--    clonar_plantilla_a_clase (que dependía de mapa_plantillas + el árbol
--    viejo). No requiere "asignación de nivel" previa vía ACM: cualquier
--    nivel activo del catálogo es clonable directamente por el titular de la
--    clase.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.clonar_catalogo_a_clase(
  p_clase_id uuid,
  p_nivel_id uuid,
  p_objetivo_general_ids uuid[] DEFAULT NULL
)
RETURNS TABLE(
  objetivo_id uuid,
  origen_objetivo_general_id uuid,
  indicador_id uuid,
  origen_objetivo_especifico_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_nivel record;
  v_maestro_id uuid;
  v_next_orden_objetivo integer;
  v_objetivo record;
  v_indicador record;
  v_nuevo_objetivo_id uuid;
  v_start_ts timestamptz := clock_timestamp();
BEGIN
  IF NOT public.es_maestro_de_clase(p_clase_id) THEN
    RAISE EXCEPTION 'SOI-CAT-01: el maestro actual no tiene acceso a la clase %', p_clase_id;
  END IF;

  SELECT cn.id, cn.activo INTO v_nivel
  FROM public.catalogo_niveles cn
  WHERE cn.id = p_nivel_id;

  IF v_nivel.id IS NULL OR v_nivel.activo IS NOT TRUE THEN
    RAISE EXCEPTION 'SOI-CAT-02: nivel de catálogo % no existe o está inactivo', p_nivel_id;
  END IF;

  v_maestro_id := public.maestro_actual();

  SELECT COALESCE(MAX(cmo.orden_objetivo), 0)
    INTO v_next_orden_objetivo
  FROM public.clase_mapa_objetivos cmo
  WHERE cmo.clase_id = p_clase_id AND cmo.level_id = p_nivel_id;

  FOR v_objetivo IN
    SELECT og.id, og.nombre, og.descripcion
    FROM public.catalogo_objetivos_generales og
    WHERE og.nivel_id = p_nivel_id
      AND og.activo = true
      AND (p_objetivo_general_ids IS NULL OR og.id = ANY (p_objetivo_general_ids))
    ORDER BY og.orden
  LOOP
    v_next_orden_objetivo := v_next_orden_objetivo + 1;

    INSERT INTO public.clase_mapa_objetivos (
      clase_id, level_id, origen_objetivo_id,
      nombre, descripcion, orden_objetivo, created_by
    ) VALUES (
      p_clase_id, p_nivel_id, v_objetivo.id,
      v_objetivo.nombre, v_objetivo.descripcion, v_next_orden_objetivo, v_maestro_id
    )
    RETURNING id INTO v_nuevo_objetivo_id;

    FOR v_indicador IN
      SELECT oe.id, oe.nombre
      FROM public.catalogo_objetivos_especificos oe
      WHERE oe.objetivo_general_id = v_objetivo.id
        AND oe.activo = true
      ORDER BY oe.orden
    LOOP
      -- orden_indicador se omite: fn_asignar_id_jerarquico() lo autogenera.
      INSERT INTO public.clase_mapa_indicadores (
        objetivo_id, origen_indicator_id, descripcion
      ) VALUES (
        v_nuevo_objetivo_id, v_indicador.id, v_indicador.nombre
      );
    END LOOP;
  END LOOP;

  RETURN QUERY
  SELECT cmo.id, cmo.origen_objetivo_id, cmi.id, cmi.origen_indicator_id
  FROM public.clase_mapa_objetivos cmo
  LEFT JOIN public.clase_mapa_indicadores cmi ON cmi.objetivo_id = cmo.id
  WHERE cmo.clase_id = p_clase_id
    AND cmo.created_at >= v_start_ts;
END;
$$;

GRANT EXECUTE ON FUNCTION public.clonar_catalogo_a_clase(uuid, uuid, uuid[]) TO authenticated;

-- ============================================================================
-- DOWN
-- ============================================================================
-- GRANT/función/RPC nueva y tablas nuevas: ver DROP correspondientes.
-- Los ALTER de FK en clase_mapa_objetivos/clase_mapa_indicadores NO tienen
-- rollback automático seguro (dependen de que levels/nodes/objetivos/
-- indicators sigan existiendo con los mismos IDs) — revertir manualmente si
-- hace falta.
-- ============================================================================
