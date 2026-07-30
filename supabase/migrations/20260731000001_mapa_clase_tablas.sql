-- ============================================================================
-- MAPA GAMIFICADO DE PLANIFICACIÓN — Tablas base class-owned (Tarea 1.1)
-- Fecha: 2026-07-31
-- Contexto (openspec/changes/mapa-gamificado-planificacion/design.md, Decisión 1):
--   El árbol curricular global (routes → route_versions → blocks → levels →
--   nodes → objetivos → indicators) sigue siendo el catálogo de solo lectura
--   curado por ACM. El mapa que cada maestro diseña para SU clase es una copia
--   clonada, propiedad de esa clase — nunca comparte filas entre clases. Estas
--   dos tablas nuevas son ese árbol class-owned, con puntero opcional
--   (`origen_*`) al nodo/objetivo/indicador global del que se clonaron
--   (NULL = autoría 100% del maestro, sin plantilla de origen).
--
--   `clase_id` se denormaliza en `clase_mapa_indicadores` a propósito: la
--   política RLS se evalúa fila por fila y un JOIN al padre por fila es caro.
--   La coherencia de esa denormalización la garantiza un trigger que se agrega
--   en la migración 20260731000002_mapa_clase_id_jerarquico.sql (Tarea 1.2),
--   junto con los triggers que materializan y protegen `id_jerarquico`.
--
-- BUG CRÍTICO ya documentado en design.md que este cambio corrige en la
-- migración 20260731000003 (Tarea 1.3, fuera de este archivo): las políticas
-- actuales de `evaluacion_indicador` comparan `evaluado_por = auth.uid()`,
-- pero `evaluado_por` es FK a `maestros(id)` y `auth.uid()` es el id de
-- `auth.users` — nunca coinciden. Los helpers de este archivo ya usan el
-- patrón correcto (`maestro_actual()`), consistente con `20260516_permisos_maestros.sql`.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. HELPERS RLS — dos, no uno: diseño (solo titular) vs sesión (titular+suplente)
--    (openspec design.md, sección "RLS concreta (REQ-13)")
-- ----------------------------------------------------------------------------

-- Diseño de estructura (Diseñar Ruta): SOLO el titular. El suplente no
-- reestructura el mapa de otro maestro.
CREATE OR REPLACE FUNCTION public.es_maestro_titular_de_clase(p_clase_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clases c
    WHERE c.id = p_clase_id
      AND public.maestro_actual() IS NOT NULL
      AND public.maestro_actual() IN (c.maestro_principal_id, c.maestro_id)
  );
$$;

-- Sesión (Dar Clase: calificar + bitácora): titular O suplente.
CREATE OR REPLACE FUNCTION public.es_maestro_de_clase(p_clase_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clases c
    WHERE c.id = p_clase_id
      AND public.maestro_actual() IS NOT NULL
      AND public.maestro_actual() IN (c.maestro_principal_id, c.maestro_suplente_id, c.maestro_id)
  );
$$;

GRANT EXECUTE ON FUNCTION public.es_maestro_titular_de_clase(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.es_maestro_de_clase(uuid) TO authenticated;

-- ----------------------------------------------------------------------------
-- 2. TABLA: clase_mapa_objetivos
--    Objetivos del árbol clonado por clase. `orden_objetivo` es el tramo 2 del
--    ID jerárquico y es INMUTABLE una vez asignado (protegido por trigger en
--    la migración 20260731000002). `order_index` es libre de reordenar.
-- ----------------------------------------------------------------------------

CREATE TABLE public.clase_mapa_objetivos (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clase_id           uuid NOT NULL REFERENCES public.clases(id)   ON DELETE CASCADE,
  level_id           uuid NOT NULL REFERENCES public.levels(id)   ON DELETE RESTRICT, -- clasificación, no contenido
  origen_node_id     uuid          REFERENCES public.nodes(id)     ON DELETE SET NULL, -- categoría técnica (Escalas, Arco…)
  origen_objetivo_id uuid          REFERENCES public.objetivos(id) ON DELETE SET NULL, -- NULL = autoría 100% del maestro
  nombre             text NOT NULL,
  descripcion        text,
  orden_objetivo     integer NOT NULL,                 -- tramo 2 del ID jerárquico. INMUTABLE.
  order_index        integer NOT NULL DEFAULT 0,       -- orden visual. Libre de reordenar.
  archived_at        timestamptz,
  created_by         uuid NOT NULL REFERENCES public.maestros(id),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (clase_id, level_id, orden_objetivo)
);

-- ----------------------------------------------------------------------------
-- 3. TABLA: clase_mapa_indicadores
--    `id_jerarquico` ('2.1.3') se materializa en la migración 20260731000002
--    vía trigger BEFORE INSERT; acá solo se declara la columna.
-- ----------------------------------------------------------------------------

CREATE TABLE public.clase_mapa_indicadores (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objetivo_id         uuid NOT NULL REFERENCES public.clase_mapa_objetivos(id) ON DELETE RESTRICT,
  clase_id            uuid NOT NULL REFERENCES public.clases(id) ON DELETE CASCADE, -- denormalizado: RLS sin JOIN
  origen_indicator_id uuid          REFERENCES public.indicators(id) ON DELETE SET NULL,
  descripcion         text NOT NULL,
  orden_indicador     integer NOT NULL,                -- tramo 3 del ID jerárquico. INMUTABLE.
  order_index         integer NOT NULL DEFAULT 0,
  es_requerido        boolean NOT NULL DEFAULT true,
  id_jerarquico       text NOT NULL,                   -- '2.1.3' materializado por trigger
  archived_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (objetivo_id, orden_indicador),
  UNIQUE (clase_id, id_jerarquico)
);

-- ----------------------------------------------------------------------------
-- 4. ÍNDICES (mismo patrón de la tabla: idx_<abrev>_<columna>)
-- ----------------------------------------------------------------------------

CREATE INDEX idx_cmo_clase ON public.clase_mapa_objetivos(clase_id);
CREATE INDEX idx_cmo_level ON public.clase_mapa_objetivos(level_id);
CREATE INDEX idx_cmo_origen_node ON public.clase_mapa_objetivos(origen_node_id);
CREATE INDEX idx_cmo_origen_objetivo ON public.clase_mapa_objetivos(origen_objetivo_id);

CREATE INDEX idx_cmi_objetivo ON public.clase_mapa_indicadores(objetivo_id);
CREATE INDEX idx_cmi_clase ON public.clase_mapa_indicadores(clase_id);
CREATE INDEX idx_cmi_origen_indicator ON public.clase_mapa_indicadores(origen_indicator_id);

-- ----------------------------------------------------------------------------
-- 5. TRIGGERS updated_at (mismo patrón que update_ccp_timestamp / update_ei_timestamp)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_cmo_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cmo_updated_at
  BEFORE UPDATE ON public.clase_mapa_objetivos
  FOR EACH ROW EXECUTE FUNCTION public.update_cmo_timestamp();

CREATE OR REPLACE FUNCTION public.update_cmi_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cmi_updated_at
  BEFORE UPDATE ON public.clase_mapa_indicadores
  FOR EACH ROW EXECUTE FUNCTION public.update_cmi_timestamp();

-- ----------------------------------------------------------------------------
-- 6. RLS — owner: SOLO el titular puede leer/escribir la estructura del mapa
--    de su clase (diseño). Ver design.md tabla RLS: el modo Sesión (titular +
--    suplente) aplica a evaluacion_indicador y sesion_bitacora, no a estas
--    tablas de estructura.
-- ----------------------------------------------------------------------------

ALTER TABLE public.clase_mapa_objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clase_mapa_indicadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clase_mapa_objetivos_owner" ON public.clase_mapa_objetivos
  FOR ALL TO authenticated
  USING (public.es_admin() OR public.es_maestro_titular_de_clase(clase_id))
  WITH CHECK (public.es_admin() OR public.es_maestro_titular_de_clase(clase_id));

CREATE POLICY "clase_mapa_indicadores_owner" ON public.clase_mapa_indicadores
  FOR ALL TO authenticated
  USING (public.es_admin() OR public.es_maestro_titular_de_clase(clase_id))
  WITH CHECK (public.es_admin() OR public.es_maestro_titular_de_clase(clase_id));

-- ============================================================================
-- DOWN
-- ============================================================================
-- DROP POLICY IF EXISTS "clase_mapa_indicadores_owner" ON public.clase_mapa_indicadores;
-- DROP POLICY IF EXISTS "clase_mapa_objetivos_owner" ON public.clase_mapa_objetivos;
-- DROP TRIGGER IF EXISTS trg_cmi_updated_at ON public.clase_mapa_indicadores;
-- DROP TRIGGER IF EXISTS trg_cmo_updated_at ON public.clase_mapa_objetivos;
-- DROP FUNCTION IF EXISTS public.update_cmi_timestamp();
-- DROP FUNCTION IF EXISTS public.update_cmo_timestamp();
-- DROP TABLE IF EXISTS public.clase_mapa_indicadores CASCADE;
-- DROP TABLE IF EXISTS public.clase_mapa_objetivos CASCADE;
-- DROP FUNCTION IF EXISTS public.es_maestro_de_clase(uuid);
-- DROP FUNCTION IF EXISTS public.es_maestro_titular_de_clase(uuid);
-- ============================================================================
