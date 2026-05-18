-- DEPRECATED: plan_* tables replaced by routes hierarchy (curriculo-institucional)
-- These tables are read-only. Do not add new data. Will be dropped in a future migration.
COMMENT ON TABLE public.plan_clases IS 'DEPRECATED: usar routes/route_versions/blocks/levels/nodes/indicators';
COMMENT ON TABLE public.plan_niveles IS 'DEPRECATED: usar levels';
COMMENT ON TABLE public.plan_temas IS 'DEPRECATED: usar nodes';
COMMENT ON TABLE public.plan_objetivos IS 'DEPRECATED: usar indicators';
COMMENT ON TABLE public.plan_indicadores IS 'DEPRECATED: usar indicators';
COMMENT ON TABLE public.planificacion_nodos IS 'DEPRECATED: usar routes hierarchy';
