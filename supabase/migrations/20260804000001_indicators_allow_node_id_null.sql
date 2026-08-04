-- DROP NOT NULL en indicators.node_id para permitir indicadores de clase
-- (sin ruta institucional) generados por el Diseñador Curricular.
-- La RPC fn_sincronizar_arbol_curricular inserta indicadores con node_id NULL
-- porque pertenecen al plan de una clase, no a una route_version.
-- Los 4163 indicadores existentes ya tienen node_id NO NULL → sin impacto.

ALTER TABLE public.indicators ALTER COLUMN node_id DROP NOT NULL;
